import { GitBranch} from 'lucide-react'

const Login = () => {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-app text-primary">
      <div className="bg-surface rounded-2xl shadow-sm surface-border p-10 w-full max-w-md text-center">
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl accent">🚢</span>
          <h1 className="text-2xl font-semibold text-primary">Shipyard</h1>
        </div>

        <p className="text-muted mb-8 text-sm leading-relaxed">
          Developer productivity for teams who ship.<br />
          Manage projects, track tasks, move fast.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 btn-accent rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
        >
          <GitBranch size={18} />
          Continue with GitHub
        </button>

        <p className="text-xs text-muted mt-6">
          By signing in you agree to our terms of service
        </p>
      </div>
    </div>
  )
}

export default Login