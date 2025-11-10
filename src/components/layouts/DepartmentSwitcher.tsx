import { useUser } from '@/contexts/UserContext'
import type { Department } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

const departments: { value: Department; label: string; color: string }[] = [
  { value: 'Admin', label: 'Admin', color: 'bg-primary' },
  { value: 'Sales', label: 'Sales', color: 'bg-success' },
  { value: 'Design', label: 'Design', color: 'bg-purple-500' },
  { value: 'Technical', label: 'Technical', color: 'bg-blue-500' },
  { value: 'Procurement', label: 'Procurement', color: 'bg-warning' },
  { value: 'Production', label: 'Production', color: 'bg-violet-500' },
  { value: 'Execution', label: 'Execution', color: 'bg-danger' },
]

export function DepartmentSwitcher() {
  const { currentUser, switchDepartment } = useUser()

  if (!currentUser) return null

  return (
    <div className="border-t border-border pt-3 mt-3">
      <div className="flex items-center gap-2 mb-2 px-1">
        <AlertCircle className="h-3.5 w-3.5 text-warning" />
        <span className="text-xs font-medium text-muted-foreground">Demo Mode</span>
        <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">
          Testing
        </Badge>
      </div>

      <p className="text-[10px] text-muted-foreground px-1 mb-2 leading-relaxed">
        Switch departments to test role-based access. In production, this would be determined by your login credentials.
      </p>

      <div className="space-y-0.5">
        {departments.map((dept) => (
          <Button
            key={dept.value}
            onClick={() => switchDepartment(dept.value)}
            variant={currentUser.department === dept.value ? 'default' : 'ghost'}
            className={`w-full justify-start text-xs h-7 ${
              currentUser.department === dept.value
                ? 'bg-primary text-white'
                : ''
            }`}
            size="sm"
          >
            <span className={`size-1.5 rounded-full ${dept.color} mr-2`} />
            {dept.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
