'use client'

import { useState } from 'react'
import { LogIn, User, ShieldCheck, Key, Copy, Check } from 'lucide-react'
import { useAuth, UserData } from '@/lib/supabase/auth'

export function SignInForm() {
  const { signInAnonymously, signInWithRecovery } = useAuth()
  const [mode, setMode] = useState<'signup' | 'login' | 'show_id'>('signup')
  const [displayName, setDisplayName] = useState('')
  const [userType, setUserType] = useState<'admin' | 'volunteer' | 'participant'>('participant')
  const [aidId, setAidId] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdUser, setCreatedUser] = useState<UserData | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('表示名（ニックネーム）を入力してください')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const user = await signInAnonymously(displayName, userType)
      setCreatedUser(user)
      setMode('show_id')
    } catch (err) {
      setError('登録に失敗しました。もう一度お試しください。')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aidId.trim() || !recoveryCode.trim()) {
      setError('IDと復旧コードを入力してください')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      await signInWithRecovery(aidId.trim(), recoveryCode.trim())
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    if (!createdUser) return
    const text = `ID: ${createdUser.aid_id}\n復旧コード: ${createdUser.recovery_code}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (mode === 'show_id' && createdUser) {
    return (
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">登録が完了しました！</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            このIDとコードは、スマホの機種変更や、別のパソコンでログインする際に必要です。<br/>
            <strong className="text-red-600">忘れると二度とログインできません。</strong>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">あなたのID</label>
            <div className="text-2xl font-mono font-bold text-blue-600 tracking-wider">{createdUser.aid_id}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">復旧コード（秘密）</label>
            <div className="text-2xl font-mono font-bold text-gray-800 tracking-wider">{createdUser.recovery_code}</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            {copied ? 'コピーしました' : 'IDとコードをコピーする'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            メモしたので、はじめる
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-blue-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {mode === 'signup' ? 'Aidex Event へようこそ' : '既存のIDでログイン'}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {mode === 'signup' 
            ? '個人情報を入力せずにすぐ使い始められます' 
            : '以前発行されたIDと復旧コードを入力してください'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium animate-shake">
          {error}
        </div>
      )}

      {mode === 'signup' ? (
        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              表示名（ニックネーム）
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="例: やまだ、防災太郎"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              利用区分
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(['participant', 'volunteer', 'admin'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-colors ${
                    userType === type
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type === 'participant' && '参加者'}
                  {type === 'volunteer' && 'ボランティア'}
                  {type === 'admin' && '団体管理者'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            ) : (
              <LogIn className="w-5 h-5 mr-2" />
            )}
            はじめる
          </button>

          <button
            type="button"
            onClick={() => setMode('login')}
            className="w-full text-sm text-gray-500 hover:text-blue-600 font-medium py-2"
          >
            すでにIDを持っている方はこちら
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <User className="w-4 h-4" /> あなたのID
            </label>
            <input
              type="text"
              value={aidId}
              onChange={(e) => setAidId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="例: AID-XXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Key className="w-4 h-4" /> 復旧コード
            </label>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="例: XXXXXXXX"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            ) : (
              <LogIn className="w-5 h-5 mr-2" />
            )}
            ログイン
          </button>

          <button
            type="button"
            onClick={() => setMode('signup')}
            className="w-full text-sm text-gray-500 hover:text-blue-600 font-medium py-2"
          >
            新しく登録する方はこちら
          </button>
        </form>
      )}
    </div>
  )
}
