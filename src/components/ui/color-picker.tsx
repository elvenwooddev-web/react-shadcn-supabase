import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

// Preset colors matching the theme
const PRESET_COLORS = [
  { name: 'Primary', value: '#3B82F6' },
  { name: 'Success', value: '#10B981' },
  { name: 'Warning', value: '#F59E0B' },
  { name: 'Danger', value: '#EF4444' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Slate', value: '#64748B' },
  { name: 'Blue', value: '#0EA5E9' },
]

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value)

  const handlePresetClick = (color: string) => {
    onChange(color)
    setCustomColor(color)
  }

  const handleCustomChange = (color: string) => {
    setCustomColor(color)
    onChange(color)
  }

  const handleHexInput = (hex: string) => {
    // Ensure hex starts with #
    const formatted = hex.startsWith('#') ? hex : `#${hex}`
    setCustomColor(formatted)

    // Only update if it's a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(formatted)) {
      onChange(formatted)
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10"
          >
            <div
              className="size-5 rounded border border-border"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left">{value.toUpperCase()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Preset Colors */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Preset Colors
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetClick(preset.value)}
                    className={cn(
                      "relative size-8 rounded border-2 transition-all hover:scale-110",
                      value === preset.value
                        ? "border-foreground ring-2 ring-primary ring-offset-2"
                        : "border-border"
                    )}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  >
                    {value === preset.value && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Custom Color
              </Label>
              <HexColorPicker color={customColor} onChange={handleCustomChange} style={{ width: '100%' }} />
            </div>

            {/* Hex Input */}
            <div>
              <Label htmlFor="hex-input" className="text-xs text-muted-foreground mb-2 block">
                Hex Code
              </Label>
              <Input
                id="hex-input"
                value={customColor}
                onChange={(e) => handleHexInput(e.target.value)}
                placeholder="#3B82F6"
                className="font-mono"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
