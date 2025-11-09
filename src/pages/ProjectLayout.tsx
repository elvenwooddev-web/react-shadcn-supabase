import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { LeftSidebar } from '@/components/LeftSidebar'
import { RightSidebar } from '@/components/RightSidebar'
import { DepartmentSwitcher } from '@/components/DepartmentSwitcher'

export function ProjectLayout() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar />
        <Outlet />
        <RightSidebar />
      </div>
      <DepartmentSwitcher />
    </div>
  )
}
