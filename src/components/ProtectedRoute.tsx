// Protected Route Component
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    authService.getSession().then(session => {
      setIsAuthenticated(!!session)
    }).catch(error => {
      console.error('Session check failed:', error)
      setIsAuthenticated(false)
    })
  }, [])

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />
  }

  return <>{children}</>
}
