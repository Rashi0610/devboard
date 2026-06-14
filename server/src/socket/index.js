import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import jwt from 'jsonwebtoken'

let io

export const initSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST']
    }
  })

  // Redis adapter setup
  const pubClient = createClient({ url: process.env.REDIS_URL })
  const subClient = pubClient.duplicate()

  await Promise.all([pubClient.connect(), subClient.connect()])
  io.adapter(createAdapter(pubClient, subClient))
  console.log('✅ Socket.io Redis adapter connected')

  // auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token ||
        socket.handshake.headers.cookie?.split('accessToken=')[1]?.split(';')[0]

      if (!token) return next(new Error('No token'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`)

    socket.on('join:project', (projectId) => {
      socket.join(projectId)
      console.log(`User ${socket.userId} joined project ${projectId}`)
    })

    socket.on('leave:project', (projectId) => {
      socket.leave(projectId)
    })

    socket.on('task:moved', (data) => {
      socket.to(data.projectId).emit('task:moved', data)
    })

    socket.on('task:created', (data) => {
      socket.to(data.projectId).emit('task:created', data)
    })

    socket.on('task:updated', (data) => {
      socket.to(data.projectId).emit('task:updated', data)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userId}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}