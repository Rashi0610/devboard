import { Router } from 'express'
import { verifyWebhookSignature, handlePullRequest } from '../services/github.service.js'
import GithubIntegrationModel from '../models/GithubIntegration.model.js'
import ColumnModel from '../models/Column.model.js'
import {requireAuth} from '../middleware/auth.middleware.js'
const router = Router()

router.post('/connect', requireAuth, async (req, res) => {
  try {
    const { projectId, repoOwner, repoName } = req.body

    // auto-find backlog and done columns
    const columns = await ColumnModel.find({ project: projectId }).sort({ position: 1 })
    const defaultColumn = columns[0] // first column = backlog
    const doneColumn = columns[columns.length - 1] // last column = done

    if (!defaultColumn || !doneColumn) {
      return res.status(400).json({ message: 'Project needs at least 2 columns' })
    }

    // upsert — update if exists, create if not
    const integration = await GithubIntegrationModel.findOneAndUpdate(
      { repoOwner, repoName },
      { repoOwner, repoName, project: projectId, defaultColumnId: defaultColumn._id, doneColumnId: doneColumn._id },
      { upsert: true, new: true }
    )

    res.json({ integration })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/webhook', async (req, res) => {
  try {
    const isValid = verifyWebhookSignature(req)
    if (!isValid) return res.status(401).json({ message: 'Invalid signature' })

    // req.body is a raw Buffer — parse it into JSON here
    const payload = JSON.parse(req.body.toString())
    const event = req.headers['x-github-event']

    if (event === 'pull_request') {
      await handlePullRequest(payload)
    }

    res.status(200).json({ message: 'ok' })
  } catch (err) {
    console.error('WEBHOOK ERROR:', err)
    res.status(500).json({ message: 'Webhook error' })
  }
})



export default router