import { useState } from 'react'
import { useTimeTracking } from '@/contexts/TimeTrackingContext'
import { useUser } from '@/contexts/UserContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Task } from '@/types'

interface TimeTrackingDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TimeTrackingDialog({ task, open, onOpenChange }: TimeTrackingDialogProps) {
  const { currentUser } = useUser()
  const { addTimeEntry, getTimeEntriesForTask, getTotalHoursForTask, deleteTimeEntry } = useTimeTracking()

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [description, setDescription] = useState('')

  const timeEntries = getTimeEntriesForTask(task.id)
  const totalHours = getTotalHoursForTask(task.id)

  const handleSubmit = () => {
    if (!currentUser || (hours === 0 && minutes === 0)) return

    addTimeEntry({
      userId: currentUser.id,
      userName: currentUser.name,
      taskId: task.id,
      date,
      hours,
      minutes,
      description: description || undefined,
    })

    // Reset form
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setHours(0)
    setMinutes(0)
    setDescription('')
  }

  const handleDelete = (entryId: string) => {
    deleteTimeEntry(entryId)
  }

  const formatDuration = (hours: number, minutes: number) => {
    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    return parts.join(' ') || '0m'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Tracking - {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Time Logged</div>
                <div className="text-2xl font-bold">{totalHours.toFixed(2)}h</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Estimated Time</div>
                <div className="text-2xl font-bold">{task.estimatedHours || 0}h</div>
              </div>
            </div>
            {task.estimatedHours && totalHours > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{Math.round((totalHours / task.estimatedHours) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${Math.min((totalHours / task.estimatedHours) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Log New Time Entry */}
          <div className="space-y-4">
            <h3 className="font-semibold">Log New Time Entry</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What did you work on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Log Time
            </Button>
          </div>

          {/* Time Entries List */}
          {timeEntries.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Time Entries ({timeEntries.length})</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {timeEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 border rounded-lg flex items-start justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{entry.userName}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-sm font-medium text-primary">
                            {formatDuration(entry.hours, entry.minutes)}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        )}
                      </div>
                      {currentUser && entry.userId === currentUser.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
