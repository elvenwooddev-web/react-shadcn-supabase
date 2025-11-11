import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StatusConfigProvider } from '@/contexts/StatusConfigContext'
import { ApprovalProvider } from '@/contexts/ApprovalContext'
import { ApprovalRuleProvider } from '@/contexts/ApprovalRuleContext'
import { UserProvider } from '@/contexts/UserContext'
import { RBACProvider } from '@/contexts/RBACContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { TaskProvider } from '@/contexts/TaskContext'
import { IssueProvider } from '@/contexts/IssueContext'
import { FileProvider } from '@/contexts/FileContext'
import { TeamProvider } from '@/contexts/TeamContext'
import { DocumentProvider } from '@/contexts/DocumentContext'
import { TemplateProvider } from '@/contexts/TemplateContext'
import { StageProvider } from '@/contexts/StageContext'
import { WorkflowRulesProvider } from '@/contexts/WorkflowRulesContext'
import { TimeTrackingProvider } from '@/contexts/TimeTrackingContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { HomePage } from '@/pages/HomePage'
import { ProjectsListPage } from '@/pages/ProjectsListPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NewProjectPage } from '@/pages/NewProjectPage'
import { IssuesPage } from '@/pages/IssuesPage'
import { ApprovalsPage } from '@/pages/ApprovalsPage'
import { ApprovalsSettingsPage } from '@/pages/ApprovalsSettingsPage'
import { ProjectLayout } from '@/pages/ProjectLayout'
import { ProjectOverviewPage } from '@/pages/ProjectOverviewPage'
import { TemplatesListPage } from '@/pages/TemplatesListPage'
import { TemplateEditorPage } from '@/pages/TemplateEditorPage'
import { WorkflowPage } from '@/pages/WorkflowPage'
import { FilesPage } from '@/pages/FilesPage'
import { ChatPage } from '@/pages/ChatPage'
import { MyWorkPage } from '@/pages/MyWorkPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AdvancedDashboardPage } from '@/pages/AdvancedDashboardPage'
import { CommandPalette } from '@/components/shared'

function App() {
  return (
    <BrowserRouter>
      <StatusConfigProvider>
        <UserProvider>
          <RBACProvider>
            <TemplateProvider>
            <ProjectProvider>
              <TeamProvider>
                <ApprovalProvider>
                  <ApprovalRuleProvider>
                    <TaskProvider>
                      <FileProvider>
                        <DocumentProvider>
                          <IssueProvider>
                            <StageProvider>
                              <WorkflowRulesProvider>
                                <TimeTrackingProvider>
                                  <NotificationProvider>
                          <CommandPalette />
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/projects" element={<ProjectsListPage />} />
                            <Route path="/dashboard" element={<AdvancedDashboardPage />} />
                            <Route path="/my-work" element={<MyWorkPage />} />
                            <Route path="/calendar" element={<CalendarPage />} />
                            <Route path="/projects/new" element={<NewProjectPage />} />
                            <Route path="/templates" element={<TemplatesListPage />} />
                            <Route path="/templates/:id/edit" element={<TemplateEditorPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/issues" element={<IssuesPage />} />
                            <Route path="/approvals" element={<ApprovalsPage />} />
                            <Route path="/approvals/settings" element={<ApprovalsSettingsPage />} />
                            <Route path="/projects/:projectId/settings" element={<SettingsPage />} />
                            <Route path="/projects/:projectId/approvals/settings" element={<ApprovalsSettingsPage />} />
                            <Route path="/projects/:projectId" element={<ProjectLayout />}>
                              <Route index element={<Navigate to="workflow" replace />} />
                              <Route path="overview" element={<ProjectOverviewPage />} />
                              <Route path="workflow" element={<WorkflowPage />} />
                              <Route path="files" element={<FilesPage />} />
                              <Route path="chat" element={<ChatPage />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                                  </NotificationProvider>
                                </TimeTrackingProvider>
                              </WorkflowRulesProvider>
                            </StageProvider>
                          </IssueProvider>
                        </DocumentProvider>
                      </FileProvider>
                    </TaskProvider>
                  </ApprovalRuleProvider>
                </ApprovalProvider>
              </TeamProvider>
            </ProjectProvider>
          </TemplateProvider>
          </RBACProvider>
        </UserProvider>
      </StatusConfigProvider>
    </BrowserRouter>
  )
}

export default App
