import api from '../lib/axios'

export const getWorkspaces = async () => {
  const res = await api.get('/workspaces')
  return res.data.workspaces
}

export const createWorkspace = async (name) => {
  const res = await api.post('/workspaces', { name })
  return res.data.newWorkspace
}