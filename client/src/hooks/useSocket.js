import { useEffect } from 'react'
import socket from '../socket/socket.js'

const useSocket = (projectId) => {
  useEffect(() => {
    socket.connect()
    socket.emit('join:project', projectId)

    return () => {
      socket.emit('leave:project', projectId)
      socket.disconnect()
    }
  }, [projectId])

  return socket
}

export default useSocket