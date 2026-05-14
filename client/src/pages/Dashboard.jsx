import useAuthStore from '../store/auth.store'
import api from '../lib/axios'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await api.get('/auth/logout')
    window.location.href = '/login'
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-md text-center">
        <span className="text-4xl mb-4 block">🚢</span>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome to Shipyard
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Logged in as <span className="font-medium text-gray-700">{user?.name || user?.github_id}</span>
        </p>
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt="avatar"
            className="w-16 h-16 rounded-full mx-auto mb-6 border border-gray-200"
          />
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Dashboard