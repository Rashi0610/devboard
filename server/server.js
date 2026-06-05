import 'dotenv/config'
import { createServer } from 'http'
import app from './src/app.js'
import { connectDB } from './src/config/db.js'
import { initSocket } from './src/socket/index.js'

const PORT = process.env.PORT || 5000
const httpServer = createServer(app)

initSocket(httpServer)

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚢 Shipyard server running → http://localhost:${PORT}`)
  })
})