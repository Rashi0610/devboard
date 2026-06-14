import { io } from 'socket.io-client'

const getToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('socketToken='))
    ?.split('=')[1]
}

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
  autoConnect: false,
  auth: {
    token: getToken()
  }
})

export default socket