'use client'

import { useState } from 'react'
import { LogIn, UserPlus, Eye, EyeOff, Users, Shield, User } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth'

type Mode = 'login' | 'register'
type UserType = 'admin' | 'volunteer' | 'participant'

const USER_TYPE_OPTIONS: { value: UserType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'participant',
    label: '参加者',
    desc: 'イベントに参加する方',
    icon: <User className="w-5 h-5" />,
  },
  {
    value: 'volunteer',
    label: 'ボランティア',
    desc: 'スタッフとして活動する方',
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: 'admin',
    label: '団体管理者',
    desc: 'イベントを主催・管理する方',
    icon: <Shield className="w-5 h-5" />,
  },
]

export function SignInForm() {
  const { signUp, signIn } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  // 共通
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 新規登録のみ
  const [displayName, setDisplayName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [userType, setUserType] = useState<UserType>('participant')

  const resetForm = () => {
    setLoginId('')
    setPassword('')
    setConfirmPassword('')
    setDisplayName('')
    setError('')
    setShowPassword(false)
    setShowConfirm(false)
  }

  const switchMode = (next: Mode) => {
    resetForm()
    setMode(next)
  }

  const validateLoginId = (id: string) => /^[a-zA-Z0-9_]{3,20}$/.test(id)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateLoginId(loginId)) {
      setError('IDは半角英数字・アンダースコアで3〜20文字にしてください')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(loginId.trim(), password, displayName.trim() || loginId.trim(), userType)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!loginId.trim() || !password) {
      setError('IDとパスワードを入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      await signIn(loginId.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* タブ */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${
            mode === 'login'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 bg-gray-50'
          }`}
        >
          <LogIn className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          ログイン
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${
            mode === 'register'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 bg-gray-50'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          新規登録
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="例: yamada_taro"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="パスワードを入力"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting
                ? <span className="inline-block animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                : <LogIn className="w-5 h-5 mr-2" />
              }
              ログイン
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ログインID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="例: yamada_taro（3〜20文字、英数字・_）"
                maxLength={20}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="6文字以上"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="もう一度入力"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示名（ニックネーム）
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="省略するとIDが使用されます"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                利用区分 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {USER_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      userType === opt.value
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value={opt.value}
                      checked={userType === opt.value}
                      onChange={() => setUserType(opt.value)}
                      className="sr-only"
                    />
                    <span className={userType === opt.value ? 'text-blue-600' : 'text-gray-400'}>
                      {opt.icon}
                    </span>
                    <div>
                      <div className={`text-sm font-bold ${userType === opt.value ? 'text-blue-700' : 'text-gray-800'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting
                ? <span className="inline-block animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                : <UserPlus className="w-5 h-5 mr-2" />
              }
              アカウントを作成する
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
