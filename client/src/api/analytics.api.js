import api from '../lib/axios'

export const getAnalytics = async (projectId) => {
  const res = await api.get(`/analytics/${projectId}/analytics`)
  return res.data
}