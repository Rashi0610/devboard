import { useState } from 'react'
import { updateTask ,deleteTask} from '../../api/board.api'
import { triageTask } from '../../api/board.api'

const priorityOptions = ['low', 'medium', 'high', 'urgent']

const priorityStyles = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-green-100 text-green-700',
}

const TaskModal = ({ task, columnId, onClose,members, onUpdate }) => {
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
    onUpdate(null) // signal deletion to parent
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Task detail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* title */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
            />
          </div>

          {/* description */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 resize-none"
            />
          </div>
          <button
  onClick={handleAISuggest}
  disabled={aiLoading || !title.trim()}
  className="flex items-center gap-2 text-xs px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 transition-colors"
>
  {aiLoading ? (
    <>
      <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-700" />
      Analyzing...
    </>
  ) : (
    <>✨ AI Suggest</>
  )}
</button>

          {/* priority + due date row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
              >
                {priorityOptions.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
              />
            </div>
          </div>
                {/*assignee */}
          <div className="flex-1">
  <label className="text-xs font-medium text-gray-500 mb-1 block">Assignee</label>
  <select
    value={assignee}
    onChange={e => setAssignee(e.target.value)}
    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
  >
    <option value="">Unassigned</option>
    {members.map(m => (
      <option key={m._id} value={m._id}>{m.name || m.github_id}</option>
    ))}
  </select>
</div>

          {/* labels */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Labels <span className="font-normal text-gray-400">(comma separated)</span></label>
            <input
              value={labels}
              onChange={e => setLabels(e.target.value)}
              placeholder="frontend, bug, auth..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
            />
          </div>

          {/* priority preview */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Preview:</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[priority]}`}>
              {priority}
            </span>
            {labels && labels.split(',').map(l => l.trim()).filter(Boolean).map((label, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

          <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 mr-auto">
  Delete task
</button>
        </div>
      </div>
    </div>
  )
}

export default TaskModal