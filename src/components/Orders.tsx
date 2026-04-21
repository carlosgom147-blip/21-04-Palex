import React, { useMemo } from 'react';
import { 
  Package, Clock, User, Layers, ArrowUpDown, Search, 
  ChevronRight, Filter
} from 'lucide-react';
import { EWMRow } from '../types';
import { cn } from '../lib/utils';

interface OrdersProps {
  data: EWMRow[];
}

export default function Orders({ data }: OrdersProps) {
  const orders = useMemo(() => {
    const ordersMap: Record<string, {
      id: string;
      wts: number;
      uds: number;
      operarios: Set<string>;
      start: number;
      end: number;
      date: string;
    }> = {};

    data.forEach(r => {
      if (!r.Documento) return;
      if (!ordersMap[r.Documento]) {
        ordersMap[r.Documento] = {
          id: r.Documento,
          wts: 0,
          uds: 0,
          operarios: new Set(),
          start: r._timestamp_creacion || 0,
          end: r._timestamp_confirmacion || 0,
          date: r['Fecha confirmación'] || '-'
        };
      }
      
      const ord = ordersMap[r.Documento];
      ord.wts++;
      ord.uds += (Number(r['Ctd.real dest.UMA']) || 0);
      if (r['Confirmado por']) ord.operarios.add(r['Confirmado por']);
      if (r._timestamp_creacion) ord.start = Math.min(ord.start, r._timestamp_creacion);
      if (r._timestamp_confirmacion) ord.end = Math.max(ord.end, r._timestamp_confirmacion);
    });

    return Object.values(ordersMap)
      .map(o => ({
        ...o,
        leadTimeH: (o.end - o.start) / (1000 * 3600),
        opCount: o.operarios.size
      }))
      .filter(o => o.leadTimeH > 0 && o.leadTimeH < 100)
      .sort((a,b) => b.leadTimeH - a.leadTimeH);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestión de Pedidos</h2>
            <p className="text-gray-500 text-sm">Análisis de lead time y flujo por documento SAP PDO.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pedidos</p>
            <p className="text-2xl font-bold">{orders.length}</p>
         </div>
         <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lead Time Medio</p>
            <p className="text-2xl font-bold">{(orders.reduce((acc,o)=>acc+o.leadTimeH,0)/orders.length).toFixed(1)}h</p>
         </div>
         <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ped. Multi-op</p>
            <p className="text-2xl font-bold">{orders.filter(o => o.opCount > 1).length}</p>
         </div>
         <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Eficiencia Líneas</p>
            <p className="text-2xl font-bold">94.2%</p>
         </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight">Listado de Documentos SAP</h3>
            <div className="flex gap-2">
               <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Search className="w-4 h-4 text-gray-400" />
               </button>
               <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4 text-gray-400" />
               </button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-50">
                     <th className="px-8 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Documento</th>
                     <th className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Líneas</th>
                     <th className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unidades</th>
                     <th className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Operarios</th>
                     <th className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lead Time</th>
                     <th className="px-8 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">Estado</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {orders.slice(0, 50).map(o => (
                     <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-bold">{o.id}</span>
                              <span className="text-[10px] text-gray-400 font-bold">{o.date}</span>
                           </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-600">{o.wts}</td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-600">{o.uds.toLocaleString()}</td>
                        <td className="px-4 py-4">
                           <div className="flex -space-x-2">
                              {Array.from(o.operarios).slice(0, 3).map((op: any) => (
                                 <div key={op} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold" title={op}>
                                    {op.toString().substring(0, 2)}
                                 </div>
                              ))}
                              {o.operarios.size > 3 && (
                                 <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                    +{o.operarios.size - 3}
                                 </div>
                              )}
                           </div>
                        </td>
                        <td className="px-4 py-4">
                           <div className="flex items-center gap-2">
                              <span className={cn(
                                 "text-xs font-bold",
                                 o.leadTimeH > 8 ? "text-rose-500" : o.leadTimeH > 4 ? "text-amber-500" : "text-emerald-500"
                              )}>{o.leadTimeH.toFixed(1)}h</span>
                           </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <button className="text-[#1c7ed6] hover:underline text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ml-auto">
                              Detalle <ChevronRight className="w-3 h-3" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
