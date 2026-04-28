'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'

type AppRole = 'admin' | 'manager' | 'driver'

type AppUser = {
  id: string
  email: string
  role: AppRole
}

const DEMO_ROLE_BY_EMAIL: Record<string, AppRole> = {
  'admin@example.com': 'admin',
  'manager@example.com': 'manager',
  'driver@example.com': 'driver',
}

type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function isMissingSessionError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AuthSessionMissingError' ||
      error.message.includes('Auth session missing'))
  )
}

async function loadCurrentUser(): Promise<AppUser | null> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    if (isMissingSessionError(authError)) {
      return null
    }
    throw authError
  }

  if (!user?.email) {
    return null
  }

  const metadataRole = user.user_metadata?.role
  const roleFromMetadata =
    metadataRole === 'admin' || metadataRole === 'manager' || metadataRole === 'driver'
      ? (metadataRole as AppRole)
      : null

  const { data: profile, error: profileError } = await supabase
    .from('warehouse_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    const fallbackRole = DEMO_ROLE_BY_EMAIL[user.email.toLowerCase()]

    if (fallbackRole) {
      console.warn(
        '[auth] warehouse_users profile missing; falling back to demo role mapping for local development.',
      )
      return {
        id: user.id,
        email: user.email,
        role: fallbackRole,
      }
    }

    if (roleFromMetadata) {
      console.warn(
        '[auth] warehouse_users profile missing; falling back to Supabase user metadata role.',
      )
      return {
        id: user.id,
        email: user.email,
        role: roleFromMetadata,
      }
    }

    throw new Error(
      'User profile not found. Create the user in Supabase Auth and add a matching row in public.warehouse_users.',
    )
  }

  return {
    id: user.id,
    email: user.email,
    role: profile.role as AppRole,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await loadCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('[auth] Failed to load user', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      await refreshUser()
    },
    [refreshUser],
  )

  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
