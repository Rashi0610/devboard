import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/auth.store'
import { getWorkspaces, createWorkspace, deleteWorkspace, getWorkspaceMembers } from '../api/workspace.api'
import { getProjects, createProject,deleteProject } from '../api/project.api'
import api from '../lib/axios'


const Dashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState([])
  const [projects, setProjects] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [workspaceMembers, setWorkspaceMembers] = useState([])
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectStatus, setNewProjectStatus] = useState('active')
  const [newProjectStartDate, setNewProjectStartDate] = useState('')
  const [newProjectEndDate, setNewProjectEndDate] = useState('')

  useEffect(() => {
    loadWorkspaces()
  }, [])

  useEffect(() => {
    if (activeWorkspace) {
      loadProjects(activeWorkspace._id)
      loadMembers(activeWorkspace._id)
    }
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

  const loadMembers = async (workspaceId) => {
    try {
      const data = await getWorkspaceMembers(workspaceId)
      setWorkspaceMembers(data)
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
      const proj = await createProject(activeWorkspace._id, {
        name: newProjectName,
        description: newProjectDescription,
        status: newProjectStatus,
        startDate: newProjectStartDate || null,
        endDate: newProjectEndDate || null
      })
      setProjects([...projects, proj])
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectStatus('active')
      setNewProjectStartDate('')
      setNewProjectEndDate('')
      setShowNewProject(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProject = async (e, projectId) => {
  e.stopPropagation() // prevent the card's onClick from firing and navigating
  if (!confirm('Delete this project? This cannot be undone.')) return
  try {
    await deleteProject(activeWorkspace._id, projectId)
    setProjects(projects.filter(p => p._id !== projectId))
  } catch (err) {
    console.error(err)
  }
}       

  const handleDeleteWorkspace = async (e, wsId) => {
  e.stopPropagation()
  if (!confirm('Delete this workspace and everything in it?')) return
  try {
    await deleteWorkspace(wsId)
    const updated = workspaces.filter(w => w._id !== wsId)
    setWorkspaces(updated)
    if (activeWorkspace?._id === wsId) setActiveWorkspace(updated[0] || null)
    // clear members if the active workspace was removed
    if (activeWorkspace?._id === wsId) setWorkspaceMembers([])
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
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <span className="text-2xl">🚢</span>
          <span className="text-base font-bold text-gray-900">Shipyard</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Workspaces</p>
          {workspaces.map(ws => (
            <div
              key={ws._id}
              onClick={() => setActiveWorkspace(ws)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-all cursor-pointer group ${
                activeWorkspace?._id === ws._id
                  ? 'bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="truncate flex-1">{ws.name}</span>
              <button
                onClick={(e) => handleDeleteWorkspace(e, ws._id)}
                className="text-xs text-gray-400 hover:text-red-600 ml-2 opacity-0 group-hover:opacity-100 transition-all"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowNewWorkspace(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors mt-2"
          >
            + New workspace
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          {user?.avatar_url && <img src={user.avatar_url} className="w-7 h-7 rounded-full ring-1 ring-gray-200" />}
          <span className="text-xs text-gray-600 flex-1 truncate font-medium">{user?.name || user?.github_id}</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">out</button>
        </div>
      </div>

      {/* main */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 bg-white px-8 py-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeWorkspace?.name || 'Select a workspace'}
            </h1>
            {activeWorkspace && (
              <button
                onClick={() => setShowNewProject(true)}
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
              >
                + New project
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {/* new workspace form */}
          {showNewWorkspace && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-sm shadow-md">
              <p className="text-sm font-semibold text-gray-900 mb-4">Create new workspace</p>
              <input
                autoFocus
                value={newWorkspaceName}
                onChange={e => setNewWorkspaceName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()}
                placeholder="Workspace name..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-4 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
              />
              <div className="flex gap-2">
                <button onClick={handleCreateWorkspace} className="flex-1 text-sm bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 transition-colors">Create</button>
                <button onClick={() => setShowNewWorkspace(false)} className="flex-1 text-sm border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              </div>
            </div>
          )}

          {/* new project form */}
          {showNewProject && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-lg shadow-md">
              <p className="text-sm font-semibold text-gray-900 mb-4">Create new project</p>
              <input
                autoFocus
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
              />
              <textarea
                value={newProjectDescription}
                onChange={e => setNewProjectDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white resize-none"
                rows="3"
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={newProjectStatus}
                    onChange={e => setNewProjectStatus(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={e => setNewProjectStartDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={newProjectEndDate}
                  onChange={e => setNewProjectEndDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateProject} className="flex-1 text-sm bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 transition-colors">Create</button>
                <button onClick={() => {
                  setShowNewProject(false)
                  setNewProjectName('')
                  setNewProjectDescription('')
                  setNewProjectStatus('active')
                  setNewProjectStartDate('')
                  setNewProjectEndDate('')
                }} className="flex-1 text-sm border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              </div>
            </div>
          )}

          {/* projects grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(proj => (
              <div
                key={proj._id}
                onClick={() => navigate(`/board/${proj._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                  <span className="text-indigo-600 text-sm">📋</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{proj.name}</p>
               
                <p className="text-xs text-gray-500 mb-4">{proj.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    proj.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{proj.status}
                  </span>
                  <button
                    onClick={(e) => handleDeleteProject(e, proj._id)}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>  
            ))}
            {projects.length === 0 && activeWorkspace && (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">
                <div className="text-4xl mb-2">📭</div>
                No projects yet. Create your first one.
              </div>
            )}
            
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard