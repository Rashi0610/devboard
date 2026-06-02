import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getColumns, getTasks, createColumn, createTask } from '../api/board.api'
import useAuthStore from '../store/auth.store'

const Board = () => {
  const { projectId } = useParams()
  const { user } = useAuthStore()
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [newColName, setNewColName] = useState('')
  const [showAddCol, setShowAddCol] = useState(false)

  useEffect(() => {
    loadBoard()
  }, [projectId])

  const loadBoard = async () => {
    try {
      setLoading(true)
      const cols = await getColumns(projectId)
      setColumns(cols)

      // fetch tasks for every column in parallel
      const taskMap = {}
      await Promise.all(cols.map(async (col) => {
        const colTasks = await getTasks(col._id)
        taskMap[col._id] = colTasks
      }))
      setTasks(taskMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddColumn = async () => {
    if (!newColName.trim()) return
    try {
      const col = await createColumn(projectId, newColName, '#6366f1')
      setColumns([...columns, col])
      setTasks({ ...tasks, [col._id]: [] })
      setNewColName('')
      setShowAddCol(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddTask = async (columnId) => {
    const title = prompt('Task title:')
    if (!title) return
    try {
      await createTask(columnId, { title, projectId })
      await loadBoard()
    } catch (err) {
      console.error(err)
    }
  }

  const priorityStyles = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-green-100 text-green-700',
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* topbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚢</span>
            <h1 className="text-sm font-medium text-gray-900">Shipyard</h1>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">Board</span>
          </div>
          <div className="flex items-center gap-2">
            {user?.avatar_url && (
              <img src={user.avatar_url} className="w-7 h-7 rounded-full border border-gray-200" />
            )}
          </div>
        </div>

        {/* board */}
        <div className="flex gap-4 p-6 overflow-x-auto flex-1 items-start">
          {columns.map(col => (
            <div key={col._id} className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col">
              
              {/* column header */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-xs font-medium text-gray-700">{col.name}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {tasks[col._id]?.length || 0}
                  </span>
                </div>
              </div>

              {/* tasks */}
              <div className="flex flex-col gap-2 p-2 flex-1">
                {(tasks[col._id] || []).map(task => (
                  <div key={task._id} className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-300 transition-colors">
                    <p className="text-xs font-medium text-gray-800 mb-2 leading-snug">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* add task button */}
                <button
                  onClick={() => handleAddTask(col._id)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full"
                >
                  + Add task
                </button>
              </div>
            </div>
          ))}

          {/* add column */}
          <div className="w-64 flex-shrink-0">
            {showAddCol ? (
              <div className="bg-white rounded-xl border border-gray-200 p-3">
                <input
                  autoFocus
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                  placeholder="Column name..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 outline-none focus:border-gray-400"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddColumn} className="flex-1 text-xs bg-gray-900 text-white rounded-lg py-1.5">
                    Add
                  </button>
                  <button onClick={() => setShowAddCol(false)} className="flex-1 text-xs border border-gray-200 rounded-lg py-1.5 text-gray-500">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCol(true)}
                className="w-full text-sm text-gray-400 hover:text-gray-600 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl py-3 transition-colors"
              >
                + Add column
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Board