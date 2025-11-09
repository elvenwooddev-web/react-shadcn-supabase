import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { TeamMember, Activity, TeamContextType } from '@/types'
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'
import { useProjects } from './ProjectContext'

const initialActivities: Activity[] = [
  {
    id: 'a1',
    type: 'task-completed',
    userId: 'tm1',
    userName: 'Anna',
    userAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoGw7tAQeOx48j_5f1hTWtyDe34JzGEVYQFE6AGTq39fSa9-H3kRb7CTheBrrF_ZO4pcb45Bn83DRC8DCR40l2hzlaHYFfmZbO0d6k6FpJsdZGx78qrwMVz2WW8gM7-QR1HpWO0rGC13Rorn1fgbGAaE75UXt5oqbkMbBWBPIBMCA_OGpJd-R0M-OrBeC9eug_fhPOxPkVpKRX5N-7bWIK-0czunK9hj2uNNVglqsREFaISqnSC9TjBqLfk86Pdq_klNvUHPt804oE',
    message: "completed 'Create GFC drawings'.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'a2',
    type: 'file-uploaded',
    userId: 'tm2',
    userName: 'Sam',
    userAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmbd2lpY_EcxDwHAyoMCR0oETzzQMKcDHsTZbwv2FMgstnYB9iRRT1CPtzKlt8qhbfM-PVHJxQGWqP7f-muB5BhXX5_fECbX6mdAiUv1sCVhtoYzDKytJ-cb_B186OQA8XrB6lRMa-dQUdBaqIjZNuIUNHsgAsTUT3XvzwGZKyLWrZxQVa-kEJSZrP8Mn0jV9T3Hsj5A9mUI345hI4X2mf336ao4mf-PeygabO_GHjYDe3QLkkhJWsP-iE_JAGiJASIT8HNlz8HhE8',
    message: "uploaded 'Final Renders.zip'.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'a3',
    type: 'comment-added',
    userId: 'tm3',
    userName: 'Jane',
    userAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASZJ1z4o0GO9MWHkKew0IngEEN3d3m-oU17gIMLZ8oJI6a3uM3K0Xe5piACWvgO8knkCp-ewAmNLOnvy5yYupjkc8XBoreCkxgjbhtPZWIx-OAq6_57k-9DYFp6vSK1FhhOzr6pqDRsT_-Gl9YSPFJ0rlDztPgI-76ohrSZ_ZGgc9pdxQVHiAnO500vKh4LcjU7iY-f9qy1c2g-eX2cQKDI2bTzT1C7L53nHk7Hb9OCj7Z1eHngkjz2DyoriwBHAbnrN499I4d1VyR',
    message: "commented on 'Electrical Layout'.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProjects()
  const [allActivities, setAllActivities] = useState<Record<string, Activity[]>>(() =>
    loadFromLocalStorage('activities', { p1: initialActivities })
  )

  const teamMembers = currentProject?.teamMembers || []
  const activities = currentProject ? allActivities[currentProject.id] || [] : []

  useEffect(() => {
    saveToLocalStorage('activities', allActivities)
  }, [allActivities])

  const addTeamMember = (_member: Omit<TeamMember, 'id'>) => {
    if (!currentProject) return
    // Update project team members
    // TODO: Integrate with ProjectContext to update project.teamMembers
  }

  const removeTeamMember = (_id: string) => {
    if (!currentProject) return
    // TODO: Integrate with ProjectContext to remove from project.teamMembers
  }

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    if (!currentProject) return

    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      timestamp: new Date(),
    }

    setAllActivities((prev) => ({
      ...prev,
      [currentProject.id]: [newActivity, ...(prev[currentProject.id] || [])],
    }))
  }

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        activities,
        addTeamMember,
        removeTeamMember,
        addActivity,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
