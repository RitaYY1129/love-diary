import { io } from 'socket.io-client'

let socket = null

const socketBaseUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL
  const apiBase = import.meta.env.VITE_API_BASE
  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    return new URL(apiBase).origin
  }
  return window.location.origin
}

export const getCallSocket = () => {
  const token = localStorage.getItem('loveDiary_token')
  if (!socket) {
    socket = io(socketBaseUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionAttempts: Infinity
    })
  } else {
    socket.auth = { token }
  }
  if (!socket.connected) socket.connect()
  return socket
}

export const disconnectCallSocket = () => {
  socket?.disconnect()
  socket = null
}
