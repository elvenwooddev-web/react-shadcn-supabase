import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UserContextType, Department, WorkflowStage } from '@/types'
import { DEPARTMENT_STAGES } from '@/types'
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/helpers'

// Sample users for different departments
const sampleUsers: Record<Department, User> = {
  Admin: {
    id: 'u-admin',
    name: 'Admin User',
    email: 'admin@interiorsflow.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=1193d4&color=fff',
    role: 'admin',
    department: 'Admin',
  },
  Sales: {
    id: 'u-sales',
    name: 'Sales Manager',
    email: 'sales@interiorsflow.com',
    avatar: 'https://ui-avatars.com/api/?name=Sales+Manager&background=22c55e&color=fff',
    role: 'sales',
    department: 'Sales',
  },
  Design: {
    id: 'u-design',
    name: 'Anna Kendrick',
    email: 'anna@interiorsflow.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoGw7tAQeOx48j_5f1hTWtyDe34JzGEVYQFE6AGTq39fSa9-H3kRb7CTheBrrF_ZO4pcb45Bn83DRC8DCR40l2hzlaHYFfmZbO0d6k6FpJsdZGx78qrwMVz2WW8gM7-QR1HpWO0rGC13Rorn1fgbGAaE75UXt5oqbkMbBWBPIBMCA_OGpJd-R0M-OrBeC9eug_fhPOxPkVpKRX5N-7bWIK-0czunK9hj2uNNVglqsREFaISqnSC9TjBqLfk86Pdq_klNvUHPt804oE',
    role: 'designer',
    department: 'Design',
  },
  Technical: {
    id: 'u-tech',
    name: 'Jane Foster',
    email: 'jane@interiorsflow.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASZJ1z4o0GO9MWHkKew0IngEEN3d3m-oU17gIMLZ8oJI6a3uM3K0Xe5piACWvgO8knkCp-ewAmNLOnvy5yYupjkc8XBoreCkxgjbhtPZWIx-OAq6_57k-9DYFp6vSK1FhhOzr6pqDRsT_-Gl9YSPFJ0rlDztPgI-76ohrSZ_ZGgc9pdxQVHiAnO500vKh4LcjU7iY-f9qy1c2g-eX2cQKDI2bTzT1C7L53nHk7Hb9OCj7Z1eHngkjz2DyoriwBHAbnrN499I4d1VyR',
    role: 'technical-designer',
    department: 'Technical',
  },
  Procurement: {
    id: 'u-procurement',
    name: 'Procurement Lead',
    email: 'procurement@interiorsflow.com',
    avatar: 'https://ui-avatars.com/api/?name=Procurement+Lead&background=f59e0b&color=fff',
    role: 'procurement',
    department: 'Procurement',
  },
  Production: {
    id: 'u-production',
    name: 'Production Manager',
    email: 'production@interiorsflow.com',
    avatar: 'https://ui-avatars.com/api/?name=Production+Manager&background=8b5cf6&color=fff',
    role: 'production',
    department: 'Production',
  },
  Execution: {
    id: 'u-execution',
    name: 'Site Supervisor',
    email: 'execution@interiorsflow.com',
    avatar: 'https://ui-avatars.com/api/?name=Site+Supervisor&background=ef4444&color=fff',
    role: 'execution',
    department: 'Execution',
  },
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  // Default to Admin user for full access
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromLocalStorage('currentUser', sampleUsers.Admin)
  )

  // RBAC: User list state
  const [users, setUsers] = useState<User[]>(() =>
    loadFromLocalStorage('users', Object.values(sampleUsers))
  )

  // Save current user to localStorage
  useEffect(() => {
    saveToLocalStorage('currentUser', currentUser)
  }, [currentUser])

  // Save users to localStorage
  useEffect(() => {
    if (users.length > 0) {
      saveToLocalStorage('users', users)
    }
  }, [users])

  const switchDepartment = (department: Department) => {
    setCurrentUser(sampleUsers[department])
  }

  const canAccessStage = (stage: WorkflowStage): boolean => {
    if (!currentUser) return false
    const allowedStages = DEPARTMENT_STAGES[currentUser.department]
    return allowedStages.includes(stage)
  }

  const visibleStages = currentUser
    ? DEPARTMENT_STAGES[currentUser.department]
    : []

  // ============================================================================
  // RBAC: USER CRUD OPERATIONS
  // ============================================================================

  const createUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setUsers(prev => [...prev, newUser])
    return newUser
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id
          ? { ...user, ...updates, updatedAt: new Date().toISOString() }
          : user
      )
    )

    // Update current user if it's being modified
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteUser = (id: string) => {
    // Prevent deleting current user
    if (currentUser?.id === id) {
      console.warn('Cannot delete currently logged in user')
      return
    }

    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const getUser = (id: string): User | undefined => {
    return users.find(u => u.id === id)
  }

  const activateUser = (id: string) => {
    updateUser(id, { isActive: true })
  }

  const deactivateUser = (id: string) => {
    // Prevent deactivating current user
    if (currentUser?.id === id) {
      console.warn('Cannot deactivate currently logged in user')
      return
    }

    updateUser(id, { isActive: false })
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchDepartment,
        canAccessStage,
        visibleStages,
        // RBAC: User management
        users,
        createUser,
        updateUser,
        deleteUser,
        getUser,
        activateUser,
        deactivateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
