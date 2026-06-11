import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { triageTask } from '../services/ai.service.js'

const router = Router()

router.post('/triage', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    const result = await triageTask(title, description)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'AI triage failed' })
  }
})

export default router