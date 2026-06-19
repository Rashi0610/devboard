import api from '../lib/axios'

export const getWorkspaces = async () => {
  const res = await api.get('/workspaces')
  return res.data.workspaces
}

export const createWorkspace = async (name) => {
  const res = await api.post('/workspaces', { name })
  return res.data.newWorkspace
}

export const getWorkspaceMembers = async (workspaceId) => {
  const res = await api.get(`/workspaces/${workspaceId}/members`)
  return res.data.members
}

export const deleteWorkspace = async (workspaceId) => {
  await api.delete(`/workspaces/${workspaceId}`)
}