import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from '@/contexts/UserContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { TaskProvider } from '@/contexts/TaskContext'
import { IssueProvider } from '@/contexts/IssueContext'
import { FileProvider } from '@/contexts/FileContext'
import { TeamProvider } from '@/contexts/TeamContext'
import { DocumentProvider } from '@/contexts/DocumentContext'
import { TemplateProvider } from '@/contexts/TemplateContext'
import { StageProvider } from '@/contexts/StageContext'
import { WorkflowRulesProvider } from '@/contexts/WorkflowRulesContext'
import { ProjectsListPage } from '@/pages/ProjectsListPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NewProjectPage } from '@/pages/NewProjectPage'
import { IssuesPage } from '@/pages/IssuesPage'
import { ProjectLayout } from '@/pages/ProjectLayout'
import { ProjectOverviewPage } from '@/pages/ProjectOverviewPage'
import { TemplatesListPage } from '@/pages/TemplatesListPage'
import { TemplateEditorPage } from '@/pages/TemplateEditorPage'
import { WorkflowPage } from '@/components/WorkflowPage'
import { FilesPage } from '@/components/FilesPage'
import { ChatPage } from '@/pages/ChatPage'

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <TemplateProvider>
          <ProjectProvider>
            <TaskProvider>
              <FileProvider>
                <DocumentProvider>
                  <TeamProvider>
                    <IssueProvider>
                      <StageProvider>
                        <WorkflowRulesProvider>
                          <Routes>
                            <Route path="/" element={<ProjectsListPage />} />
                            <Route path="/projects/new" element={<NewProjectPage />} />
                            <Route path="/templates" element={<TemplatesListPage />} />
                            <Route path="/templates/:id/edit" element={<TemplateEditorPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/issues" element={<IssuesPage />} />
                            <Route path="/projects/:projectId/settings" element={<SettingsPage />} />
                            <Route path="/projects/:projectId" element={<ProjectLayout />}>
                              <Route index element={<Navigate to="workflow" replace />} />
                              <Route path="overview" element={<ProjectOverviewPage />} />
                              <Route path="workflow" element={<WorkflowPage />} />
                              <Route path="files" element={<FilesPage />} />
                              <Route path="chat" element={<ChatPage />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </WorkflowRulesProvider>
                      </StageProvider>
                    </IssueProvider>
                  </TeamProvider>
                </DocumentProvider>
              </FileProvider>
            </TaskProvider>
          </ProjectProvider>
        </TemplateProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
