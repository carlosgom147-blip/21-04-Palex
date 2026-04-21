/**
 * Application constants, colors and mapping rules for Palex EWM.
 */

export const COLORS = {
  bg: '#f5f6f8',
  card: '#ffffff',
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  textTertiary: '#aeaeb2',
  ilsRed: '#e8231a',
  palexBlue: '#0071e3',
  tabActive: '#1c7ed6',
  positive: '#0ca678',
  alert: '#c47e00',
  negative: '#e8231a',
  z050: '#1d9e75', // Greenish for Nephrology
  z060: '#0071e3', // Blue for Coverage
};

export const OPERARIOS_PRINCIPALES = ['IL1', 'IL2', 'IL3', 'IL4', 'IL5', 'IL6', 'IL7', 'IL8', 'IL9'];
export const OPERARIOS_ESPECIALES = ['BVZ', 'GM1', 'MRMARIN', 'PLXJOB', 'SLP', 'EZEGARRA', 'JOJ', 'BMARTINEZ2'];

export const ACTIVITY_TYPES = ['PICK', 'REPL', 'PTWY', 'INTL'];
export const COLAS = ['SUELO', 'ALTURA', 'REPO', 'ENTRADA', 'INTERNO', 'DEVOLUCION', 'DESTRUIR', 'GESTINMED', 'NOINV'];

export const STORAGE_KEY = 'palex_ewm_data';
export const COSTE_HORA_DEFAULT = 15;

export const ALMACENES = {
  Z050: { id: 'Z050', nombre: 'Nefrología', color: COLORS.z050 },
  Z060: { id: 'Z060', nombre: 'Cobertura', color: COLORS.z060 }
};

export const ZIGZAG_THRESHOLD = 0.15; // 15% alert
export const PRODUCTIVITY_ALERT_LOW = 60; // <60% red
export const PRODUCTIVITY_ALERT_MID = 75; // 60-75% orange
