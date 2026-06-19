import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import TaskModel from '../models/Task.model.js'
import ProjectModel from '../models/Project.model.js'
import UserModel from '../models/User.model.js'

const router = Router()

router.get('/:projectId/analytics', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params

    const project = await ProjectModel.findById(projectId).select('name description')

    const tasks = await TaskModel.find({ project: projectId })
      .populate('column', 'name')
      .populate('assignee', 'name avatar_url github_id')

    const totalTasks = tasks.length

    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 }
    tasks.forEach(t => { if (byPriority[t.priority] !== undefined) byPriority[t.priority]++ })
    const priorityData = Object.entries(byPriority).map(([name, value]) => ({ name, value }))

    const columnMap = {}
    tasks.forEach(t => {
      if (t.column) {
        const name = t.column.name
        columnMap[name] = (columnMap[name] || 0) + 1
      }
    })
    const byColumn = Object.entries(columnMap).map(([name, count]) => ({ name, count }))

    const assigneeMap = {}
    tasks.forEach(t => {
      if (!t.assignee) return
      const id = t.assignee._id.toString()
      if (!assigneeMap[id]) {
        assigneeMap[id] = {
          _id: id,
          name: t.assignee.name,
          avatar_url: t.assignee.avatar_url,
          github_id: t.assignee.github_id,
          total: 0,
          completed: 0
        }
      }
      assigneeMap[id].total++
      if (t.column?.name === 'Done') assigneeMap[id].completed++
    })
    const byAssignee = Object.values(assigneeMap)

    const recentTasks = await TaskModel.find({ project: projectId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt column')
      .populate('column', 'name')

    const columnCount = byColumn.length
    const contributorCount = byAssignee.length
    const summary = `${totalTasks} tasks · ${columnCount} columns · ${contributorCount} contributors`

    res.json({
      projectName: project?.name || 'Project analytics',
      projectDescription: project?.description || '',
      totalTasks,
      columnCount,
      contributorCount,
      summary,
      byPriority: priorityData,
      byColumn,
      byAssignee,
      recentTasks
    })
  } catch (err) {
    console.error('ANALYTICS ROUTE ERROR:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router