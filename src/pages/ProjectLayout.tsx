import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { LeftSidebar } from '@/components/LeftSidebar'
import { RightSidebar } from '@/components/RightSidebar'

export function ProjectLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className="flex flex-1">
        <LeftSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <Outlet />
        <RightSidebar />
      </div>
    </div>
  )
}
