import { GitBranch} from 'lucide-react'

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github'
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-md text-center">
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl">🚢</span>
          <h1 className="text-2xl font-semibold text-gray-900">Shipyard</h1>
        </div>

        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Developer productivity for teams who ship.<br />
          Manage projects, track tasks, move fast.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
        >
          <GitBranch size={18} />
          Continue with GitHub
        </button>

        <p className="text-xs text-gray-400 mt-6">
          By signing in you agree to our terms of service
        </p>
      </div>
    </div>
  )
}

export default Login