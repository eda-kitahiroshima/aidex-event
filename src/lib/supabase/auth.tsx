'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './client'
import { Session } from '@supabase/supabase-js'

export type UserData = {
  id: string
  anonymous_id: string
  display_name: string
  user_type: 'admin' | 'volunteer' | 'participant'
  aid_id: string
  recovery_code: string
}

type AuthContextType = {
  user: UserData | null
  loading: boolean
  signInAnonymously: (displayName: string, userType: 'admin' | 'volunteer' | 'participant') => Promise<UserData>
  signInWithRecovery: (aidId: string, recoveryCode: string) => Promise<UserData>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInAnonymously: async () => ({} as UserData),
  signInWithRecovery: async () => ({} as UserData),
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      // ローカルストレージからIDを取得
      const storedAnonId = typeof window !== 'undefined' ? localStorage.getItem('aidex_anon_id') : null
      
      if (storedAnonId) {
        await fetchUserData(storedAnonId)
      } else {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const fetchUserData = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('anonymous_id', authId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // not found 以外
        console.error('Error fetching user data:', error)
      }
      
      if (data) {
        setUser(data)
      } else {
        // DBから消えていたらローカルストレージも消す
        localStorage.removeItem('aidex_anon_id')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const signInAnonymously = async (displayName: string, userType: 'admin' | 'volunteer' | 'participant') => {
    setLoading(true)
    try {
      // ランダムなIDと復旧コードを生成
      const newAnonId = crypto.randomUUID()
      const newAidId = `AID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const newRecoveryCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      // userテーブルにレコードを作成
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .insert([
          {
            anonymous_id: newAnonId,
            display_name: displayName,
            user_type: userType,
            aid_id: newAidId,
            recovery_code: newRecoveryCode
          }
        ])
        .select()
        .single()
        
      if (dbError) throw dbError
      
      // 成功したらローカルストレージに保存してStateを更新
      localStorage.setItem('aidex_anon_id', newAnonId)
      setUser(userData)
      return userData
      
    } catch (e) {
      console.error('Sign in error:', e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  const signInWithRecovery = async (aidId: string, recoveryCode: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('aid_id', aidId)
        .eq('recovery_code', recoveryCode)
        .single()
        
      if (error || !data) throw new Error('IDまたは復旧コードが正しくありません')
      
      localStorage.setItem('aidex_anon_id', data.anonymous_id)
      setUser(data)
      return data
    } catch (e) {
      console.error('Recovery error:', e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    localStorage.removeItem('aidex_anon_id')
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInAnonymously, signInWithRecovery, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
