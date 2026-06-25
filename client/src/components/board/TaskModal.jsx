import { useState } from 'react'
import { updateTask, deleteTask, triageTask } from '../../api/board.api'

const priorityOptions = ['low', 'medium', 'high', 'urgent']

const priorityStyles = {
  urgent: 'priority-urgent',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

const TaskModal = ({ task, columnId, onClose, members, onUpdate }) => {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority || 'medium')
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  )
  const [labels, setLabels] = useState((task.labels || []).join(', '))
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [storyPoints, setStoryPoints] = useState(task.storyPoints || 0)
  const [assignee, setAssignee] = useState(task.assignee || '')

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updateTask(columnId, task._id, {
        title,
        description,
        priority,
        dueDate: dueDate || null,
        labels: labels.split(',').map(l => l.trim()).filter(Boolean),
        assignee: assignee || null,
        storyPoints: Number(storyPoints)
      })
      onUpdate(updated)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(columnId, task._id)
      onUpdate(null)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAISuggest = async () => {
    if (!title.trim()) return
    try {
      setAiLoading(true)
      const result = await triageTask(title, description)
      setPriority(result.priority)
      setLabels(result.labels.join(', '))
      if (result.storyPoints) setStoryPoints(result.storyPoints)
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden modal-scale show">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-surface)' }}>
          <h2 className="text-sm font-medium text-primary">Task detail</h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-lg leading-none">✕</button>
        </div>

        {/* body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* title */}
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm border surface-border rounded-lg px-3 py-2 outline-none focus:ring focus-ring bg-surface text-primary"
            />
          </div>

          {/* description */}
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description..."
              className="w-full text-sm border surface-border rounded-lg px-3 py-2 outline-none focus:ring resize-none bg-surface text-primary"
            />
          </div>

          {/* AI suggest */}
          <button
            onClick={handleAISuggest}
            disabled={aiLoading || !title.trim()}
            className="flex items-center gap-2 text-xs px-3 py-2 bg-[#111214] text-muted border surface-border rounded-lg hover:bg-[#151718] disabled:opacity-50 transition-colors"
          >
            {aiLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b" style={{ borderColor: 'var(--accent)' }} />
                Analyzing...
              </>
            ) : (
              <>✨ AI Suggest</>
            )}
          </button>

          {/* priority + due date */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full text-sm border surface-border rounded-lg px-3 py-2 outline-none focus:ring"
              >
                {priorityOptions.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-tertiary mb-1 block">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-sm border surface-border rounded-lg px-3 py-2 outline-none focus:ring bg-surface"
              />
            </div>
          </div>

          {/* assignee */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted mb-1 block">Assignee</label>
            <select
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              className="w-full text-sm border surface-border rounded-lg px-3 py-2 outline-none focus:ring bg-surface text-primary"
            >
              <option value="">Unassigned</option>
              {(members || []).filter(m => m).map(m => (
                <option key={m._id} value={m._id}>{m.name || m.github_id}</option>
              ))}
            </select>
          </div>

          {/* github PR link */}
          {task.githubPrUrl && (
            <a
              href={task.githubPrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#8B92A0] hover:text-[#E4E6EA] flex items-center gap-1"
            >
              🔗 View PR on GitHub
            </a>
          )}

          {/* labels */}
          <div>
            <label className="text-xs font-medium text-tertiary mb-1 block">
              Labels <span className="font-normal text-tertiary">(comma separated)</span>
            </label>
            <input
              value={labels}
              onChange={e => setLabels(e.target.value)}
              placeholder="frontend, bug, auth..."
              className="w-full text-sm border surface-border rounded-lg px-3 py-2 outline-none focus:ring bg-surface"
            />
          </div>

          {/* priority preview */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-tertiary">Preview:</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[priority]}`}>
              {priority}
            </span>
            {labels && labels.split(',').map(l => l.trim()).filter(Boolean).map((label, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full border surface-border text-tertiary">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-surface flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-400"
          >
            Delete task
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 border surface-border rounded-lg text-tertiary hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm px-4 py-2 btn-accent rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TaskModal