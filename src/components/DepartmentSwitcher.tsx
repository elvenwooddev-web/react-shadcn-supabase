import { useUser } from '@/contexts/UserContext'
import type { Department } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

const departments: { value: Department; label: string; color: string }[] = [
  { value: 'Admin', label: 'Admin (Full Access)', color: 'bg-primary' },
  { value: 'Sales', label: 'Sales Team', color: 'bg-success' },
  { value: 'Design', label: 'Design Team', color: 'bg-purple-500' },
  { value: 'Technical', label: 'Technical Team', color: 'bg-blue-500' },
  { value: 'Procurement', label: 'Procurement', color: 'bg-warning' },
  { value: 'Production', label: 'Production', color: 'bg-violet-500' },
  { value: 'Execution', label: 'Execution Team', color: 'bg-danger' },
]

export function DepartmentSwitcher() {
  const { currentUser, switchDepartment, visibleStages } = useUser()

  if (!currentUser) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-4 max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Switch Department</h3>
          <Badge variant="outline" className="ml-auto text-xs">
            Demo Mode
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          {departments.map((dept) => (
            <Button
              key={dept.value}
              onClick={() => switchDepartment(dept.value)}
              variant={currentUser.department === dept.value ? 'default' : 'ghost'}
              className={`w-full justify-start text-sm h-9 ${
                currentUser.department === dept.value
                  ? 'bg-primary text-white'
                  : ''
              }`}
              size="sm"
            >
              <span className={`size-2 rounded-full ${dept.color} mr-2`} />
              {dept.label}
            </Button>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Current:</span> {currentUser.name}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Access:</span> {visibleStages.join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}
