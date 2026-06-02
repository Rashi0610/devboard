import api from '../lib/axios'

export const getColumns = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/columns`)
  return res.data.column
}

export const createColumn = async (projectId, name, color) => {
  const res = await api.post(`/projects/${projectId}/columns`, { name, color })
  return res.data.column
}

export const getTasks = async (columnId) => {
  const res = await api.get(`/columns/${columnId}/tasks`)
  return res.data.tasks
}

export const createTask = async (columnId, data) => {
  const res = await api.post(`/columns/${columnId}/tasks`, data)
  return res.data.task
}

export const updateTask = async (columnId, taskId, data) => {
  const res = await api.patch(`/columns/${columnId}/tasks/${taskId}`, data)
  return res.data.task
}