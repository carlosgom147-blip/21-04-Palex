import { EWMRow, KPIStats, OperatorStats } from '../types';
import { OPERARIOS_PRINCIPALES, COSTE_HORA_DEFAULT } from '../constants';

/**
 * Service to process SAP EWM Excel data and calculate logistics KPIs.
 */

export function parseSAPDate(dateStr: string, timeStr?: string): number | null {
  if (!dateStr) return null;
  
  // SAP date formats can be DD.MM.YYYY or YYYY-MM-DD or numeric from Excel
  // SheetJS usually handles the conversion if it's a date cell.
  // If it's a string from Excel:
  let parts: string[];
  if (String(dateStr).includes('.')) {
    parts = String(dateStr).split('.');
    // Assume DD.MM.YYYY
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    if (timeStr) {
      const tParts = String(timeStr).split(':');
      d.setHours(Number(tParts[0]), Number(tParts[1]), Number(tParts[2] || 0));
    }
    return d.getTime();
  }
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  if (timeStr) {
    const tParts = String(timeStr).split(':');
    d.setHours(Number(tParts[0]), Number(tParts[1]), Number(tParts[2] || 0));
  }
  return d.getTime();
}

export function processRows(rows: any[]): EWMRow[] {
  return rows
    .filter(r => r['Status de tarea de almacén'] === 'C')
    .map(r => {
      const denom = r['Denominación de tipo de stocks'] || '';
      const almacen = String(denom).includes('Z050') ? 'Z050' : String(denom).includes('Z060') ? 'Z060' : 'DESCONOCIDO';
      
      const ts_creacion = parseSAPDate(r['Fecha de creación'], r['Hora de creación']);
      const ts_inicio = parseSAPDate(r['Fecha de creación'], r['Hora inicio']);
      const ts_confirm = parseSAPDate(r['Fecha confirmación'], r['Hora de confirmación']);
      
      let duracion_seg = 0;
      if (ts_inicio && ts_confirm && (r['Actividad'] === 'PICK' || r['Actividad'] === 'REPL')) {
        duracion_seg = (ts_confirm - ts_inicio) / 1000;
        // Rules: > 0 and < 4 hours
        if (duracion_seg < 0 || duracion_seg > 14400) duracion_seg = 0;
      }

      return {
        ...r,
        _almacen: almacen,
        _timestamp_creacion: ts_creacion || 0,
        _timestamp_inicio: ts_inicio || 0,
        _timestamp_confirmacion: ts_confirm || 0,
        _duracion_seg: duracion_seg
      };
    });
}

export function calculateKPIs(data: EWMRow[]): KPIStats {
  const stats: KPIStats = {
    wts_confirmadas: data.length,
    unidades_movidas: data.reduce((acc, r) => acc + (Number(r['Ctd.real dest.UMA']) || 0), 0),
    pedidos_preparados: new Set(data.filter(r => r['Documento']).map(r => r['Documento'])).size,
    hus_entrada: data.filter(r => r['Actividad'] === 'PTWY').length,
    hus_internalizadas: new Set(data.filter(r => r['Regla creación órdenes almacén'] === 'ZINT').map(r => r['Orden de almacén'])).size,
    tiempo_medio_pick_seg: 0,
    lead_time_medio_h: 0,
    lead_time_mediana_h: 0,
    stock_F: data.filter(r => r['Tipo de stocks'] === '3F').length,
    stock_Q: data.filter(r => r['Tipo de stocks'] === '3Q').length,
    stock_B: data.filter(r => r['Tipo de stocks'] === '3B').length,
    operarios_activos: new Set(data.map(r => r['Confirmado por'])).size,
    dias_analizados: new Set(data.filter(r => r['Fecha confirmación']).map(r => r['Fecha confirmación'])).size,
    antiguedad_stock_media_dias: 0,
    wts_mas_180_dias: 0,
    tasa_error_picking_pct: 0,
    precision_ubicacion_pct: 0,
    delegacion_tareas_pct: 0,
    oleadas_picking: new Set(data.filter(r => r['Grupo consolidación']).map(r => r['Grupo consolidación'])).size,
    wts_por_oleada_media: 0,
  };

  // Detailed calculations
  const pickRows = data.filter(r => r['Actividad'] === 'PICK' && r._duracion_seg && r._duracion_seg > 0);
  if (pickRows.length > 0) {
    stats.tiempo_medio_pick_seg = pickRows.reduce((acc, r) => acc + (r._duracion_seg || 0), 0) / pickRows.length;
  }

  // Tasa error picking: % where Prevista != Real
  const pickAll = data.filter(r => r['Actividad'] === 'PICK');
  if (pickAll.length > 0) {
    const errors = pickAll.filter(r => Number(r['Ctd.prev.proced.UMA']) !== Number(r['Ctd.real dest.UMA'])).length;
    stats.tasa_error_picking_pct = (errors / pickAll.length) * 100;
  }

  // Precision ubicación: Original == Real
  const locationChecked = data.filter(r => r['Ubic.dest.original'] && r['Ubicación de destino']);
  if (locationChecked.length > 0) {
    const matches = locationChecked.filter(r => r['Ubic.dest.original'] === r['Ubicación de destino']).length;
    stats.precision_ubicacion_pct = (matches / locationChecked.length) * 100;
  }

  // Delegacion: Autor != Confirmado por
  const authChecked = data.filter(r => r['Autor'] && r['Confirmado por']);
  if (authChecked.length > 0) {
    const delegated = authChecked.filter(r => r['Autor'] !== r['Confirmado por']).length;
    stats.delegacion_tareas_pct = (delegated / authChecked.length) * 100;
  }

  // Lead times per Document (Pedido)
  const orders: Record<string, { start: number; end: number }> = {};
  data.forEach(r => {
    if (!r.Documento || !r._timestamp_creacion || !r._timestamp_confirmacion) return;
    if (!orders[r.Documento]) {
      orders[r.Documento] = { start: r._timestamp_creacion, end: r._timestamp_confirmacion };
    } else {
      orders[r.Documento].start = Math.min(orders[r.Documento].start, r._timestamp_creacion);
      orders[r.Documento].end = Math.max(orders[r.Documento].end, r._timestamp_confirmacion);
    }
  });
  
  const leadTimes = Object.values(orders).map(o => (o.end - o.start) / (1000 * 3600)).filter(t => t > 0 && t < 100);
  if (leadTimes.length > 0) {
    stats.lead_time_medio_h = leadTimes.reduce((acc, t) => acc + t, 0) / leadTimes.length;
    leadTimes.sort((a,b)=>a-b);
    stats.lead_time_mediana_h = leadTimes[Math.floor(leadTimes.length / 2)];
  }

  return stats;
}

export function calculateOperatorStats(data: EWMRow[], opId: string): OperatorStats {
  const opData = data.filter(r => r['Confirmado por'] === opId);
  const es_principal = OPERARIOS_PRINCIPALES.includes(opId);
  
  const days = new Set(opData.map(r => r['Fecha confirmación'])).size;
  const pickData = opData.filter(r => r['Actividad'] === 'PICK' && r._duracion_seg && r._duracion_seg > 0);
  
  let exec_total_h = 0;
  let exec_medio_seg = 0;
  if (pickData.length > 0) {
    const totalSeg = pickData.reduce((acc, r) => acc + (r._duracion_seg || 0), 0);
    exec_total_h = totalSeg / 3600;
    exec_medio_seg = totalSeg / pickData.length;
  }

  // Time gaps (Productivity)
  let gap_total_h = 0;
  let gap_medio_seg = 0;
  const sortedByConfirm = [...opData].sort((a,b) => a._timestamp_confirmacion - b._timestamp_confirmacion);
  let gaps: number[] = [];
  for (let i = 1; i < sortedByConfirm.length; i++) {
    const prev = sortedByConfirm[i-1];
    const curr = sortedByConfirm[i];
    // Rule: Same day, gap >= 0 and gap <= 30 mins (1800s)
    if (prev['Fecha confirmación'] === curr['Fecha confirmación']) {
      const g = (curr._timestamp_inicio - prev._timestamp_confirmacion) / 1000;
      if (g >= 0 && g <= 1800) {
        gaps.push(g);
      }
    }
  }
  if (gaps.length > 0) {
    const totalGapSeg = gaps.reduce((acc, g) => acc + g, 0);
    gap_total_h = totalGapSeg / 3600;
    gap_medio_seg = totalGapSeg / gaps.length;
  }

  // Espera en cola (System responsibility)
  let espera_total_h = 0;
  let espera_media_min = 0;
  const esperas = opData
    .map(r => (r._timestamp_inicio - r._timestamp_creacion) / 1000)
    .filter(e => e > 60 && e <= 28800);
  if (esperas.length > 0) {
    const totalWaitSeg = esperas.reduce((acc, e) => acc + e, 0);
    espera_total_h = totalWaitSeg / 3600;
    espera_media_min = (totalWaitSeg / esperas.length) / 60;
  }

  const productividad = exec_total_h > 0 ? (exec_total_h / (exec_total_h + gap_total_h)) * 100 : 0;

  // Zigzags
  let zigzags = 0;
  const picksOnly = opData.filter(r => r.Actividad === 'PICK').sort((a,b) => (a._timestamp_confirmacion || 0) - (b._timestamp_confirmacion || 0));
  for (let i = 2; i < picksOnly.length; i++) {
    const curr = picksOnly[i];
    const prev1 = picksOnly[i-1];
    const prev2 = picksOnly[i-2];
    
    // Extract pasillo from Ubic.procedencia (e.g. Z10-32-007-01 -> 32)
    const getPasillo = (u: string) => u?.split('-')[1] || '';
    const pCurr = getPasillo(curr['Ubic.procedencia'] || '');
    const pPrev1 = getPasillo(prev1['Ubic.procedencia'] || '');
    const pPrev2 = getPasillo(prev2['Ubic.procedencia'] || '');
    
    if (pCurr && pCurr === pPrev2 && pCurr !== pPrev1 && curr['Fecha confirmación'] === prev2['Fecha confirmación']) {
      zigzags++;
    }
  }

  return {
    id: opId,
    es_principal,
    wts_totales: opData.length,
    unidades: opData.reduce((acc, r) => acc + (Number(r['Ctd.real dest.UMA']) || 0), 0),
    dias_trabajados: days,
    wts_por_dia: days > 0 ? opData.length / days : 0,
    almacenes: Array.from(new Set(opData.map(r => r._almacen).filter(Boolean))),
    productos_distintos: new Set(opData.map(r => r['Producto'])).size,
    ubicaciones_distintas: new Set(opData.map(r => r['Ubic.procedencia'])).size,
    pedidos_completados: new Set(opData.map(r => r['Documento'])).size,
    wos_completadas: new Set(opData.map(r => r['Orden de almacén'])).size,
    exec_medio_seg,
    exec_total_h,
    gap_medio_seg,
    gap_total_h,
    espera_media_min,
    productividad_pct: productividad,
    zigzags,
    zigzag_pct: picksOnly.length > 0 ? (zigzags / picksOnly.length) * 100 : 0,
    por_cola: {}, // to be populated
    por_actividad: {}, // to be populated
    horario_por_hora: {}, // to be populated
    evolucion_diaria: [] // to be populated
  };
}
