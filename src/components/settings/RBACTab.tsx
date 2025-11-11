/**
 * RBAC Tab Component
 * Main tab for managing roles, permissions, and users
 */

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RolePermissionMatrix } from './RolePermissionMatrix'
import { UserManagementTab } from './UserManagementTab'
import { Shield, Users } from 'lucide-react'

export function RBACTab() {
  const [activeTab, setActiveTab] = useState('permissions')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Team & Access Control</h2>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions for your organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="w-4 h-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="mt-6">
          <RolePermissionMatrix />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
