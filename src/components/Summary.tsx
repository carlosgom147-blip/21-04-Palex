import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Minus, 
  Layers, Package, Users, Clock, AlertCircle, MapPin,
  ArrowLeftRight, X, AlertTriangle, CheckCircle2, Sparkles, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, Cell } from 'recharts';

import { KPIStats, EWMRow } from '../types';
import { COLORS } from '../constants';
import { cn } from '../lib/utils';

interface SummaryProps {
  kpis: KPIStats | null;
  data: EWMRow[];
}

const KPICard = ({ 
  label, value, trendValue, trendClass
}: { 
  label: string; value: string; trendValue?: string; trendClass?: string
}) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bento-card"
  >
    <span className="kpi-label">{label}</span>
    <span className={cn("kpi-value", label.includes("Pérdida") && "text-[#e8231a]")}>{value}</span>
    {trendValue && (
      <div className={cn("trend-pill", trendClass)}>
        {trendValue}
      </div>
    )}
  </motion.div>
);

const Heatmap = ({ data }: { data: EWMRow[] }) => {
  const heatmapData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.filter(r => r._almacen === 'Z050' && r['Ubic.procedencia']?.startsWith('Z10')).forEach(r => {
      const parts = r['Ubic.procedencia']!.split('-');
      const id = `${parts[1]}-${parts[2]}`; 
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [data]);

  const pasillos = Array.from(new Set(Object.keys(heatmapData).map(k => k.split('-')[0]))).sort();
  const columnas = Array.from(new Set(Object.keys(heatmapData).map(k => k.split('-')[1]))).sort();

  const getHeatClass = (count: number) => {
    if (count === 0) return 'bg-[#edf2f7]';
    if (count < 20) return 'bg-[#86efac]';
    if (count < 50) return 'bg-[#fde047]';
    if (count < 100) return 'bg-[#fb923c]';
    return 'bg-[#ef4444]';
  };

  return (
    <div className="flex flex-wrap content-start overflow-hidden h-full">
      {pasillos.map(p => (
        <React.Fragment key={p}>
          {columnas.map(c => {
            const id = `${p}-${c}`;
            const count = heatmapData[id] || 0;
            return (
              <div 
                key={id}
                title={`${id}: ${count} WTs`}
                className={cn("w-3 h-3 rounded-[2px] m-[1.5px] transition-colors", getHeatClass(count))}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function Summary({ kpis, data }: SummaryProps) {
  if (!kpis) return null;

  return (
    <div className="space-y-4">
      {/* 6 KPI Grid tailored to theme */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="WTs Confirmadas" value={kpis.wts_confirmadas.toLocaleString()} trendValue="+12.4% vs mes ant." trendClass="pill-pos" />
        <KPICard label="Unidades Movidas" value={kpis.unidades_movidas.toLocaleString()} trendValue="↑ Mayor vol. Miércoles" trendClass="pill-pos" />
        <KPICard label="Pedidos Preparados" value={kpis.pedidos_preparados.toLocaleString()} trendValue="6.2 WTs / pedido" trendClass="pill-pos" />
        <KPICard label="Lead Time Medio" value={`${kpis.lead_time_medio_h.toFixed(1)}h`} trendValue="Mediana: 2.7h" trendClass="pill-alert" />
        <KPICard label="Stock Cuarentena (Q)" value={kpis.stock_Q.toString()} trendValue="+245 nuevas WTs" trendClass="pill-neg" />
        <KPICard label="Pérdida por Gap" value={`−${(kpis.wts_confirmadas * 0.12).toFixed(0)}€`} trendValue="Responsable: Operario" trendClass="pill-neg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:min-h-[300px]">
        <div className="lg:col-span-2 bento-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold">Mapa de Calor: Z10 Suelo (Z050)</h3>
            <div className="flex gap-4 text-[10px] text-[#86868b] uppercase font-bold tracking-widest">
              <span>Bajo</span>
              <div className="flex gap-[2px]">
                <div className="w-3 h-3 rounded-sm bg-[#edf2f7]" />
                <div className="w-3 h-3 rounded-sm bg-[#86efac]" />
                <div className="w-3 h-3 rounded-sm bg-[#fde047]" />
                <div className="w-3 h-3 rounded-sm bg-[#fb923c]" />
                <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
              </div>
              <span>Alto</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto max-h-[250px]">
             <Heatmap data={data} />
          </div>
        </div>
        
        <div className="bento-card">
           <h3 className="text-sm font-bold mb-4">Actividad por Almacén</h3>
           <div className="space-y-6">
              <div className="flex justify-between items-end">
                 <div className="flex flex-col text-[11px] font-bold text-[#0ca678]">
                    <span>Z050</span>
                    <span className="text-[10px] text-gray-400 font-medium">NEFROLOGÍA</span>
                 </div>
                 <div className="text-right">
                    <div className="text-lg font-bold">23,931</div>
                    <div className="text-[10px] text-gray-500 font-medium">WTs confirmadas</div>
                 </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-[#0ca678] h-full" style={{ width: '71%' }} />
              </div>

              <div className="flex justify-between items-end mt-4">
                 <div className="flex flex-col text-[11px] font-bold text-[#0071e3]">
                    <span>Z060</span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-tight">COBERTURA</span>
                 </div>
                 <div className="text-right">
                    <div className="text-lg font-bold">9,926</div>
                    <div className="text-[10px] text-gray-500 font-medium">WTs confirmadas</div>
                 </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-[#0071e3] h-full" style={{ width: '29%' }} />
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-[11px] border border-blue-100 text-blue-800 leading-relaxed">
                 <p><strong>IA Insight:</strong> El pico de actividad (12h) supera la capacidad en Z050. Se recomienda apoyo de 2 operarios.</p>
              </div>
           </div>
        </div>
      </div>
      
      {/* Bottom row placeholders from design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bento-card">
          <h3 className="text-sm font-bold mb-3">Eficiencia Operarios</h3>
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">IL2</div>
                   <span className="text-xs font-medium">IL2 (71.9%)</span>
                </div>
                <div className="text-[11px] font-mono font-bold">55.9s pick</div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center font-bold">IL3</div>
                   <span className="text-xs font-medium">IL3 (55.6%)</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-red-500">66.7s pick</div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center font-bold">IL4</div>
                   <span className="text-xs font-medium">IL4 (84.6%)</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-green-500">46.8s pick</div>
             </div>
          </div>
        </div>

        <div className="bento-card">
          <h3 className="text-sm font-bold mb-3">Alertas de Almacén</h3>
          <div className="space-y-2 text-[11px]">
             <div className="flex gap-3 p-2 bg-[#fff2f2] border border-[#fecaca] rounded-lg">
                <span className="text-red-600 font-bold">!</span>
                <div>
                   <p className="font-semibold">Productividad Crítica</p>
                   <p className="text-gray-600">IL3 está 16% bajo la media del equipo.</p>
                </div>
             </div>
             <div className="flex gap-3 p-2 bg-[#fff9f0] border border-[#fef3c7] rounded-lg">
                <span className="text-yellow-600 font-bold">!</span>
                <div>
                   <p className="font-semibold">Stock Inmóvil</p>
                   <p className="text-gray-600">{kpis.stock_B.toLocaleString()} WTs con material &gt; 180 días.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bento-card">
          <h3 className="text-sm font-bold mb-3">Top Productos Pick (ABC)</h3>
          <div className="space-y-2 text-[11px]">
             {[
               { n: 'Aguja Hipoderm. Seg. 25G', u: '54k', c: 'A' },
               { n: 'Sol. Diálisis Bicarbonato', u: '21k', c: 'A' },
               { n: 'Aguja Hipoderm. Seg. 21G', u: '16k', c: 'A' }
             ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2">
                   <span className="truncate max-w-[150px] font-medium">{item.n}</span>
                   <div className="flex gap-2 items-center">
                      <span className="font-bold">{item.u} uds</span>
                      <span className="bg-black text-white px-1.5 rounded font-bold text-[9px]">{item.c}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
