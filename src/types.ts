export type ReleaseStatus = 'ready' | 'in_review' | 'in_progress' | 'blocked'
export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface Release {
  id: string
  code: string
  name: string
  summary: string
  owner: { initials: string; name: string; team: string }
  status: ReleaseStatus
  severity: Severity
  targetDate: string
}
