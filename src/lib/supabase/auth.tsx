'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './client'

export type UserData = {
  id: string
  anonymous_id: string
  login_id: string | null
  display_name: string
  user_type: 'admin' | 'volunteer' | 'participant'
}

type AuthContextType = {
  user: UserData | null
  loading: boolean
  signUp: (loginId: string, password: string, displayName: string, userType: 'admin' | 'volunteer' | 'participant') => Promise<UserData>
  signIn: (loginId: string, password: string) => Promise<UserData>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({} as UserData),
  signIn: async () => ({} as UserData),
  signOut: () => {},
})

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`aidex_v1_${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAnonId =
        typeof window !== 'undefined' ? localStorage.getItem('aidex_anon_id') : null
      if (storedAnonId) {
        try {
          const { data } = await supabase
            .from('users')
            .select('id, anonymous_id, login_id, display_name, user_type')
            .eq('anonymous_id', storedAnonId)
            .single()
          if (data) {
            setUser(data as UserData)
          } else {
            localStorage.removeItem('aidex_anon_id')
          }
        } catch {
          localStorage.removeItem('aidex_anon_id')
        }
      }
      setLoading(false)
    }
    initializeAuth()
  }, [])

  const signUp = async (
    loginId: string,
    password: string,
    displayName: string,
    userType: 'admin' | 'volunteer' | 'participant'
  ): Promise<UserData> => {
    const passwordHash = await hashPassword(password)
    const newAnonId = crypto.randomUUID()

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([{
        anonymous_id: newAnonId,
        login_id: loginId,
        password_hash: passwordHash,
        display_name: displayName || loginId,
        user_type: userType,
        aid_id: `AID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        recovery_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      }])
      .select('id, anonymous_id, login_id, display_name, user_type')
      .single()

    if (dbError) {
      if (dbError.code === '23505') throw new Error('このIDはすでに使用されています')
      throw new Error(dbError.message || '登録に失敗しました')
    }

    localStorage.setItem('aidex_anon_id', newAnonId)
    setUser(userData as UserData)
    return userData as UserData
  }

  const signIn = async (loginId: string, password: string): Promise<UserData> => {
    const passwordHash = await hashPassword(password)

    const { data, error } = await supabase
      .from('users')
      .select('id, anonymous_id, login_id, display_name, user_type')
      .eq('login_id', loginId)
      .eq('password_hash', passwordHash)
      .single()

    if (error || !data) throw new Error('IDまたはパスワードが正しくありません')

    localStorage.setItem('aidex_anon_id', data.anonymous_id)
    setUser(data as UserData)
    return data as UserData
  }

  const signOut = () => {
    localStorage.removeItem('aidex_anon_id')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
