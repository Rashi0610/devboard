import 'dotenv/config'
import mongoose from 'mongoose'
import UserModel from './src/models/User.model.js'
import WorkspaceModel from './src/models/Workspace.model.js'
import ProjectModel from './src/models/Project.model.js'
import ColumnModel from './src/models/Column.model.js'
import TaskModel from './src/models/Task.model.js'

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to DB')

  // ⚠️ Find YOUR real user — replace with your actual github_id from the DB
  const me = await UserModel.findOne({ github_id: '202633871' })
  if (!me) {
    console.log('Could not find your user — check the github_id above matches your DB')
    process.exit(1)
  }

  // create 2 fake teammates so the assignee dropdown looks populated
  const teammates = await UserModel.create([
    {
      name: 'Priya Sharma',
      github_id: 'priya-dev-998',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      github_access_token: 'fake-seed-token-1'
    },
    {
      name: 'Arjun Mehta',
      github_id: 'arjun-codes-441',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
      github_access_token: 'fake-seed-token-2'
    }
  ])

  // create the workspace, with you + teammates as members
  const workspace = await WorkspaceModel.create({
    name: 'Acme Engineering',
    slug: 'acme-engineering',
    owner: me._id,
    members: [
      { user: me._id, role: 'admin' },
      { user: teammates[0]._id, role: 'member' },
      { user: teammates[1]._id, role: 'member' }
    ]
  })

  const project = await ProjectModel.create({
    name: 'Shipyard Platform',
    description: 'Core product — kanban, real-time sync, AI triage',
    workspace: workspace._id,
    createdBy: me._id,
    status: 'active'
  })

  const columnDefs = [
    { name: 'Backlog', color: '#94a3b8', position: 0 },
    { name: 'To Do', color: '#6366f1', position: 1 },
    { name: 'In Progress', color: '#f59e0b', position: 2 },
    { name: 'In Review', color: '#8b5cf6', position: 3 },
    { name: 'Done', color: '#22c55e', position: 4 }
  ]

  const columns = await ColumnModel.create(
    columnDefs.map(c => ({ ...c, project: project._id }))
  )

  const peopleIds = [me._id, teammates[0]._id, teammates[1]._id]
  const priorities = ['low', 'medium', 'high', 'urgent']
  const labelSets = [
    ['frontend'], ['backend'], ['bug'], ['frontend', 'auth'],
    ['api', 'backend'], ['ui', 'polish'], ['urgent', 'bug'], ['docs']
  ]

  const taskTitles = [
    'Set up CI/CD pipeline with GitHub Actions',
    'Fix race condition in Socket.io task sync',
    'Design empty states for board and dashboard',
    'Add rate limiting to AI triage endpoint',
    'Write integration tests for auth flow',
    'Optimize MongoDB queries for analytics route',
    'Implement comment threads on tasks',
    'Add dark mode toggle',
    'Refactor TaskModal into smaller components',
    'Set up error monitoring with Sentry',
    'Improve mobile responsiveness on board view',
    'Add keyboard shortcuts for power users',
    'Cache workspace member lookups in Redis',
    'Write README with architecture diagram',
    'Add pagination to task lists for large boards',
    'Fix avatar fallback when name is null',
    'Add GitHub webhook for auto PR-to-task linking',
    'Polish AI suggestion UI loading state'
  ]

  let taskIndex = 0
  for (const col of columns) {
    const tasksInColumn = col.name === 'Done' ? 5 : col.name === 'Backlog' ? 4 : 3
    for (let i = 0; i < tasksInColumn && taskIndex < taskTitles.length; i++) {
      await TaskModel.create({
        title: taskTitles[taskIndex],
        description: 'Auto-generated seed task for demo purposes.',
        column: col._id,
        project: project._id,
        assignee: peopleIds[taskIndex % peopleIds.length],
        createdBy: me._id,
        priority: priorities[taskIndex % priorities.length],
        labels: labelSets[taskIndex % labelSets.length],
        position: i,
        storyPoints: (taskIndex % 5) + 1
      })
      taskIndex++
    }
  }

  console.log('✅ Seed complete!')
  console.log(`Workspace: ${workspace.name}`)
  console.log(`Project: ${project.name}`)
  console.log(`Columns: ${columns.length}, Tasks: ${taskIndex}`)
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})