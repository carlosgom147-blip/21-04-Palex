/**
 * Hierarchical model and Excel column definitions for ILS Palex EWM Dashboard.
 */

export interface EWMRow {
  // Key columns
  Documento?: string;
  'Tarea de almacén': string; // Unique key
  'Orden de almacén': string;
  'Status de tarea de almacén': string; // "C" confirmed
  'Regla creación órdenes almacén'?: string; // ZEMB, ZINT, etc
  PosTarAl?: number;
  'Grupo consolidación'?: string;
  Cola?: string;
  Producto?: string;
  'Descripción de producto'?: string;
  Lote?: string;
  'Tipo de stocks'?: string;
  'Ctd.prev.proced.UMA'?: number;
  'Ctd.real dest.UMA'?: number;
  'Ctd.dif.dest.en UMA'?: number;
  Actividad?: 'PICK' | 'REPL' | 'PTWY' | 'INTL' | string;
  'Un.manipulac.origen'?: string;
  'UMp destino'?: string;
  'Ubic.procedencia'?: string;
  'Ubicación de destino'?: string;
  'Tp.almacén origen'?: string;
  'Confirmado por'?: string;
  'Autor'?: string;
  'Fecha de creación'?: string;
  'Hora de creación'?: string;
  'Hora inicio'?: string;
  'Fecha confirmación'?: string;
  'Hora de confirmación'?: string;
  'Denominación de tipo de stocks'?: string;
  
  // Calculated / Added fields
  _almacen?: 'Z050' | 'Z060' | 'DESCONOCIDO';
  _timestamp_creacion?: number;
  _timestamp_inicio?: number;
  _timestamp_confirmacion?: number;
  _duracion_seg?: number;
  
  // All other 82 columns are stored dynamically
  [key: string]: any;
}

export interface KPIStats {
  wts_confirmadas: number;
  unidades_movidas: number;
  pedidos_preparados: number;
  hus_entrada: number;
  hus_internalizadas: number;
  tiempo_medio_pick_seg: number;
  lead_time_medio_h: number;
  lead_time_mediana_h: number;
  stock_F: number;
  stock_Q: number;
  stock_B: number;
  operarios_activos: number;
  dias_analizados: number;
  antiguedad_stock_media_dias: number;
  wts_mas_180_dias: number;
  tasa_error_picking_pct: number;
  precision_ubicacion_pct: number;
  delegacion_tareas_pct: number;
  oleadas_picking: number;
  wts_por_oleada_media: number;
}

export interface OperatorStats {
  id: string;
  es_principal: boolean;
  wts_totales: number;
  unidades: number;
  dias_trabajados: number;
  wts_por_dia: number;
  almacenes: string[];
  productos_distintos: number;
  ubicaciones_distintas: number;
  pedidos_completados: number;
  wos_completadas: number;
  exec_medio_seg: number;
  exec_total_h: number;
  gap_medio_seg: number;
  gap_total_h: number;
  espera_media_min: number;
  productividad_pct: number;
  zigzags: number;
  zigzag_pct: number;
  por_cola: Record<string, { wts: number; uds: number; t_medio_seg: number | null }>;
  por_actividad: Record<string, { wts: number; uds: number }>;
  horario_por_hora: Record<number, number>;
  evolucion_diaria: { fecha: string; wts: number; t_medio_seg: number; uds: number }[];
}

export interface DashboardState {
  data: EWMRow[];
  kpis: KPIStats | null;
  operators: OperatorStats[];
  almacenInfo: Record<string, any>;
  coste_hora: number;
  lastUpdate: string | null;
  filters: {
    dateRange: [Date | null, Date | null];
    almacen: 'ALL' | 'Z050' | 'Z060';
    operario: string[]; // empty is ALL
    cola: string[];
    actividad: string[];
  };
}
