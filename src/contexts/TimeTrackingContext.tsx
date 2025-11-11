import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { TimeEntry } from '@/types'
import { generateId } from '@/lib/helpers'

interface TimeTrackingContextType {
  timeEntries: TimeEntry[]
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteTimeEntry: (id: string) => void
  getTimeEntriesForTask: (taskId: string) => TimeEntry[]
  getTotalHoursForTask: (taskId: string) => number
  getTimeEntriesForUser: (userId: string, startDate?: Date, endDate?: Date) => TimeEntry[]
  getTotalHoursForUser: (userId: string, startDate?: Date, endDate?: Date) => number
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined)

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  // Load time entries from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('timeEntries')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const withDates = parsed.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
        }))
        setTimeEntries(withDates)
      } catch (error) {
        console.error('Failed to load time entries:', error)
      }
    }
  }, [])

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries))
  }, [timeEntries])

  const addTimeEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date(),
    }
    setTimeEntries(prev => [...prev, newEntry])
  }

  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    )
  }

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const getTimeEntriesForTask = (taskId: string) => {
    return timeEntries.filter(entry => entry.taskId === taskId)
  }

  const getTotalHoursForTask = (taskId: string) => {
    const entries = getTimeEntriesForTask(taskId)
    return entries.reduce((total, entry) => {
      return total + entry.hours + (entry.minutes / 60)
    }, 0)
  }

  const getTimeEntriesForUser = (userId: string, startDate?: Date, endDate?: Date) => {
    let entries = timeEntries.filter(entry => entry.userId === userId)

    if (startDate || endDate) {
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        if (startDate && entryDate < startDate) return false
        if (endDate && entryDate > endDate) return false
        return true
      })
    }

    return entries
  }

  const getTotalHoursForUser = (userId: string, startDate?: Date, endDate?: Date) => {
    const entries = getTimeEntriesForUser(userId, startDate, endDate)
    return entries.reduce((total, entry) => {
      return total + entry.hours + (entry.minutes / 60)
    }, 0)
  }

  return (
    <TimeTrackingContext.Provider
      value={{
        timeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        getTimeEntriesForTask,
        getTotalHoursForTask,
        getTimeEntriesForUser,
        getTotalHoursForUser,
      }}
    >
      {children}
    </TimeTrackingContext.Provider>
  )
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext)
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider')
  }
  return context
}
