import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/auth.store'
import { getWorkspaces, createWorkspace } from '../api/workspace.api'
import { getProjects, createProject } from '../api/project.api'
import api from '../lib/axios'

const Dashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState([])
  const [projects, setProjects] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    loadWorkspaces()
  }, [])

  useEffect(() => {
    if (activeWorkspace) loadProjects(activeWorkspace._id)
  }, [activeWorkspace])

  const loadWorkspaces = async () => {
    try {
      const data = await getWorkspaces()
      setWorkspaces(data)
      if (data.length > 0) setActiveWorkspace(data[0])
    } catch (err) {
      console.error(err)
    }
  }

  const loadProjects = async (workspaceId) => {
    try {
      const data = await getProjects(workspaceId)
      setProjects(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    try {
      const ws = await createWorkspace(newWorkspaceName)
      setWorkspaces([...workspaces, ws])
      setActiveWorkspace(ws)
      setNewWorkspaceName('')
      setShowNewWorkspace(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !activeWorkspace) return
    try {
      const proj = await createProject(activeWorkspace._id, newProjectName, '')
      setProjects([...projects, proj])
      setNewProjectName('')
      setShowNewProject(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    await api.get('/auth/logout')
    window.location.href = '/login'
  }

  return (
    <div className="h-screen flex bg-gray-50">
      
      {/* sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-xl">🚢</span>
          <span className="text-sm font-medium text-gray-900">Shipyard</span>
        </div>

        <div className="p-3 flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-2">Workspaces</p>
          {workspaces.map(ws => (
            <button
              key={ws._id}
              onClick={() => setActiveWorkspace(ws)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                activeWorkspace?._id === ws._id
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {ws.name}
            </button>
          ))}
          <button
            onClick={() => setShowNewWorkspace(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            + New workspace
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center gap-2">
          {user?.avatar_url && <img src={user.avatar_url} className="w-6 h-6 rounded-full" />}
          <span className="text-xs text-gray-500 flex-1 truncate">{user?.name || user?.github_id}</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">out</button>
        </div>
      </div>

      {/* main */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-medium text-gray-900">
            {activeWorkspace?.name || 'Select a workspace'}
          </h1>
          {activeWorkspace && (
            <button
              onClick={() => setShowNewProject(true)}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              + New project
            </button>
          )}
        </div>

        {/* new workspace form */}
        {showNewWorkspace && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 max-w-sm">
            <p className="text-sm font-medium mb-3">New workspace</p>
            <input
              autoFocus
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()}
              placeholder="Workspace name..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-gray-400"
            />
            <div className="flex gap-2">
              <button onClick={handleCreateWorkspace} className="flex-1 text-sm bg-gray-900 text-white rounded-lg py-2">Create</button>
              <button onClick={() => setShowNewWorkspace(false)} className="flex-1 text-sm border border-gray-200 rounded-lg py-2 text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        {/* new project form */}
        {showNewProject && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 max-w-sm">
            <p className="text-sm font-medium mb-3">New project</p>
            <input
              autoFocus
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
              placeholder="Project name..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 outline-none focus:border-gray-400"
            />
            <div className="flex gap-2">
              <button onClick={handleCreateProject} className="flex-1 text-sm bg-gray-900 text-white rounded-lg py-2">Create</button>
              <button onClick={() => setShowNewProject(false)} className="flex-1 text-sm border border-gray-200 rounded-lg py-2 text-gray-500">Cancel</button>
            </div>
          </div>
        )}

        {/* projects grid */}
        <div className="grid grid-cols-3 gap-4">
          {projects.map(proj => (
            <div
              key={proj._id}
              onClick={() => navigate(`/board/${proj._id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-indigo-600 text-sm">📋</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{proj.name}</p>
              <p className="text-xs text-gray-400">{proj.description || 'No description'}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  proj.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>{proj.status}</span>
              </div>
            </div>
          ))}
          {projects.length === 0 && activeWorkspace && (
            <div className="col-span-3 text-center py-12 text-gray-400 text-sm">
              No projects yet. Create your first one.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard