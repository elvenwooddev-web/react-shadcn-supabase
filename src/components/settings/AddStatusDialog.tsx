import { useState, type FormEvent } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useStatusConfig } from '@/contexts/StatusConfigContext'
import type { StatusEntityType, AutoAction } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { StatusBadge } from '@/components/ui/status-badge'

interface AddStatusDialogProps {
  entityType: StatusEntityType
}

export function AddStatusDialog({ entityType }: AddStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const { createStatus, getStatusConfigs } = useStatusConfig()

  const [formData, setFormData] = useState({
    value: '',
    label: '',
    color: '#3B82F6',
    icon: 'Circle',
    isDefault: false,
    isActive: true,
    allowedTransitions: [] as string[],
    autoActions: [] as AutoAction[],
  })

  const existingStatuses = getStatusConfigs(entityType)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Validate value is unique
    if (existingStatuses.some((s) => s.value === formData.value)) {
      alert('A status with this value already exists!')
      return
    }

    // Calculate order (add to end)
    const maxOrder = Math.max(...existingStatuses.map((s) => s.order), -1)

    createStatus({
      entityType,
      ...formData,
      order: maxOrder + 1,
    })

    // Reset form
    setFormData({
      value: '',
      label: '',
      color: '#3B82F6',
      icon: 'Circle',
      isDefault: false,
      isActive: true,
      allowedTransitions: [],
      autoActions: [],
    })

    setOpen(false)
  }

  const toggleTransition = (statusValue: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedTransitions: prev.allowedTransitions.includes(statusValue)
        ? prev.allowedTransitions.filter((v) => v !== statusValue)
        : [...prev.allowedTransitions, statusValue],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Status
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Status
          </DialogTitle>
          <DialogDescription>
            Configure a custom status with color, icon, and workflow transitions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  Status Value* <span className="text-xs text-muted-foreground">(machine-readable)</span>
                </Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="in-progress"
                  required
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Display Label*</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="In Progress"
                  required
                />
              </div>
            </div>

            {/* Color and Icon */}
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                value={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
                label="Status Color*"
              />

              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
                label="Status Icon"
              />
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked as boolean })
                  }
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as default status
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Workflow Transitions */}
          {existingStatuses.length > 0 && (
            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <Label className="text-sm font-semibold">Allowed Transitions</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Select which statuses can transition TO this new status
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {existingStatuses.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`transition-${status.id}`}
                      checked={formData.allowedTransitions.includes(status.value)}
                      onCheckedChange={() => toggleTransition(status.value)}
                    />
                    <label
                      htmlFor={`transition-${status.id}`}
                      className="text-sm leading-none cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
              {formData.allowedTransitions.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No restrictions - can transition from any status
                </p>
              )}
            </div>
          )}

          {/* Live Preview */}
          <div className="space-y-3 border-t border-border pt-4">
            <Label className="text-sm font-semibold">Preview</Label>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <StatusBadge
                entityType={entityType}
                status={formData.value || 'preview'}
                showIcon={!!formData.icon}
              />
              <span className="text-sm text-muted-foreground">
                How this status will appear
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
