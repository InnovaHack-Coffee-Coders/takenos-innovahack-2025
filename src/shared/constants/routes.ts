// Constantes de rutas de la aplicación

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PRODUCERS: '/dashboard/producers',
  PRODUCERS_NEW: '/dashboard/producers/new',
  PRODUCERS_IMPORT: '/dashboard/producers/import',
  PRODUCER_EDIT: (id: string) => `/dashboard/producers/${id}/edit`,
  INSPECTORS: '/dashboard/inspectors',
  PLOTS: '/dashboard/plots',
  COURSES: '/dashboard/courses',
  CHECKLIST: '/dashboard/checklist',
  STATUS: '/dashboard/status',
  SYNC: '/dashboard/sync',
  SETTINGS: '/dashboard/settings',
  SUPPORT: '/dashboard/support',
  LEGAL_PRIVACY: '/legal/privacy',
  LEGAL_TERMS: '/legal/terms',
} as const;

