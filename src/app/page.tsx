'use client'

import { useAuth } from '@/lib/supabase/auth'
import { SignInForm } from '@/components/auth/SignInForm'
import { CreateOrganizationForm } from '@/components/admin/CreateOrganizationForm'
import { OrganizationList } from '@/components/admin/OrganizationList'
import { Loader2, LogOut, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [refreshOrgList, setRefreshOrgList] = useState(0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <SignInForm />
        <Link 
          href="/manual" 
          className="mt-8 flex items-center gap-2 text-blue-600 hover:underline font-medium"
        >
          <HelpCircle className="w-5 h-5" />
          使い方がわからない方はこちら
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Aidex Event</h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/manual" 
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mr-2"
            >
              <HelpCircle className="w-4 h-4" />
              マニュアル
            </Link>
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {user.display_name} ({user.user_type === 'admin' ? '管理者' : user.user_type === 'volunteer' ? 'ボランティア' : '参加者'})
            </span>
            <button
              onClick={() => signOut()}
              className="text-gray-500 hover:text-red-600 transition-colors p-2"
              title="ログアウト"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.user_type === 'admin' && (
          <div className="space-y-6">
            <CreateOrganizationForm onCreated={() => setRefreshOrgList(prev => prev + 1)} />
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">管理している団体</h2>
              <OrganizationList refreshTrigger={refreshOrgList} />
            </div>
          </div>
        )}

        {user.user_type === 'volunteer' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">ボランティア向けメニュー</h2>
            <p className="text-gray-600 mb-6">参加予定のイベントや募集中のボランティアが表示されます。</p>
            {/* 今後ここに担当イベント一覧を追加 */}
          </div>
        )}

        {user.user_type === 'participant' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">参加者向けメニュー</h2>
            <p className="text-gray-600 mb-6">申し込んだイベントや、お知らせが表示されます。</p>
            {/* 今後ここにマイイベント一覧を追加 */}
          </div>
        )}
      </div>
    </main>
  )
}
