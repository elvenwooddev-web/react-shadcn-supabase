import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Search, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  label?: string
}

// Curated list of commonly used status icons
const STATUS_ICONS = [
  'Circle',
  'CheckCircle',
  'CheckCircle2',
  'XCircle',
  'AlertCircle',
  'AlertTriangle',
  'Clock',
  'Loader',
  'PlayCircle',
  'PauseCircle',
  'StopCircle',
  'Upload',
  'Download',
  'FileCheck',
  'FileX',
  'FileText',
  'Archive',
  'Trash2',
  'Flag',
  'Bookmark',
  'Star',
  'Heart',
  'ThumbsUp',
  'ThumbsDown',
  'Lock',
  'Unlock',
  'Eye',
  'EyeOff',
  'CheckSquare',
  'Square',
  'MinusCircle',
  'PlusCircle',
  'Ban',
  'Zap',
  'TrendingUp',
  'TrendingDown',
  'Target',
  'Award',
  'Activity',
  'Crosshair',
]

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIcons = STATUS_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  )

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (!IconComponent) return null
    return <IconComponent className="h-5 w-5" />
  }

  const SelectedIcon = value ? (LucideIcons as any)[value] : null

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10"
          >
            <div className="size-5 flex items-center justify-center text-muted-foreground">
              {SelectedIcon ? (
                <SelectedIcon className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span className="flex-1 text-left text-sm">
              {value || 'Select icon...'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Icon Grid */}
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((iconName) => {
                  const isSelected = value === iconName
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        onChange(iconName)
                        setOpen(false)
                      }}
                      className={cn(
                        "relative flex items-center justify-center size-10 rounded border-2 transition-all hover:bg-muted",
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
                          : "border-border"
                      )}
                      title={iconName}
                    >
                      {renderIcon(iconName)}
                      {isSelected && (
                        <Check className="absolute -top-1 -right-1 h-3 w-3 text-primary bg-background rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
              {filteredIcons.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No icons found
                </p>
              )}
            </div>

            {/* Selected Icon Name */}
            {value && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-mono text-foreground">{value}</span>
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
