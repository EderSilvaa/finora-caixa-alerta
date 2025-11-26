// Authentication Hook
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import type { SignupInput, LoginInput } from '@/lib/validations'
import { useToast } from './use-toast'

// Import authService directly from the service file
import { authService } from '@/services/auth.service'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Check active sessions and sets the user
    authService.getSession().then(session => {
      if (session?.user) {
        authService.getCurrentUser().then(setUser)
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signup = async (data: SignupInput) => {
    try {
      setLoading(true)
      await authService.signup(data)

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para confirmar a conta.',
      })

      navigate('/login')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: LoginInput) => {
    try {
      setLoading(true)
      await authService.login(data)

      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta.',
      })

      navigate('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)

      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      })

      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer logout',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
