import React, { useMemo } from 'react';
import { 
  Map, Info, AlertCircle, TrendingDown, Clock, 
  ChevronRight, ArrowRight, MousePointer2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { OperatorStats, EWMRow } from '../types';
import { cn } from '../lib/utils';
import { COLORS } from '../constants';

interface RoutesProps {
  data: EWMRow[];
  operators: OperatorStats[];
}

export default function Routes({ data, operators }: RoutesProps) {
  const sortedByZigzag = useMemo(() => {
    return [...operators]
      .filter(op => op.wts_totales > 50) // Filter residuals
      .sort((a,b) => b.zigzag_pct - a.zigzag_pct);
  }, [operators]);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Análisis de Rutas y Eficiencia</h2>
            <p className="text-gray-500 text-sm">Detección de zigzags y optimización de recorrido de picking.</p>
         </div>
      </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
             <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold tracking-tight mb-8">Ranking de Ineficiencia (Tasa Zigzag)</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedByZigzag} margin={{left: 40}}>
                      <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700}} />
                      <YAxis hide />
                      <Tooltip 
                         cursor={{fill: '#f5f6f8'}} 
                         contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                         formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Tasa Zigzag']}
                      />
                      <Bar dataKey="zigzag_pct" radius={[8, 8, 0, 0]}>
                        {sortedByZigzag.map((entry, index) => (
                          <Cell key={index} fill={entry.zigzag_pct > 15 ? '#e8231a' : '#e5e7eb'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-6 rounded-[28px] border border-emerald-100">
                   <div className="flex items-center gap-3 mb-4 text-emerald-600">
                      <TrendingDown className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Mejor Eficiencia</span>
                   </div>
                   <p className="text-3xl font-bold tracking-tight text-emerald-700">IL4</p>
                   <p className="text-sm text-emerald-600 font-medium">Solo 6.0% de zigzags en 3 días.</p>
                </div>
                <div className="bg-rose-50 p-6 rounded-[28px] border border-rose-100">
                   <div className="flex items-center gap-3 mb-4 text-rose-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Revisión Requerida</span>
                   </div>
                   <p className="text-3xl font-bold tracking-tight text-rose-700">IL6</p>
                   <p className="text-sm text-rose-600 font-medium">21.5% de zigzags registrados.</p>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-black text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden h-full">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#aeaeb2] mb-8">Definición de Zigzag</h3>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-amber-400 font-bold">1</div>
                      <p className="text-sm text-gray-300 leading-relaxed">Operario entra en un pasillo A para recoger Producto #1.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-amber-400 font-bold">2</div>
                      <p className="text-sm text-gray-300 leading-relaxed">Sale del pasillo A para ir al pasillo B por Producto #2.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-amber-400 font-bold">3</div>
                      <p className="text-sm text-gray-300 leading-relaxed font-bold text-white">Vuelve inmediatamente al pasillo A para Producto #3.</p>
                   </div>
                   <div className="pt-8 border-t border-white/10">
                      <p className="text-xs text-gray-400 italic">Este comportamiento indica una mala agrupación de tareas por parte de SAP o falta de planificación en la ruta.</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
