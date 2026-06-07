import { io } from 'socket.io-client'

const getToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('socketToken='))
    ?.split('=')[1]
}

const socket = io('http://localhost:5000', {
  autoConnect: false,
  auth: {
    token: getToken()
  }
})

export default socket