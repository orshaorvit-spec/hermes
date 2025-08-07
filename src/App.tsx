import React, { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Board } from './components/Board';
import { Dashboard } from './components/Dashboard';
import { ProjectsLobby } from './components/ProjectsLobby';
import { ProjectBoard } from './components/ProjectBoard';
import { DocumentsSection } from './components/DocumentsSection';
import { SettingsModal } from './components/SettingsModal';
import { MarketingSection } from './components/MarketingSection';
import { useBoard } from './hooks/useBoard';
import { useProjects } from './hooks/useProjects';
import { useDocuments } from './hooks/useDocuments';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading, error, isSupabaseConfigured } = useAuth();
  
  const {
    projects,
    loading: projectsLoading,
    createProject,
    updateProject,
    archiveProject,
    leaveProject
  } = useProjects();

  const {
    documents,
    templates,
    loading: documentsLoading,
    createDocument,
    updateDocument,
    deleteDocument,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useDocuments(projects);

  const [activeView, setActiveView] = useState<'projects' | 'documents' | 'analytics' | 'projectBoard'>('projects');
  const [activeView, setActiveView] = useState<'projects' | 'documents' | 'analytics' | 'marketing' | 'projectBoard'>('projects');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<any>(null);
  
  // Board hook только когда есть активный проект
  const {
    board,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    getTaskComments
  } = useBoard(currentProjectId || undefined);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Получаем все задачи из доски для поиска
  const allTasks = board.columns.flatMap(column => column.tasks);

  const handleTaskSelect = (task: any) => {
    // Открываем детали задачи или переходим к ней
    console.log('Selected task:', task);
    // Здесь можно добавить логику для открытия модального окна с деталями задачи
  };

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setCurrentProjectId(projectId);
    setCurrentProject(project);
    setActiveView('projectBoard');
  };

  const handleBackToProjects = () => {
    setCurrentProjectId(null);
    setCurrentProject(null);
    setActiveView('projects');
  };


  const renderContent = () => {
    switch (activeView) {
      case 'projects':
        return (
          <ProjectsLobby
            projects={projects}
            onOpenProject={handleOpenProject}
            onCreateProject={createProject}
            onArchiveProject={archiveProject}
            onLeaveProject={leaveProject}
          />
        );
      case 'documents':
        return (
          <DocumentsSection
            documents={documents}
            projects={projects}
            onCreateDocument={createDocument}
            onUpdateDocument={updateDocument}
            onDeleteDocument={deleteDocument}
            templates={templates}
            onCreateTemplate={createTemplate}
          />
        );
      case 'projectBoard':
        return (
          currentProject && (
            <ProjectBoard
              project={currentProject}
              onBack={handleBackToProjects}
              board={board}
              onMoveTask={moveTask}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddComment={addComment}
              getTaskComments={getTaskComments}
            />
          )
        );
      case 'analytics':
        return (
          <Dashboard 
            projects={projects}
            onOpenProject={handleOpenProject}
          />
        );
      case 'marketing':
        return <MarketingSection />;
      default:
        return (
          <ProjectsLobby
            projects={projects}
            onOpenProject={handleOpenProject}
            onCreateProject={createProject}
            onArchiveProject={archiveProject}
            onLeaveProject={leaveProject}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeView={activeView}
        onViewChange={setActiveView}
        onSettingsClick={() => setIsSettingsOpen(true)}
        showBackButton={currentProjectId !== null}
        onBackClick={handleBackToProjects}
      />
      
      <div className="flex-1 flex flex-col">
        {activeView !== 'projects' && activeView !== 'projectBoard' && (
          <Header
            onAddTask={addTask}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            allTasks={allTasks}
            onTaskSelect={handleTaskSelect}
          />
        )}
        
        <main className={`flex-1 ${activeView === 'projects' || activeView === 'projectBoard' || activeView === 'documents' ? '' : 'overflow-y-auto'} ${isSidebarCollapsed ? 'ml-0' : 'md:ml-0'}`}>
          {renderContent()}
        </main>
      </div>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;