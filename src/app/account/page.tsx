'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Shield, Users, LogOut, Check, Pencil, X } from 'lucide-react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const USER_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  admin:       { label: '団体管理者', color: 'bg-purple-100 text-purple-700' },
  volunteer:   { label: 'ボランティア', color: 'bg-green-100 text-green-700' },
  participant: { label: '参加者',       color: 'bg-blue-100 text-blue-700' },
}

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  if (!user) {
    router.push('/')
    return null
  }

  const typeInfo = USER_TYPE_LABEL[user.user_type] ?? { label: user.user_type, color: 'bg-gray-100 text-gray-700' }

  const startEdit = () => {
    setNewName(user.display_name)
    setEditingName(true)
    setSaveError('')
    setSaved(false)
  }

  const cancelEdit = () => {
    setEditingName(false)
    setSaveError('')
  }

  const saveName = async () => {
    if (!newName.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      const { error } = await supabase
        .from('users')
        .update({ display_name: newName.trim() })
        .eq('id', user.id)
      if (error) throw error
      // ページリロードでuserを再取得
      setSaved(true)
      setEditingName(false)
      setTimeout(() => window.location.reload(), 600)
    } catch {
      setSaveError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">アカウント情報</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* アイコン */}
        <div className="flex justify-center py-4">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            {user.user_type === 'admin'
              ? <Shield className="w-10 h-10 text-purple-500" />
              : user.user_type === 'volunteer'
                ? <Users className="w-10 h-10 text-green-500" />
                : <User className="w-10 h-10 text-blue-500" />}
          </div>
        </div>

        {/* 情報カード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {/* ログインID */}
          <div className="px-6 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ログインID</p>
            <p className="font-mono font-bold text-gray-900 text-lg">{user.login_id ?? '(旧形式のアカウント)'}</p>
          </div>

          {/* 表示名 */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">表示名（ニックネーム）</p>
              {!editingName && (
                <button onClick={startEdit} className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> 変更
                </button>
              )}
            </div>
            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength={20}
                  autoFocus
                />
                {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={saveName}
                    disabled={saving || !newName.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    保存
                  </button>
                  <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1.5 border text-sm rounded-lg text-gray-600">
                    <X className="w-4 h-4" /> キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-bold text-gray-900 text-lg">
                {saved ? newName || user.display_name : user.display_name}
              </p>
            )}
          </div>

          {/* 利用区分 */}
          <div className="px-6 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">利用区分</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          </div>
        </div>

        {/* ログアウト */}
        <div className="pt-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            ログアウト
          </button>
        </div>
      </main>
    </div>
  )
}
