import { useState, useEffect, type FormEvent } from 'react'
import { Edit, Sparkles } from 'lucide-react'
import { useStatusConfig } from '@/contexts/StatusConfigContext'
import type { StatusConfig, AutoAction } from '@/types'
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

interface EditStatusDialogProps {
  status: StatusConfig
  trigger?: React.ReactNode
}

export function EditStatusDialog({ status, trigger }: EditStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const { updateStatus, getStatusConfigs } = useStatusConfig()

  const [formData, setFormData] = useState({
    value: status.value,
    label: status.label,
    color: status.color,
    icon: status.icon || 'Circle',
    isDefault: status.isDefault,
    isActive: status.isActive,
    allowedTransitions: status.allowedTransitions || [],
    autoActions: status.autoActions || [],
  })

  const existingStatuses = getStatusConfigs(status.entityType).filter(
    (s) => s.id !== status.id
  )

  useEffect(() => {
    if (open) {
      setFormData({
        value: status.value,
        label: status.label,
        color: status.color,
        icon: status.icon || 'Circle',
        isDefault: status.isDefault,
        isActive: status.isActive,
        allowedTransitions: status.allowedTransitions || [],
        autoActions: status.autoActions || [],
      })
    }
  }, [open, status])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Validate value is unique (if changed)
    if (
      formData.value !== status.value &&
      existingStatuses.some((s) => s.value === formData.value)
    ) {
      alert('A status with this value already exists!')
      return
    }

    updateStatus(status.id, {
      value: formData.value,
      label: formData.label,
      color: formData.color,
      icon: formData.icon,
      isDefault: formData.isDefault,
      isActive: formData.isActive,
      allowedTransitions: formData.allowedTransitions,
      autoActions: formData.autoActions,
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
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Edit Status: {status.label}
          </DialogTitle>
          <DialogDescription>
            Update status configuration, colors, and workflow transitions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-value">
                  Status Value* <span className="text-xs text-muted-foreground">(machine-readable)</span>
                </Label>
                <Input
                  id="edit-value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="in-progress"
                  required
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-label">Display Label*</Label>
                <Input
                  id="edit-label"
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
                  id="edit-isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked as boolean })
                  }
                />
                <label
                  htmlFor="edit-isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as default status
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <label
                  htmlFor="edit-isActive"
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
                  Select which statuses can transition TO this status
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {existingStatuses.map((existingStatus) => (
                  <div key={existingStatus.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-transition-${existingStatus.id}`}
                      checked={formData.allowedTransitions.includes(existingStatus.value)}
                      onCheckedChange={() => toggleTransition(existingStatus.value)}
                    />
                    <label
                      htmlFor={`edit-transition-${existingStatus.id}`}
                      className="text-sm leading-none cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: existingStatus.color }}
                      />
                      {existingStatus.label}
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
                entityType={status.entityType}
                status={formData.value}
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
