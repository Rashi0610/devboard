import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getColumns, getTasks, createColumn, createTask, updateTask } from '../api/board.api'
import useAuthStore from '../store/auth.store'
import useSocket from '../hooks/useSocket.js'
import TaskModal from '../components/board/TaskModal.jsx'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const priorityStyles = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-green-100 text-green-700',
}

const TaskCard = ({ task, onTaskClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
    >
      {/* drag handle — dnd-kit listeners only here */}
      <div {...attributes} {...listeners} className="px-3 pt-3 pb-2">
        <p className="text-xs font-medium text-gray-800 leading-snug">{task.title}</p>
      </div>

      {/* click area — no drag listeners */}
      <div
        className="px-3 pb-2 flex items-center justify-between"
        onClick={() => onTaskClick(task)}
      >
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}

const DroppableColumn = ({ col, tasks, onAddTask,onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col._id })
  const [showAdd, setShowAdd] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')

  const handleAdd = async () => {
    if (!taskTitle.trim()) return
    await onAddTask(col._id, taskTitle)
    setTaskTitle('')
    setShowAdd(false)
  }

  return (
    <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
          <span className="text-xs font-medium text-gray-700">{col.name}</span>
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {tasks?.length || 0}
          </span>
        </div>
      </div>

      {/* tasks */}
      <SortableContext
        items={(tasks || []).map(t => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 p-2 flex-1 min-h-16 transition-colors ${isOver ? 'bg-blue-50' : ''}`}
        >
          {(tasks || []).map(task => (
  <TaskCard key={task._id} task={task} onTaskClick={onTaskClick} />
))}
        </div>
      </SortableContext>

      {/* add task inline */}
      {showAdd ? (
        <div className="p-2 border-t border-gray-100">
          <input
            autoFocus
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Task title..."
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 mb-2 outline-none focus:border-gray-400"
          />
          <div className="flex gap-1">
            <button onClick={handleAdd} className="flex-1 text-xs bg-gray-900 text-white rounded-lg py-1">Add</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 text-xs border border-gray-200 rounded-lg py-1 text-gray-500">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors w-full border-t border-gray-100"
        >
          + Add task
        </button>
      )}
    </div>
  )
}

const Board = () => {
  const { projectId } = useParams()
  const { user } = useAuthStore()
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [newColName, setNewColName] = useState('')
  const [showAddCol, setShowAddCol] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedTaskColId, setSelectedTaskColId] = useState(null)
  const socket = useSocket(projectId)

  useEffect(() => { loadBoard() }, [projectId])

  useEffect(() => {
  socket.on('task:moved', ({ taskId, sourceColId, destColId, sourceTasks, destTasks }) => {
    setTasks(prev => ({
      ...prev,
      [sourceColId]: sourceTasks,
      [destColId]: destTasks
    }))
  })

  socket.on('task:created', ({ columnId, task }) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), task]
    }))
  })

  socket.on('task:updated', ({ columnId, task }) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(t => t._id === task._id ? task : t)
    }))
  })

  return () => {
    socket.off('task:moved')
    socket.off('task:created')
    socket.off('task:updated')
  }
}, [socket])

  const loadBoard = async () => {
    try {
      setLoading(true)
      const cols = await getColumns(projectId)
      setColumns(cols)
      const taskMap = {}
      await Promise.all(cols.map(async (col) => {
        taskMap[col._id] = await getTasks(col._id)
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
    } catch (err) { console.error(err) }
  }

  const handleAddTask = async (columnId, title) => {
    try {
      await createTask(columnId, { title, projectId })
      await loadBoard()
    } catch (err) { console.error(err) }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event) => {
    const { active } = event
    for (const col of columns) {
      const found = (tasks[col._id] || []).find(t => t._id === active.id)
      if (found) { setActiveTask(found); break }
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    let sourceColId = null
    let destColId = null

    for (const col of columns) {
      const colTasks = tasks[col._id] || []
      if (colTasks.find(t => t._id === active.id)) sourceColId = col._id
      if (colTasks.find(t => t._id === over.id)) destColId = col._id
      if (col._id === over.id) destColId = col._id
    }

    if (!sourceColId || !destColId) return

    if (sourceColId === destColId) {
      const colTasks = tasks[sourceColId]
      const oldIndex = colTasks.findIndex(t => t._id === active.id)
      const newIndex = colTasks.findIndex(t => t._id === over.id)
      if (oldIndex === newIndex) return
      const reordered = arrayMove(colTasks, oldIndex, newIndex)
      setTasks({ ...tasks, [sourceColId]: reordered })
      await Promise.all(reordered.map((task, index) =>
        updateTask(sourceColId, task._id, { position: index })
      ))
      socket.emit('task:moved', {
    projectId,
    taskId: active.id,
    sourceColId,
    destColId: sourceColId,
    sourceTasks: reordered,
    destTasks: reordered
  })
    } else {
      const sourceTasks = [...(tasks[sourceColId] || [])]
      const destTasks = [...(tasks[destColId] || [])]
      const taskToMove = sourceTasks.find(t => t._id === active.id)
      const newSourceTasks = sourceTasks.filter(t => t._id !== active.id)
      destTasks.push({ ...taskToMove, column: destColId })
      setTasks({ ...tasks, [sourceColId]: newSourceTasks, [destColId]: destTasks })
      await updateTask(destColId, taskToMove._id, { column: destColId, position: destTasks.length - 1 })

      socket.emit('task:moved', {
    projectId,
    taskId: active.id,
    sourceColId,
    destColId,
    sourceTasks: newSourceTasks,
    destTasks
  })
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚢</span>
            <h1 className="text-sm font-medium text-gray-900">Shipyard</h1>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">Board</span>
          </div>
          {user?.avatar_url && (
            <img src={user.avatar_url} className="w-7 h-7 rounded-full border border-gray-200" />
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 overflow-x-auto flex-1 items-start">
            {columns.map(col => (
        <DroppableColumn
            key={col._id}
            col={col}
            tasks={tasks[col._id]}
            onAddTask={handleAddTask}
            onTaskClick={(task) => {
                setSelectedTask(task)
                setSelectedTaskColId(col._id)
            }}
        />
            ))}

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
                    <button onClick={handleAddColumn} className="flex-1 text-xs bg-gray-900 text-white rounded-lg py-1.5">Add</button>
                    <button onClick={() => setShowAddCol(false)} className="flex-1 text-xs border border-gray-200 rounded-lg py-1.5 text-gray-500">Cancel</button>
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

          <DragOverlay>
            {activeTask && (
              <div className="bg-white border border-blue-300 rounded-lg p-3 shadow-lg w-64">
                <p className="text-xs font-medium text-gray-800">{activeTask.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
      {selectedTask && (
  <TaskModal
    task={selectedTask}
    columnId={selectedTaskColId}
    onClose={() => { setSelectedTask(null); setSelectedTaskColId(null) }}
    onUpdate={(updated) => {
      setTasks(prev => ({
        ...prev,
        [selectedTaskColId]: prev[selectedTaskColId].map(t =>
          t._id === updated._id ? updated : t
        )
      }))
    }}
  />
)}
    </div>
  )
}

export default Board