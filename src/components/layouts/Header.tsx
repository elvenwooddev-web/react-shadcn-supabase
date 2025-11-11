import { useNavigate } from 'react-router-dom'
import { Search, Settings, LayoutGrid, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { NotificationCenter } from '@/components/shared'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-3 sm:px-6 py-3 bg-card sticky top-0 z-20">
      <div className="flex items-center gap-2 sm:gap-8">
        {/* Mobile menu button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 sm:gap-3 text-foreground hover:opacity-80 transition-opacity"
        >
          <div className="size-5 sm:size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">
            InteriorsFlow
          </h2>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-muted-foreground hidden md:flex"
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          All Projects
        </Button>
      </div>
      <div className="flex flex-1 justify-end gap-2 sm:gap-4">
        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex w-full max-w-64">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="h-10 pl-9 bg-muted border-none"
            />
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
          {/* Search button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 bg-muted hover:bg-muted/80"
          >
            <Search className="h-5 w-5" />
          </Button>
          <div className="hidden sm:flex">
            <NotificationCenter />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-muted hover:bg-muted/80"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <Avatar
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC4hZweZZ_Wklobk-DYU7efq-jsk22Zux2k4bgZ_o28lGcyRqXF7MSHUQAVJP_gg0ntdMGWPgIxZ-7iAqjoVD-83jysvRa6EIf2Ccfcblnz5slc1ThfV9i0EFyKwFPg1FDhPjQO3xsXJDFNNYmT45h1N8UAQnb9roCg3FapWvDgqK_E4S9bzMoSSuJ2r4PloWQaOjy_b8v300_j0lh3JWFxJ902ICgjruadualdBTHNuMILNpZhRmwNbvKMrT2eeYc8MGYo6453Rpq"
          alt="User profile picture"
          className="hidden sm:block"
        />
      </div>
    </header>
  )
}
