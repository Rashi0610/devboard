import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnalytics } from '../api/analytics.api'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const PRIORITY_COLORS = {
  urgent: '#E8A5A5',
  high: '#E8C088',
  medium: '#8FB8E8',
  low: '#94C9A0'
}

const PIE_COLORS = ['#D97757', '#8FB8E8', '#94C9A0', '#E8C088', '#A78BC9']

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

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
    <div className="h-screen flex items-center justify-center bg-[#14181D]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D97757]" />
    </div>
  )

  const contributorCount = data?.contributorCount || 0

  return (
    <div className="min-h-screen bg-[#14181D] text-[#E4E6EA]">

      <div className="flex items-center justify-between px-6 py-3 bg-[#1B2026] border-b border-[#2A2F36]">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚢</span>
          <h1 className="text-sm font-medium tracking-tight text-[#E4E6EA]">Shipyard</h1>
        </div>
        <div className="flex items-center gap-1 bg-[#14181D] rounded-lg p-1">
          <button
            onClick={() => navigate(`/board/${projectId}`)}
            className="text-xs px-3 py-1.5 rounded-full text-[#8B92A0] hover:text-[#E4E6EA] transition-colors"
          >
            Board
          </button>
          <button className="text-xs px-3 py-1.5 rounded-full bg-[#D97757] text-[#1B100B] font-medium">
            Analytics
          </button>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto">

        <div className="mb-8">
          <h2 className="text-2xl font-medium tracking-tight text-[#E4E6EA] mb-1">
            {data?.projectName || 'Project analytics'}
          </h2>
          <p className="text-sm text-[#8B92A0]">
            {data?.summary || `${data?.totalTasks || 0} tasks · ${data?.columnCount || 0} columns · ${contributorCount} contributors`}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-[#5C6270]">Team</h3>
            <span className="text-xs text-[#8B92A0]">{contributorCount} contributor{contributorCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(data?.byAssignee || []).map(member => {
              const pct = member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0
              return (
                <div key={member._id} className="bg-[#1B2026] border border-[#2A2F36] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={member.avatar_url}
                      alt={member.name || member.github_id}
                      className="w-10 h-10 rounded-full border border-[#2A2F36]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#E4E6EA] truncate">{member.name || member.github_id}</p>
                      <p className="text-xs text-[#8B92A0]">{member.total} assigned</p>
                    </div>
                  </div>
                  <div className="text-xs text-[#8B92A0] mb-3">{member.completed} done</div>
                  <div className="h-2 bg-[#14181D] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D97757] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1B2026] border border-[#2A2F36] rounded-lg p-5">
            <h3 className="text-sm font-medium text-[#E4E6EA] mb-5">Priority breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.byPriority || []}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8B92A0' }} axisLine={{ stroke: '#2A2F36' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8B92A0' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1B2026', border: '1px solid #2A2F36', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#E4E6EA' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(data?.byPriority || []).map((entry, index) => (
                    <Cell key={index} fill={PRIORITY_COLORS[entry.name] || '#D97757'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1B2026] border border-[#2A2F36] rounded-lg p-5">
            <h3 className="text-sm font-medium text-[#E4E6EA] mb-5">Tasks by column</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.byColumn || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, count }) => `${name}: ${count}`}
                  labelLine={{ stroke: '#5C6270' }}
                >
                  {(data?.byColumn || []).map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1B2026', border: '1px solid #2A2F36', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-[#5C6270] mb-3">Recent activity</h3>
          <div className="bg-[#1B2026] border border-[#2A2F36] rounded-lg divide-y divide-[#2A2F36]">
            {(data?.recentTasks || []).map(task => (
              <div key={task._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-[#E4E6EA]">{task.title}</p>
                  <p className="text-xs text-[#5C6270]">{task.column?.name || 'No column'}</p>
                </div>
                <span className="text-xs text-[#5C6270]">{timeAgo(task.updatedAt)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Analytics