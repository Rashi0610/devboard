import api from '../lib/axios'

export const getProjects = async (workspaceId) => {
  const res = await api.get(`/workspaces/${workspaceId}/projects`)
  return res.data.projects
}

export const createProject = async (workspaceId, name, description) => {
  const res = await api.post(`/workspaces/${workspaceId}/projects`, { name, description })
  return res.data.newProject
}