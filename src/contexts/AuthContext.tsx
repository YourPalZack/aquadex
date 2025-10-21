'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserProfile } from '@/lib/database'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Refresh user profile from database
  const refreshUserProfile = async () => {
    if (!user) {
      setUserProfile(null)
      return
    }

    try {
      const profile = await getUserProfile(user.id)
      setUserProfile(profile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await refreshUserProfile()
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          if (session?.user) {
            await refreshUserProfile()
          }
          break
        case 'SIGNED_OUT':
          setUserProfile(null)
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      // Redirect to sign in page or show login prompt
      window.location.href = '/auth/signin'
      return null
    }

    return <Component {...props} />
  }
}

// Hook for checking if user is authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/signin'
    }
  }, [user, loading])

  return { user, loading }
}