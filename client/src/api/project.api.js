import api from '../lib/axios'

export const getProjects = async (workspaceId) => {
  const res = await api.get(`/workspaces/${workspaceId}/projects`)
  return res.data.projects
}

export const createProject = async (workspaceId, projectData) => {
  const res = await api.post(`/workspaces/${workspaceId}/projects`, projectData)
  return res.data.newProject
}

export const deleteProject = async (workspaceId, projectId) => {
  await api.delete(`/workspaces/${workspaceId}/projects/${projectId}`)
}