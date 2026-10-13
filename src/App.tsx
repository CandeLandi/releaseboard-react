import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Bell, Boxes, ChevronLeft, ChevronRight, CircleHelp, Clock3, LayoutDashboard, Menu, MoreHorizontal, Plus, Search, Settings, ShieldCheck, Users, X } from 'lucide-react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import './App.css'
import { initialReleases, recentIncidents, upcomingReleases } from './data/releases'
import type { Release, ReleaseStatus, Severity } from './types'

const statusLabels: Record<ReleaseStatus, string> = { blocked: 'Bloqueado', in_review: 'En revisión', in_progress: 'En curso', ready: 'Listo' }
const severityLabels: Record<Severity, string> = { critical: 'Crítica', high: 'Alta', low: 'Baja', medium: 'Media' }

export default function App() {
  return <Routes><Route path="*" element={<ReleaseBoard />} /></Routes>
}

function ReleaseBoard() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ReleaseStatus>('all')
  const [page, setPage] = useState(0)
  const { data: releases = [] } = useQuery({ queryKey: ['releases'], queryFn: async () => initialReleases, initialData: initialReleases })
  const createRelease = useMutation({
    mutationFn: async (release: Release) => release,
    onSuccess: (release) => queryClient.setQueryData<Release[]>(['releases'], (current = []) => [release, ...current]),
  })
  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase()
    return releases.filter((release) => (statusFilter === 'all' || release.status === statusFilter) && (!value || [release.name, release.code, release.owner.name, release.owner.team].join(' ').toLowerCase().includes(value)))
  }, [releases, search, statusFilter])
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const paginatedReleases = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
  const firstItem = filtered.length ? currentPage * pageSize + 1 : 0
  const lastItem = Math.min((currentPage + 1) * pageSize, filtered.length)
  const title = location.pathname.includes('incidents') ? 'Incidencias' : location.pathname.includes('releases') ? 'Entregas' : 'Resumen'
  const clearFilters = () => { setSearch(''); setStatusFilter('all'); setPage(0) }
  const submit = (form: NewReleaseForm) => {
    createRelease.mutate({ id: crypto.randomUUID(), code: `INC-${String(releases.length + 1040)}`, name: form.name, summary: form.summary, severity: form.severity, targetDate: form.targetDate, status: 'in_progress', owner: { initials: 'CL', name: 'Candela Landi', team: 'Frontend' } })
    setPage(0)
    setDialogOpen(false)
  }

  return <div className="app-shell">
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <main className="workspace">
      <header className="topbar">
        <button className="icon-button mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir navegación"><Menu size={20} /></button>
        <label className="global-search"><Search size={18} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Buscar entregas, incidencias o personas..." /></label>
        <div className="topbar-actions"><button className="icon-button" type="button" aria-label="Notificaciones"><Bell size={19} /><span className="notification-dot" /></button><button className="primary-button" type="button" onClick={() => setDialogOpen(true)}><Plus size={17} />Nueva incidencia</button></div>
      </header>
      <div className="content-grid">
        <section className="main-content">
          <div className="page-heading"><div><p className="section-label">Espacio de trabajo</p><h1>{title}</h1><p>Visibilidad sobre entregas, incidencias y estado de despliegues.</p></div><button className="text-button" type="button" onClick={() => navigate('/releases')}>Ver entregas <ChevronRight size={16} /></button></div>
          <SummaryCards releases={releases} />
          <section className="release-panel" aria-label="Listado de entregas">
            <div className="panel-tabs"><div className="tab-list" role="tablist"><button className={title !== 'Incidencias' ? 'tab active' : 'tab'} type="button" onClick={() => navigate('/releases')}>Entregas</button><button className={title === 'Incidencias' ? 'tab active' : 'tab'} type="button" onClick={() => navigate('/incidents')}>Incidencias</button><button className="tab" type="button" onClick={() => { setStatusFilter('in_progress'); setPage(0) }}>Mis elementos</button></div><label className="status-select"><span className="visually-hidden">Filtrar por estado</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as 'all' | ReleaseStatus); setPage(0) }}><option value="all">Todos los estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
            <div className="table-scroll"><ReleaseTable releases={paginatedReleases} onClear={clearFilters} /></div>
            <footer className="table-footer"><span>Mostrando {firstItem}–{lastItem} de {filtered.length} entregas</span><div className="pagination" aria-label="Paginación"><button type="button" aria-label="Página anterior" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, index) => <button className={index === currentPage ? 'current' : ''} type="button" key={index} onClick={() => setPage(index)}>{index + 1}</button>)}<button type="button" aria-label="Página siguiente" disabled={currentPage === pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}><ChevronRight size={17} /></button></div></footer>
          </section>
        </section>
        <aside className="insights-rail"><UpcomingReleases /><RecentIncidents /></aside>
      </div>
    </main>
    {dialogOpen && <ReleaseDialog onClose={() => setDialogOpen(false)} onSubmit={submit} />}
  </div>
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [{ icon: LayoutDashboard, label: 'Resumen', to: '/' }, { icon: Boxes, label: 'Entregas', to: '/releases' }, { icon: AlertTriangle, label: 'Incidencias', to: '/incidents' }, { icon: Users, label: 'Equipo', to: '/team' }]
  return <aside className={`sidebar ${open ? 'open' : ''}`}><div className="sidebar-top"><div className="brand"><span className="brand-mark">R</span>ReleaseBoard</div><button className="icon-button close-sidebar" type="button" onClick={onClose} aria-label="Cerrar navegación"><X size={19} /></button></div><nav className="sidebar-nav" aria-label="Navegación principal">{links.map(({ icon: Icon, label, to }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}><Icon size={19} />{label}</NavLink>)}</nav><div className="sidebar-bottom"><span className="nav-item muted"><Settings size={19} />Ajustes</span><span className="nav-item muted"><CircleHelp size={19} />Ayuda</span><div className="profile-card"><span className="avatar avatar-blue">CL</span><div><strong>Candela Landi</strong><span>Frontend</span></div></div></div></aside>
}

function SummaryCards({ releases }: { releases: Release[] }) {
  const cards = [{ color: 'red', icon: AlertTriangle, label: 'Incidencias abiertas', value: 3, detail: '1 nueva en las últimas 24 h' }, { color: 'amber', icon: Clock3, label: 'En revisión', value: releases.filter((item) => item.status === 'in_review').length, detail: 'Sin cambios hoy' }, { color: 'green', icon: ShieldCheck, label: 'Listo para liberar', value: releases.filter((item) => item.status === 'ready').length, detail: '2 más que ayer' }, { color: 'blue', icon: Boxes, label: 'Salud de despliegue', value: '99.7%', detail: '0.3% por encima de ayer' }]
  return <section className="summary-grid" aria-label="Resumen de entregas">{cards.map(({ color, icon: Icon, label, value, detail }) => <article className="summary-card" key={label}><div className={`summary-icon ${color}`}><Icon size={20} /></div><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></article>)}</section>
}

function ReleaseTable({ releases, onClear }: { releases: Release[]; onClear: () => void }) {
  if (!releases.length) return <div className="empty-state"><Search size={22} /><p>No encontramos entregas con esos filtros.</p><button className="text-button" type="button" onClick={onClear}>Limpiar búsqueda</button></div>
  return <table><thead><tr><th>Entrega</th><th>Responsable</th><th>Estado</th><th>Prioridad</th><th>Fecha objetivo</th><th><span className="visually-hidden">Acciones</span></th></tr></thead><tbody>{releases.map((release) => <tr key={release.id}><td><div className="release-name"><span className="release-icon"><Boxes size={17} /></span><div><strong>{release.name}</strong><span>{release.code} · {release.summary}</span></div></div></td><td><div className="owner"><span className="avatar">{release.owner.initials}</span><div><strong>{release.owner.name}</strong><span>{release.owner.team}</span></div></div></td><td><Status status={release.status} /></td><td><SeverityBadge severity={release.severity} /></td><td className="date-cell">{release.targetDate}</td><td><button className="row-action" type="button" aria-label={`Acciones para ${release.name}`}><MoreHorizontal size={19} /></button></td></tr>)}</tbody></table>
}

function Status({ status }: { status: ReleaseStatus }) { return <span className={`status ${status}`}><span />{statusLabels[status]}</span> }
function SeverityBadge({ severity }: { severity: Severity }) { return <span className={`severity ${severity}`}><span />{severityLabels[severity]}</span> }
function UpcomingReleases() { return <section className="rail-panel"><div className="rail-header"><h2>Próximas entregas</h2><NavLink className="text-button" to="/releases">Ver todo</NavLink></div><ul className="release-list">{upcomingReleases.map((release) => <li key={release.id}><time dateTime={release.date}><span>{release.month}</span><strong>{release.day}</strong></time><div><strong>{release.name}</strong><span>{release.owner}</span></div><Status status={release.status} /></li>)}</ul></section> }
function RecentIncidents() { return <section className="rail-panel"><div className="rail-header"><h2>Incidencias recientes</h2><NavLink className="text-button" to="/incidents">Ver todo</NavLink></div><ul className="incident-list">{recentIncidents.map((incident) => <li key={incident.id}><span className={`incident-dot ${incident.status}`} /><div><strong>{incident.title}</strong><span>{incident.id} · {incident.time}</span></div><span className={`incident-status ${incident.status}`}>{incident.label}</span></li>)}</ul></section> }

type NewReleaseForm = Pick<Release, 'name' | 'summary' | 'severity' | 'targetDate'>
function ReleaseDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (form: NewReleaseForm) => void }) {
  const [form, setForm] = useState<NewReleaseForm>({ name: '', summary: '', severity: 'medium', targetDate: '30 oct. 2026' })
  const valid = form.name.trim().length > 2 && form.summary.trim().length > 2
  return <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header><div><h2 id="dialog-title">Nueva incidencia</h2><p>Registrá el contexto para que el equipo pueda priorizarla.</p></div><button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></header><form onSubmit={(event) => { event.preventDefault(); if (valid) onSubmit(form) }}><label>Nombre<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Error al cargar el resumen" autoFocus /></label><label>Contexto<textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Describí el impacto y el módulo afectado." rows={3} /></label><div className="form-row"><label>Prioridad<select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as Severity })}>{Object.entries(severityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Fecha objetivo<input value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} /></label></div><footer><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={!valid}><Plus size={17} />Crear incidencia</button></footer></form></section></div>
}
