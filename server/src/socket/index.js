import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST']
    }
  })

  // auth middleware — verify JWT on every socket connection
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

    // join a project room
    socket.on('join:project', (projectId) => {
      socket.join(projectId)
      console.log(`User ${socket.userId} joined project ${projectId}`)
    })

    // leave a project room
    socket.on('leave:project', (projectId) => {
      socket.leave(projectId)
    })

    // task moved between columns
    socket.on('task:moved', (data) => {
      socket.to(data.projectId).emit('task:moved', data)
    })

    // task created
    socket.on('task:created', (data) => {
      socket.to(data.projectId).emit('task:created', data)
    })

    // task updated
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