/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Euro, Bell, Package, Map, Cpu, ArrowLeftRight, Database, 
  Upload, Search, Filter, Warehouse, TrendingUp, AlertTriangle, CheckCircle2,
  Sparkles, ChevronRight, X
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { cn } from './lib/utils';
import { COLORS, STORAGE_KEY, COSTE_HORA_DEFAULT, ALMACENES } from './constants';
import { EWMRow, DashboardState, KPIStats } from './types';
import { processRows, calculateKPIs, calculateOperatorStats } from './services/ewmService';

// Sections (to be implemented next)
import Summary from './components/Summary';
import Operators from './components/Operators';
import Costs from './components/Costs';
import Alerts from './components/Alerts';
import Orders from './components/Orders';
import Routes from './components/Routes';
import Capacity from './components/Capacity';
import Comparative from './components/Comparative';
import DataView from './components/DataView';
import AIAdvisor from './components/AIAdvisor';

const TABS = [
  { id: 'RESUMEN', icon: BarChart3, label: 'Resumen' },
  { id: 'OPERARIOS', icon: Users, label: 'Operarios' },
  { id: 'COSTES', icon: Euro, label: 'Costes' },
  { id: 'ALERTAS', icon: Bell, label: 'Alertas' },
  { id: 'PEDIDOS', icon: Package, label: 'Pedidos' },
  { id: 'RUTAS', icon: Map, label: 'Rutas' },
  { id: 'CAPACIDAD', icon: Cpu, label: 'Capacidad' },
  { id: 'COMPARATIVA', icon: ArrowLeftRight, label: 'Comparativa' },
  { id: 'DATOS', icon: Database, label: 'Datos' },
];

function excelTimeToString(value: any) {
  if (typeof value === 'number') {
    const totalSeconds = Math.round(value * 86400);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return String(value ?? '00:00:00');
}

export default function App() {
  const [activeTab, setActiveTab] = useState('RESUMEN');
  const [state, setState] = useState<DashboardState>({
    data: [],
    kpis: null,
    operators: [],
    almacenInfo: {},
    coste_hora: COSTE_HORA_DEFAULT,
    lastUpdate: null,
    filters: {
      dateRange: [null, null],
      almacen: 'ALL',
      operario: [],
      cola: [],
      actividad: [],
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const rawData = JSON.parse(saved);
        if (Array.isArray(rawData) && rawData.length > 0) {
          updateDashboard(rawData);
        }
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
  }, []);

  const updateDashboard = (rawData: EWMRow[]) => {
    const processed = processRows(rawData);
    const kpis = calculateKPIs(processed);
    
    // Calculate operator stats
    const opIds = Array.from(new Set(processed.map(r => r['Confirmado por']).filter(Boolean)));
    const operators = opIds.map(id => calculateOperatorStats(processed, id as string));

    setState(prev => ({
      ...prev,
      data: processed,
      kpis,
      operators,
      lastUpdate: new Date().toLocaleDateString(),
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);
        
        // Convert date and time objects correctly
        const data = rawJson.map(row => {
          const newRow = { ...row };
          
          // Date columns
          const dateCols = ['Fecha confirmación', 'Fecha inicio', 'Fecha de creación', 'Fecha de entrada de mercancías'];
          dateCols.forEach(col => {
            if (newRow[col] !== undefined && newRow[col] !== null) {
              const val = newRow[col];
              if (val instanceof Date) {
                newRow[col] = val.toISOString();
              } else {
                newRow[col] = String(val);
              }
            }
          });

          // Time columns
          const timeCols = ['Hora de confirmación', 'Hora inicio', 'Hora de creación'];
          timeCols.forEach(col => {
            if (newRow[col] !== undefined && newRow[col] !== null) {
              newRow[col] = excelTimeToString(newRow[col]);
            }
          });

          return newRow;
        });
        
        // Deduplicate
        const existingIds = new Set(state.data.map(r => r['Tarea de almacén']));
        const newData = (data as any[]).filter(r => !existingIds.has(r['Tarea de almacén']));
        
        const combined = [...state.data, ...newData];
        updateDashboard(combined);
        
        // Persist
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
        } catch (e) {
          console.warn("Storage limit reached", e);
        }
        
        setIsLoading(false);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Upload error", error);
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let d = state.data;
    if (state.filters.almacen !== 'ALL') {
      d = d.filter(r => r._almacen === state.filters.almacen);
    }
    // Add other filters as needed
    return d;
  }, [state.data, state.filters]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    return calculateKPIs(filteredData);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#1d1d1f] font-sans selection:bg-[#0071e3]/10">
      {/* Header / Navbar */}
      <nav className="navbar justify-between">
        <div className="flex items-center">
          <div className="bg-[#e8231a] text-white px-3 py-1 rounded-full text-sm font-extrabold tracking-tighter">ILS</div>
          <div className="text-[#0071e3] font-bold text-sm ml-2.5">Palex Medical</div>
          <div className="h-6 w-[1px] bg-gray-200 mx-6"></div>
          
          <div className="nav-pills overflow-x-auto no-scrollbar max-w-[500px]">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "nav-tab whitespace-nowrap",
                  activeTab === tab.id && "active"
                )}
              >
                {tab.label.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {state.kpis && (
            <div className="flex items-center bg-[#e6fcf5] text-[#0ca678] text-[11px] font-bold px-3 py-1.5 rounded-full">
              DRIVE · {state.kpis.wts_confirmadas.toLocaleString()} WTs
            </div>
          )}
          
          <label className="bg-black text-white text-[12px] font-medium px-5 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
            Cargar Excel
            <input type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6">
        <AnimatePresence mode="wait">
          {!state.data.length ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl mb-8">
                <Database className="w-10 h-10 text-gray-300" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">EWM Dashboard · ILS Palex</h1>
              <p className="text-gray-500 max-w-sm mb-8">
                Sube tu primer informe de tareas confirmadas en SAP EWM para visualizar el rendimiento del almacén.
              </p>
              <label className="px-8 py-3 bg-black text-white rounded-2xl font-semibold cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3">
                <Upload className="w-5 h-5" />
                Empezar carga de datos
                <input type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" />
              </label>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'RESUMEN' && <Summary kpis={stats} data={filteredData} />}
              {activeTab === 'OPERARIOS' && <Operators operators={state.operators} data={filteredData} />}
              {activeTab === 'COSTES' && <Costs data={filteredData} operators={state.operators} costPerHour={state.coste_hora} setCostPerHour={(v) => setState(s => ({ ...s, coste_hora: v }))} />}
              {activeTab === 'ALERTAS' && <Alerts kpis={stats} operators={state.operators} />}
              {activeTab === 'PEDIDOS' && <Orders data={filteredData} />}
              {activeTab === 'RUTAS' && <Routes data={filteredData} operators={state.operators} />}
              {activeTab === 'CAPACIDAD' && <Capacity data={filteredData} />}
              {activeTab === 'COMPARATIVA' && <Comparative data={filteredData} />}
              {activeTab === 'DATOS' && <DataView data={state.data} />}
              
              {/* Floating AI Advisor Button or Integrated Section */}
              <div className="fixed bottom-8 right-8 z-[100]">
                {activeTab !== 'RESUMEN' && (
                   <AIAdvisor kpis={stats} operators={state.operators} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Procesando datos SAP...</span>
          </div>
        </div>
      )}
    </div>
  );
}
