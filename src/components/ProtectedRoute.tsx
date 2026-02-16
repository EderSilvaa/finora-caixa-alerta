// Protected Route Component
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only mark as unauthenticated if there's no hash fragment with tokens
      // (meaning we're not in the middle of an OAuth callback)
      if (!session && window.location.hash.includes('access_token')) {
        // OAuth callback in progress, wait for onAuthStateChange
        return
      }
      setIsAuthenticated(!!session)
    }).catch(error => {
      console.error('Session check failed:', error)
      setIsAuthenticated(false)
    })

    // Listen for auth state changes (handles OAuth callback tokens)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true)
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
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
