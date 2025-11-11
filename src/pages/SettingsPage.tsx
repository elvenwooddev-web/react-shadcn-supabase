import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings as SettingsIcon, Workflow, Users, Palette, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeftSidebar } from '@/components/layouts'
import { WorkflowRulesTab } from '@/components/settings/WorkflowRulesTab'
import { StatusConfigTab } from '@/components/settings/StatusConfigTab'
import { RBACTab } from '@/components/settings/RBACTab'
import { useProjects } from '@/contexts/ProjectContext'

type SettingsTab = 'workflow' | 'status' | 'team' | 'appearance' | 'general'

export function SettingsPage() {
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const { currentProject } = useProjects()
  const [activeTab, setActiveTab] = useState<SettingsTab>('workflow')

  const isProjectSettings = !!projectId
  const scope = isProjectSettings ? 'project' : 'global'

  const tabs = [
    { id: 'workflow', label: 'Workflow Rules', icon: Workflow },
    { id: 'status', label: 'Status Configuration', icon: Tag },
    { id: 'team', label: 'Team & Access', icon: Users },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'general', label: 'General', icon: SettingsIcon },
  ]

  return (
    <div className="flex bg-background">
      {!isProjectSettings && <LeftSidebar />}

      <div className="flex-1 p-8 min-h-screen">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate(isProjectSettings ? `/projects/${projectId}/workflow` : '/')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {isProjectSettings ? 'Project' : 'Projects'}
              </Button>
              <h1 className="text-3xl font-bold text-foreground">
                {isProjectSettings ? `${currentProject?.name} Settings` : 'Global Settings'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isProjectSettings
                  ? 'Configure workflow rules and preferences for this project'
                  : 'Configure default workflow rules and global preferences'
                }
              </p>
            </div>
            <Badge variant={isProjectSettings ? 'default' : 'secondary'}>
              {isProjectSettings ? 'Project Settings' : 'Global Settings'}
            </Badge>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'workflow' && <WorkflowRulesTab scope={scope} projectId={projectId} />}

            {activeTab === 'status' && <StatusConfigTab />}

            {activeTab === 'team' && <RBACTab />}

            {activeTab === 'appearance' && (
              <Card className="p-6">
                <p className="text-muted-foreground">Appearance settings coming soon...</p>
              </Card>
            )}

            {activeTab === 'general' && (
              <Card className="p-6">
                <p className="text-muted-foreground">General settings coming soon...</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
