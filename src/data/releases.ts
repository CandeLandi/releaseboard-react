import type { Release, ReleaseStatus } from '../types'

export const initialReleases: Release[] = [
  { id: '1', code: 'PAY-1024', name: 'Pagos API v2.4.0', summary: 'Mejora de reintentos', owner: { initials: 'SL', name: 'Sofía López', team: 'Plataforma' }, status: 'ready', severity: 'low', targetDate: '25 oct. 2026' },
  { id: '2', code: 'WEB-889', name: 'Portal web v1.18.0', summary: 'Flujo de onboarding', owner: { initials: 'MH', name: 'María Herrera', team: 'Frontend' }, status: 'in_review', severity: 'medium', targetDate: '28 oct. 2026' },
  { id: '3', code: 'USR-703', name: 'Usuarios v3.1.0', summary: 'Migración de perfiles', owner: { initials: 'DK', name: 'Diego Kim', team: 'Backend' }, status: 'in_progress', severity: 'medium', targetDate: '02 nov. 2026' },
  { id: '4', code: 'ANL-452', name: 'Analítica v1.6.3', summary: 'Deduplicación de eventos', owner: { initials: 'PR', name: 'Paula Ríos', team: 'Datos' }, status: 'ready', severity: 'low', targetDate: '25 oct. 2026' },
  { id: '5', code: 'MOB-334', name: 'Notificaciones v1.3.0', summary: 'Actualización de entrega', owner: { initials: 'JT', name: 'Julián Torres', team: 'Mobile' }, status: 'blocked', severity: 'high', targetDate: '29 oct. 2026' },
  { id: '6', code: 'SRC-221', name: 'Búsqueda v2.8.1', summary: 'Rendimiento de indexación', owner: { initials: 'EL', name: 'Elena Luna', team: 'Plataforma' }, status: 'in_progress', severity: 'medium', targetDate: '01 nov. 2026' },
  { id: '7', code: 'BILL-560', name: 'Facturación v4.0.0', summary: 'Nuevo modelo de precios', owner: { initials: 'NG', name: 'Nicolás García', team: 'Backend' }, status: 'in_review', severity: 'high', targetDate: '05 nov. 2026' },
]

export const upcomingReleases: Array<{ id: string; day: string; month: string; name: string; owner: string; status: ReleaseStatus; date: string }> = [
  { id: '1', day: '25', month: 'OCT', name: 'Analítica v1.6.3', owner: 'Paula Ríos', status: 'ready', date: '2026-10-25' },
  { id: '2', day: '26', month: 'OCT', name: 'Pagos API v2.4.0', owner: 'Sofía López', status: 'ready', date: '2026-10-26' },
  { id: '3', day: '28', month: 'OCT', name: 'Portal web v1.18.0', owner: 'María Herrera', status: 'in_review', date: '2026-10-28' },
  { id: '4', day: '29', month: 'OCT', name: 'Notificaciones v1.3.0', owner: 'Julián Torres', status: 'blocked', date: '2026-10-29' },
]

export const recentIncidents = [
  { id: 'INC-1042', title: 'Aumento de latencia en API', time: '23 min', status: 'open', label: 'Abierta' },
  { id: 'INC-1041', title: 'Errores de carga en web', time: '2 h', status: 'open', label: 'Abierta' },
  { id: 'INC-1040', title: 'Falla en envío de notificaciones', time: '5 h', status: 'investigating', label: 'En análisis' },
  { id: 'INC-1039', title: 'Demora en replicación de datos', time: '1 d', status: 'resolved', label: 'Resuelta' },
]
