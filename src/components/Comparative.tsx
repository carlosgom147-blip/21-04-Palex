import React from 'react';
import { 
  ArrowLeftRight, TrendingUp, TrendingDown, Minus, 
  ChevronRight, Calendar, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { KPIStats, EWMRow } from '../types';

interface ComparativeProps {
  data: EWMRow[];
}

const TrendCard = ({ title, current, previous, isBetterIfLower = false }: { title: string; current: string; previous: string; isBetterIfLower?: boolean }) => {
  const cVal = parseFloat(current.replace(/[^0-9.-]+/g,""));
  const pVal = parseFloat(previous.replace(/[^0-9.-]+/g,""));
  const diff = cVal - pVal;
  const pct = pVal !== 0 ? (diff / pVal) * 100 : 0;
  
  const isImprovement = isBetterIfLower ? diff < 0 : diff > 0;
  
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      <div className="flex items-end justify-between">
        <div>
           <p className="text-2xl font-bold tracking-tight">{current}</p>
           <p className="text-xs text-gray-400 mt-1 font-medium">vs {previous} prev.</p>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1",
          isImprovement ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {isImprovement ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(pct).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default function Comparative({ data }: ComparativeProps) {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Análisis Comparativo</h2>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase text-gray-500 border border-gray-200">
               Mes Actual vs Anterior
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <TrendCard title="WTs Confirmadas" current="33,857" previous="29,402" />
         <TrendCard title="Unidades Movidas" current="755,553" previous="680,201" />
         <TrendCard title="Tiempo Medio Pick" current="65.4s" previous="68.2s" isBetterIfLower />
         <TrendCard title="Lead Time Medio" current="4.0h" previous="4.2h" isBetterIfLower />
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden relative">
         <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-gray-50/50 to-transparent" />
         <div className="relative z-10">
            <h3 className="text-sm font-bold tracking-tight mb-8">Tendencia de Productividad Global</h3>
            <div className="h-[300px] flex items-end gap-1 px-4">
               {/* Simulating a sparkline with divs for visual effect in this turn */}
               {Array.from({length: 30}).map((_, i) => {
                 const h = 40 + Math.random() * 60;
                 return (
                   <div 
                    key={i} 
                    className={cn(
                      "flex-1 rounded-t-[4px] transition-all hover:bg-[#1c7ed6]",
                      i === 29 ? "bg-[#1c7ed6]" : "bg-gray-100"
                    )}
                    style={{ height: `${h}%` }}
                   />
                 );
               })}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
               <span>Hace 30 días</span>
               <span>Hoy</span>
            </div>
         </div>
      </div>
    </div>
  );
}
