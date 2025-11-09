import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from '@/contexts/UserContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { TaskProvider } from '@/contexts/TaskContext'
import { FileProvider } from '@/contexts/FileContext'
import { TeamProvider } from '@/contexts/TeamContext'
import { DocumentProvider } from '@/contexts/DocumentContext'
import { ProjectsListPage } from '@/pages/ProjectsListPage'
import { NewProjectPage } from '@/pages/NewProjectPage'
import { ProjectLayout } from '@/pages/ProjectLayout'
import { ProjectOverviewPage } from '@/pages/ProjectOverviewPage'
import { WorkflowPage } from '@/components/WorkflowPage'
import { FilesPage } from '@/components/FilesPage'
import { ChatPage } from '@/pages/ChatPage'

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ProjectProvider>
          <TaskProvider>
            <FileProvider>
              <DocumentProvider>
                <TeamProvider>
                  <Routes>
                    {/* Projects List */}
                    <Route path="/" element={<ProjectsListPage />} />

                    {/* New Project */}
                    <Route path="/projects/new" element={<NewProjectPage />} />

                    {/* Project Pages with Layout */}
                    <Route path="/projects/:projectId" element={<ProjectLayout />}>
                      <Route index element={<Navigate to="workflow" replace />} />
                      <Route path="overview" element={<ProjectOverviewPage />} />
                      <Route path="workflow" element={<WorkflowPage />} />
                      <Route path="files" element={<FilesPage />} />
                      <Route path="chat" element={<ChatPage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </TeamProvider>
              </DocumentProvider>
            </FileProvider>
          </TaskProvider>
        </ProjectProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
