import React from 'react';
import { motion } from 'motion/react';
import { 
  AlertCircle, AlertTriangle, CheckCircle2, TrendingUp, Info, 
  ChevronRight, ArrowRight, User, Package, Clock
} from 'lucide-react';
import { KPIStats, OperatorStats } from '../types';
import { cn } from '../lib/utils';

interface AlertsProps {
  kpis: KPIStats | null;
  operators: OperatorStats[];
}

export default function Alerts({ kpis, operators }: AlertsProps) {
  if (!kpis) return null;

  const alerts = [];

  // Operator Alerts
  operators.forEach(op => {
    if (op.productividad_pct < 60) {
      alerts.push({
        type: 'error',
        severity: '🔴',
        category: 'OPERARIO',
        title: 'Baja productividad detectada',
        description: `${op.id} tiene productividad del ${op.productividad_pct.toFixed(1)}% — sustancialmente bajo la media del equipo.`,
        date: 'Hoy'
      });
    }
    if (op.zigzag_pct > 15) {
      alerts.push({
        type: 'error',
        severity: '🔴',
        category: 'OPERARIO',
        title: 'Alta tasa de zigzag',
        description: `${op.id} tiene un ${op.zigzag_pct.toFixed(1)}% de zigzags en sus rutas — revisar asignación de pasillos.`,
        date: 'Hoy'
      });
    }
    if (op.gap_medio_seg > 40) {
      alerts.push({
        type: 'warning',
        severity: '🟡',
        category: 'OPERARIO',
        title: 'Gap entre WTs elevado',
        description: `${op.id} registra un gap medio de ${op.gap_medio_seg.toFixed(1)}s, superior al umbral de eficiencia (40s).`,
        date: 'Hoy'
      });
    }
  });

  // System Alerts
  if (kpis.stock_B > 100) {
    alerts.push({
      type: 'error',
      severity: '🔴',
      category: 'SISTEMA',
      title: 'Exceso de Stock Bloqueado (3B)',
      description: `${kpis.stock_B} WTs con stock bloqueado — material retenido sin movimiento.`,
      date: 'Hoy'
    });
  }

  if (kpis.stock_Q > 0) {
    alerts.push({
      type: 'warning',
      severity: '🟡',
      category: 'LOGÍSTICA',
      title: 'Material en Cuarentena',
      description: `${kpis.stock_Q} unidades en estado 3Q pendiente de liberación.`,
      date: 'Hoy'
    });
  }

  // Positive Alerts
  if (kpis.tasa_error_picking_pct === 0) {
    alerts.push({
      type: 'success',
      severity: '🟢',
      category: 'CALIDAD',
      title: 'Tasa de error perfecta',
      description: 'Precisión del 100% en las últimas rutas analizadas. Cero discrepancias UMA.',
      date: 'Hoy'
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Centro de Alertas</h2>
            <p className="text-gray-500 text-sm">Notificaciones automáticas basadas en el último dataset.</p>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest">
               🔴 Críticas: {alerts.filter(a => a.type === 'error').length}
            </div>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
               🟡 Alertas: {alerts.filter(a => a.type === 'warning').length}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i}
            className="group truncate-child-target"
          >
            <div className={cn(
              "p-6 rounded-[24px] border transition-all flex items-start gap-6",
              alert.type === 'error' ? "bg-rose-50/50 border-rose-100 hover:bg-rose-50" :
              alert.type === 'warning' ? "bg-amber-50/50 border-amber-100 hover:bg-amber-50" :
              "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50"
            )}>
              <div className="text-2xl shrink-0 mt-1">{alert.severity}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-[0.15em]",
                     alert.type === 'error' ? "text-rose-500" :
                     alert.type === 'warning' ? "text-amber-500" : "text-emerald-600"
                   )}>{alert.category}</span>
                   <span className="text-[10px] text-gray-400 font-bold">{alert.date}</span>
                </div>
                <h3 className="text-base font-bold tracking-tight mb-1 text-[#1d1d1f]">{alert.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-4xl">{alert.description}</p>
              </div>
              <button className="p-3 bg-white/50 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-100 group-hover:translate-x-1 shadow-sm">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
        {alerts.length === 0 && (
           <div className="py-20 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-xl font-bold tracking-tight">No hay alertas activas</p>
              <p className="text-gray-400 text-sm">El almacén opera bajo los parámetros de eficiencia establecidos.</p>
           </div>
        )}
      </div>
    </div>
  );
}
