/**
 * User Management Tab Component
 * Admin interface for managing users, roles, and permissions
 */

import { useState, useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRBAC } from '@/contexts/RBACContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
} from 'lucide-react'
import type { User } from '@/types'
import { CreateUserDialog } from './CreateUserDialog'
import { EditUserDialog } from './EditUserDialog'
import { DeleteUserDialog } from './DeleteUserDialog'

export function UserManagementTab() {
  const { users, currentUser, deleteUser, activateUser, deactivateUser } = useUser()
  const { roles, getUserRoles } = useRBAC()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && user.isActive !== false) ||
        (filterStatus === 'inactive' && user.isActive === false)

      // Department filter
      const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment

      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [users, searchQuery, filterStatus, filterDepartment])

  // Stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive !== false).length,
      inactive: users.filter(u => u.isActive === false).length,
    }
  }, [users])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              User Management
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
            >
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
              <option value="Technical">Technical</option>
              <option value="Procurement">Procurement</option>
              <option value="Production">Production</option>
              <option value="Execution">Execution</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* User Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-foreground">User</th>
                  <th className="text-left p-3 text-sm font-semibold text-foreground">Email</th>
                  <th className="text-left p-3 text-sm font-semibold text-foreground">Department</th>
                  <th className="text-left p-3 text-sm font-semibold text-foreground">Roles</th>
                  <th className="text-left p-3 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-right p-3 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const userRoles = getUserRoles(user.id)
                  const isCurrentUser = currentUser?.id === user.id

                  return (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar}
                            fallback={user.name.split(' ').map(n => n[0]).join('')}
                            className="w-10 h-10"
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs mt-1">You</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{user.department}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {userRoles.length > 0 ? (
                            userRoles.map(role => (
                              <Badge key={role.id} variant="default" className="text-xs">
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No roles assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {user.isActive !== false ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            disabled={isCurrentUser}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!isCurrentUser && (
                            <>
                              {user.isActive !== false ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deactivateUser(user.id)}
                                  title="Deactivate user"
                                >
                                  <XCircle className="w-4 h-4 text-orange-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => activateUser(user.id)}
                                  title="Activate user"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingUser(user)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'Try adjusting your search' : 'Get started by adding users'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateUserDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  )
}
