// Landing Page with Auto-redirect for authenticated users
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

const Index = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!user) {
    navigate('/login')
    return null
  }

  return null
};

export default Index;
