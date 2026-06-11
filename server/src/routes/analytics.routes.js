import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import TaskModel from '../models/Task.model.js'
import ColumnModel from '../models/Column.model.js'

const router = Router()

router.get('/:projectId/analytics', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params

    const tasks = await TaskModel.find({ project: projectId }).populate('column', 'name')

    const totalTasks = tasks.length

    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 }
    tasks.forEach(t => { if (byPriority[t.priority] !== undefined) byPriority[t.priority]++ })

    const columnMap = {}
    tasks.forEach(t => {
      if (t.column) {
        const name = t.column.name
        columnMap[name] = (columnMap[name] || 0) + 1
      }
    })
    const byColumn = Object.entries(columnMap).map(([name, count]) => ({ name, count }))

    const priorityData = Object.entries(byPriority).map(([name, value]) => ({ name, value }))

    res.json({ totalTasks, byPriority: priorityData, byColumn })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router