import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, TrendingDown, Clock, Package, ChevronRight, 
  Dna, Target, MapPin, Zap, Info, Calendar, RefreshCw, AlertCircle,
  Warehouse, Layers, Search, X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, LineChart, Line } from 'recharts';

import { OperatorStats, EWMRow } from '../types';
import { COLORS, OPERARIOS_ESPECIALES } from '../constants';
import { cn } from '../lib/utils';

interface OperatorsProps {
  operators: OperatorStats[];
  data: EWMRow[];
}

const StatMini = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) => (
  <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
    <div className={cn("p-2 rounded-xl", color)}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

export default function Operators({ operators: initialOperators, data }: OperatorsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const sortedOperators = useMemo(() => {
    return [...initialOperators]
      .filter(op => op.id.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b) => b.wts_totales - a.wts_totales);
  }, [initialOperators, search]);

  const selectedOp = useMemo(() => 
    initialOperators.find(o => o.id === selectedId), 
  [initialOperators, selectedId]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar operario por ID (IL1, IL2...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 ring-[#1c7ed6]/10 focus:border-[#1c7ed6] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
             <button className="px-4 py-2 text-xs font-bold rounded-lg bg-black text-white">Todos</button>
             <button className="px-4 py-2 text-xs font-bold rounded-lg text-gray-500 hover:text-black">Principales</button>
             <button className="px-4 py-2 text-xs font-bold rounded-lg text-gray-500 hover:text-black">Especiales</button>
          </div>
        </div>
      </div>

      {/* Operator Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4">
        {sortedOperators.map((op) => (
          <motion.button
            key={op.id}
            layoutId={`card-${op.id}`}
            onClick={() => setSelectedId(op.id === selectedId ? null : op.id)}
            whileHover={{ y: -4 }}
            className={cn(
              "p-5 rounded-[24px] text-left transition-all relative overflow-hidden",
              selectedId === op.id ? "bg-black text-white shadow-2xl" : "bg-white text-inherit border border-gray-100 shadow-sm hover:shadow-md"
            )}
          >
             <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold tracking-tight",
                  selectedId === op.id ? "bg-white/10" : "bg-gray-100"
                )}>
                  {op.id}
                </div>
                <div className="flex flex-col items-end">
                   <span className={cn(
                     "text-[9px] font-bold uppercase tracking-widest mb-1",
                     selectedId === op.id ? "text-gray-400" : "text-gray-400"
                   )}>Productividad</span>
                   <span className={cn(
                     "text-lg font-bold",
                     op.productividad_pct > 75 ? "text-emerald-500" : op.productividad_pct > 60 ? "text-amber-500" : "text-rose-500"
                   )}>
                     {op.productividad_pct.toFixed(1)}%
                   </span>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-[11px] font-medium opacity-70">WTs</span>
                   </div>
                   <span className="text-sm font-bold">{op.wts_totales.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-[11px] font-medium opacity-70">Media PICK</span>
                   </div>
                   <span className="text-sm font-bold">{op.exec_medio_seg.toFixed(1)}s</span>
                </div>
             </div>

             <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between">
               <div className="flex gap-1.5">
                  {op.almacenes.map(a => (
                    <div key={a} className={cn(
                      "w-4 h-4 rounded-full",
                      a === 'Z050' ? "bg-[#1d9e75]" : "bg-[#0071e3]"
                    )} title={a} />
                  ))}
               </div>
               <ChevronRight className={cn("w-4 h-4 opacity-30 transition-transform", selectedId === op.id && "rotate-90")} />
             </div>
          </motion.button>
        ))}
      </div>

      {/* Expanded Ficha */}
      <AnimatePresence>
        {selectedOp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 mt-8 space-y-10">
               {/* Ficha Header */}
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center text-2xl font-bold tracking-tight">
                      {selectedOp.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-bold tracking-tight">Operario {selectedOp.id}</h2>
                        <div className="px-3 py-1 bg-blue-50 text-[#1c7ed6] text-[10px] font-bold uppercase tracking-widest rounded-full">
                          Principal
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Calendar className="w-4 h-4" />
                          {selectedOp.dias_trabajados} días registrados
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Warehouse className="w-4 h-4" />
                          {selectedOp.almacenes.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedId(null)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
               </div>

               {/* Quick KPI Row */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <StatMini label="WTs Totales" value={selectedOp.wts_totales.toLocaleString()} icon={Layers} color="bg-blue-50 text-blue-600" />
                 <StatMini label="Unidades" value={selectedOp.unidades.toLocaleString()} icon={Package} color="bg-orange-50 text-orange-600" />
                 <StatMini label="Media Diario" value={`${selectedOp.wts_por_dia.toFixed(0)} WTs`} icon={RefreshCw} color="bg-purple-50 text-purple-600" />
                 <StatMini label="Productividad" value={`${selectedOp.productividad_pct.toFixed(1)}%`} icon={Target} color="bg-emerald-50 text-emerald-600" />
               </div>

               {/* Main Analysis Blocks */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Tiempos Muertos y Eficiencia */}
                  <div className="bg-gray-50/50 rounded-[24px] p-6 space-y-6">
                    <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                       <Clock className="w-4 h-4" />
                       Análisis de Tiempos
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ejecución (Productivo)</span>
                          <span className="text-xs font-bold text-emerald-600">MEDIA {selectedOp.exec_medio_seg.toFixed(1)}s</span>
                        </div>
                        <p className="text-lg font-bold mb-3">{selectedOp.exec_total_h.toFixed(1)}h acumuladas</p>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedOp.productividad_pct}%` }} />
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gap (Pérdida Operario)</span>
                          <span className="text-xs font-bold text-amber-600">MEDIA {selectedOp.gap_medio_seg.toFixed(1)}s</span>
                        </div>
                        <p className="text-lg font-bold">{selectedOp.gap_total_h.toFixed(1)}h acumuladas</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Espera Cola (Pérdida Sistema)</span>
                          <span className="text-xs font-bold text-rose-600">MEDIA {selectedOp.espera_media_min.toFixed(0)} min</span>
                        </div>
                        <p className="text-lg font-bold">Responsabilidad Planificación</p>
                      </div>
                    </div>
                  </div>

                  {/* Actividad y Rutas */}
                  <div className="bg-gray-50/50 rounded-[24px] p-6 space-y-6">
                    <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                       <MapPin className="w-4 h-4" />
                       Rutas y Ubicaciones
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasa de Zigzag</p>
                            <p className="text-xl font-bold">{selectedOp.zigzag_pct.toFixed(1)}%</p>
                         </div>
                         <div className={cn(
                           "p-2 rounded-xl",
                           selectedOp.zigzag_pct > 15 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                         )}>
                           <AlertCircle className="w-5 h-5" />
                         </div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-3">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Puntos de contacto</p>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Ubicaciones visitadas</span>
                            <span className="text-sm font-bold">{selectedOp.ubicaciones_distintas}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Productos tocados</span>
                            <span className="text-sm font-bold">{selectedOp.productos_distintos}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Pedidos finalizados</span>
                            <span className="text-sm font-bold">{selectedOp.pedidos_completados}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico horario */}
                  <div className="bg-gray-50/50 rounded-[24px] p-6 flex flex-col">
                    <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4" />
                       Rendimiento por Franja
                    </h3>
                    <div className="flex-1 w-full min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(selectedOp.horario_por_hora).map(([h, wts]) => ({ h: `${h}h`, wts }))}>
                          <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <Tooltip cursor={{fill: '#fff'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                          <Bar dataKey="wts" radius={[4, 4, 0, 0]} fill="#1d1d1f" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchIcon({ className, ...props }: any) {
  return (
    <Search className={className} {...props} />
  );
}
