import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Euro, Clock, Info, AlertTriangle, TrendingUp, 
  ArrowDownCircle, UserCircle, User
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

import { OperatorStats, EWMRow } from '../types';
import { COLORS } from '../constants';
import { cn } from '../lib/utils';

interface CostsProps {
  data: EWMRow[];
  operators: OperatorStats[];
  costPerHour: number;
  setCostPerHour: (value: number) => void;
}

export default function Costs({ data, operators, costPerHour, setCostPerHour }: CostsProps) {
  
  const totals = useMemo(() => {
    const totalGapHours = operators.reduce((acc, op) => acc + op.gap_total_h, 0);
    const totalWaitHours = operators.reduce((acc, op) => acc + (op.espera_media_min * op.wts_totales / 60), 0); 
    // Note: totalWaitHours is an estimation based on per-op average, 
    // better to sum all individual WT espera_seg from data if possible.
    
    return {
      gapHours: totalGapHours,
      gapCost: totalGapHours * costPerHour,
      waitHours: totalWaitHours,
      waitCost: totalWaitHours * costPerHour,
      totalCost: (totalGapHours + totalWaitHours) * costPerHour
    };
  }, [operators, costPerHour]);

  const sortedByLoss = useMemo(() => {
    return [...operators]
      .map(op => {
        const opWaitH = (op.espera_media_min * op.wts_totales) / 60;
        return {
          id: op.id,
          gapH: op.gap_total_h,
          gapCost: op.gap_total_h * costPerHour,
          waitH: opWaitH,
          waitCost: opWaitH * costPerHour,
          total: (op.gap_total_h + opWaitH) * costPerHour
        };
      })
      .sort((a,b) => b.total - a.total);
  }, [operators, costPerHour]);

  return (
    <div className="space-y-8">
      {/* Header & Configuration */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-[24px] flex items-center justify-center">
            <Euro className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Cálculo de Sobrecostes por Ineficiencia</h2>
            <p className="text-gray-500 max-w-md">Análisis de la pérdida económica derivada de tiempos muertos y esperas en cola.</p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coste operativo (€ / hora)</label>
          <div className="relative group">
             <input 
               type="number" 
               value={costPerHour}
               onChange={(e) => setCostPerHour(Number(e.target.value))}
               className="w-32 bg-gray-100 border-none rounded-2xl py-4 px-6 text-2xl font-bold text-center focus:ring-4 ring-rose-100 transition-all outline-none"
             />
             <div className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
               €
             </div>
          </div>
        </div>
      </div>

      {/* Main Totals Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-7 rounded-[28px] shadow-sm border border-gray-100"
        >
           <div className="flex items-center gap-3 mb-4 text-rose-600">
             <Clock className="w-5 h-5" />
             <h3 className="text-[11px] font-bold uppercase tracking-widest">Coste GAP (Operario)</h3>
           </div>
           <div className="space-y-1">
             <p className="text-3xl font-bold tracking-tight">−{totals.gapCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</p>
             <p className="text-sm text-gray-400 font-medium">{totals.gapHours.toFixed(1)} horas acumuladas por el equipo</p>
           </div>
           <div className="mt-8 flex items-center gap-2 p-3 bg-rose-50 rounded-xl">
             <AlertTriangle className="w-4 h-4 text-rose-500" />
             <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Responsabilidad Operario</span>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-7 rounded-[28px] shadow-sm border border-gray-100"
        >
           <div className="flex items-center gap-3 mb-4 text-rose-700">
             <ArrowDownCircle className="w-5 h-5" />
             <h3 className="text-[11px] font-bold uppercase tracking-widest">Coste Espera (Sistema)</h3>
           </div>
           <div className="space-y-1">
             <p className="text-3xl font-bold tracking-tight">−{totals.waitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</p>
             <p className="text-sm text-gray-400 font-medium">{totals.waitHours.toFixed(1)} h estimadas por retraso en cola SAP</p>
           </div>
           <div className="mt-8 flex items-center gap-2 p-3 bg-rose-50 rounded-xl">
             <Info className="w-4 h-4 text-rose-500" />
             <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Responsabilidad Planificación</span>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#e8231a] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden"
        >
           <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
           <div className="relative z-10 flex flex-col justify-between h-full">
             <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2">Pérdida Económica Total</h3>
             <div>
               <p className="text-5xl font-black tracking-tighter mb-2">−{totals.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0 })}€</p>
               <p className="text-white/70 text-sm font-medium">Impacto directo sobre rentabilidad del servicio</p>
             </div>
             <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 w-fit">
                <TrendingUp className="w-4 h-4 text-rose-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Anualizar impacto potencial</span>
             </div>
           </div>
        </motion.div>
      </div>

      {/* Comparison Chart and Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
           <h3 className="text-sm font-bold tracking-tight mb-8">Pérdida Acumulada por Operario</h3>
           <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={sortedByLoss.slice(0, 10)} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis dataKey="id" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700}} width={60} />
                 <Tooltip 
                    cursor={{fill: '#fef2f2'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} 
                    formatter={(value: any) => [`−${Number(value).toFixed(2)} €`, 'Pérdida']}
                 />
                 <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                   {sortedByLoss.map((entry, index) => (
                     <Cell key={index} fill={index === 0 ? '#e8231a' : '#fda4af'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-0 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
           <div className="p-8 border-b border-gray-100">
              <h3 className="text-sm font-bold tracking-tight">Desglose Detallado por Persona</h3>
           </div>
           <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-8 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID</th>
                    <th className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gap (h)</th>
                    <th className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Coste Gap</th>
                    <th className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right pr-8">Pérdida Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedByLoss.map(op => (
                    <tr key={op.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold">{op.id}</div>
                           <span className="text-sm font-bold">{op.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-500">{op.gapH.toFixed(2)}h</td>
                      <td className="px-4 py-4 text-sm font-bold text-rose-600">−{op.gapCost.toFixed(2)}€</td>
                      <td className="px-4 py-4 text-right pr-8">
                         <span className="text-sm font-black text-rose-700">−{op.total.toFixed(2)}€</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
