import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/auth.store'

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute