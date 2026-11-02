import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Configuration } from '../../shared/catalog'
import { api, errorMessage } from './api'
import { useAuth } from './auth'

export type Project = { id: string; name: string; offerId: Configuration['offerId']; configuration: Configuration; activity: Record<string, string>; status: string; createdAt: string; updatedAt: string }
type ProjectValue = { project: Project | null; projects: Project[]; loading: boolean; error: string | null; selectProject: (id: string) => void; refresh: () => Promise<void>; updateProject: (patch: Partial<Pick<Project, 'name' | 'configuration' | 'activity'>>) => Promise<Project>; createProject: (configuration: Configuration, name?: string) => Promise<Project> }
const ProjectContext = createContext<ProjectValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentUser = useRef(user?.id)
  currentUser.current = user?.id
  const request = useRef(0)
  const refresh = useCallback(async () => {
    const sequence = ++request.current
    const ownerId = user?.id
    if (!ownerId) { setProjects([]); setSelected(null); setLoadedFor(null); setLoading(false); setError(null); return }
    const active = () => request.current === sequence && currentUser.current === ownerId
    setLoading(true); setError(null)
    try { const { projects } = await api<{ projects: Project[] }>('/api/projects'); if (active()) { setProjects(projects); setLoadedFor(ownerId); setSelected(current => projects.some(p => p.id === current) ? current : projects[0]?.id ?? null) } }
    catch (e) { if (active()) { setError(errorMessage(e)); setProjects([]); setLoadedFor(ownerId) } }
    finally { if (active()) setLoading(false) }
  }, [user?.id])
  useEffect(() => { setProjects([]); setSelected(null); setLoadedFor(null); void refresh() }, [refresh])
  const visible = user && loadedFor === user.id ? projects : []
  const project = visible.find(p => p.id === selected) ?? visible[0] ?? null
  const selectProject = useCallback((id: string) => { setSelected(id) }, [])
  const updateProject = useCallback(async (patch: Partial<Pick<Project, 'name' | 'configuration' | 'activity'>>) => {
    if (!project) throw new Error('Choisissez un projet.')
    const ownerId = currentUser.current
    const { project: updated } = await api<{ project: Project }>(`/api/projects/${project.id}`, { method: 'PATCH', body: patch })
    if (currentUser.current !== ownerId) throw new Error('Votre session a changé. Rouvrez votre espace.')
    setProjects(list => list.map(item => item.id === updated.id ? updated : item)); return updated
  }, [project?.id])
  const createProject = useCallback(async (configuration: Configuration, name?: string) => {
    const ownerId = user?.id
    if (!ownerId) throw new Error('Connectez-vous pour enregistrer votre projet.')
    const { project } = await api<{ project: Project }>('/api/projects', { method: 'POST', body: { configuration, name } })
    if (currentUser.current !== ownerId) throw new Error('Votre session a changé. Rouvrez votre espace.')
    ++request.current; setLoading(false)
    setProjects(list => [project, ...list.filter(p => p.id !== project.id)]); setSelected(project.id); setLoadedFor(ownerId); return project
  }, [user?.id])
  const value = useMemo(() => ({ project, projects: visible, loading: loading || (!!user && loadedFor !== user.id), error, selectProject, refresh, updateProject, createProject }), [project, visible, loading, user, loadedFor, error, selectProject, refresh, updateProject, createProject])
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
export function useProject() { const context = useContext(ProjectContext); if (!context) throw new Error('ProjectProvider manquant'); return context }
