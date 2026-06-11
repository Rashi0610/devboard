import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnalytics } from '../api/analytics.api'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#22c55e'
}

const PIE_COLORS = ['#6366f1', '#1D9E75', '#f97316', '#e11d48']

const Analytics = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics(projectId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* topbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚢</span>
          <h1 className="text-sm font-medium text-gray-900">Shipyard</h1>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">Analytics</span>
        </div>
        <button
          onClick={() => navigate(`/board/${projectId}`)}
          className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg"
        >
          ← Back to board
        </button>
      </div>

      <div className="p-8 max-w-5xl mx-auto">

        {/* stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total tasks', value: data?.totalTasks || 0 },
            { label: 'Urgent', value: data?.byPriority?.find(p => p.name === 'urgent')?.value || 0 },
            { label: 'High priority', value: data?.byPriority?.find(p => p.name === 'high')?.value || 0 },
            { label: 'Columns', value: data?.byColumn?.length || 0 },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-medium text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* priority breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-6">Priority breakdown</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.byPriority || []}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(data?.byPriority || []).map((entry, index) => (
                    <Cell key={index} fill={COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* tasks by column */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-6">Tasks by column</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data?.byColumn || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {(data?.byColumn || []).map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Analytics