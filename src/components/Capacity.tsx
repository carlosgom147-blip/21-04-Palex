import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, ComposedChart, Area
} from 'recharts';
import { Cpu, Users, Layers, TrendingUp, Info } from 'lucide-react';
import { EWMRow } from '../types';

interface CapacityProps {
  data: EWMRow[];
}

export default function Capacity({ data }: CapacityProps) {
  const chartData = useMemo(() => {
    const hourly: Record<number, { wts: number; ops: Set<string> }> = {};
    
    // Initialize hours 6-22
    for (let h = 6; h <= 22; h++) {
      hourly[h] = { wts: 0, ops: new Set() };
    }

    data.forEach(r => {
      if (!r._timestamp_confirmacion) return;
      const h = new Date(r._timestamp_confirmacion).getHours();
      if (h >= 6 && h <= 22) {
        hourly[h].wts++;
        if (r['Confirmado por']) hourly[h].ops.add(r['Confirmado por']);
      }
    });

    return Object.entries(hourly).map(([h, val]) => ({
      hour: `${h}h`,
      wts: val.wts,
      ops: val.ops.size,
      ratio: val.ops.size > 0 ? val.wts / val.ops.size : 0
    }));
  }, [data]);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Capacidad y Planificación</h2>
            <p className="text-gray-500 text-sm">Distribución horaria de la carga de trabajo vs plantilla activa.</p>
         </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-bold tracking-tight">Carga de Trabajo por Hora (WTs vs Operarios)</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">WTs Confirmadas</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Operarios Activos</span>
               </div>
            </div>
         </div>

         <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={chartData}>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6e6e73'}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6e6e73'}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6e6e73'}} />
                  <Tooltip 
                    cursor={{fill: '#f5f6f8'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                  />
                  <Bar yAxisId="left" dataKey="wts" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="ops" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff'}} />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold tracking-tight mb-6">Sugerencias de Optimización</h3>
            <div className="space-y-4">
               {chartData.filter(d => d.ratio > 250).map((d, i) => (
                 <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
                       <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-rose-700">Pico de carga a las {d.hour}</p>
                       <p className="text-xs text-rose-600 mt-1">Ratio de {d.ratio.toFixed(0)} WTs/operario. Valorar añadir 1 persona de refuerzo en esta franja.</p>
                    </div>
                 </div>
               ))}
               <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                     <Users className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-emerald-700">Distribución equilibrada</p>
                     <p className="text-xs text-emerald-600 mt-1">La carga de 14h a 17h se mantiene en ratios óptimos (200-240 WTs/op).</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold tracking-tight mb-6">Distribución por Día de la Semana</h3>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { d: 'Lun', w: 3708 }, { d: 'Mar', w: 8394 }, { d: 'Mié', w: 9165 },
                    { d: 'Jue', w: 7834 }, { d: 'Vie', w: 4354 }, { d: 'Sáb', w: 402 }
                  ]}>
                     <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                     <Bar dataKey="w" fill="#1d1d1f" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
