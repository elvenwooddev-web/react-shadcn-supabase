import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    return stored || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
    >
      <div className="flex items-center gap-3">
        {theme === 'light' ? (
          <Sun className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">
          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </span>
      </div>

      {/* Toggle Switch */}
      <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted transition-colors">
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
            theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
}
