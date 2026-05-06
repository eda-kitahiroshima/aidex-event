'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, ArrowLeft, CalendarPlus, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OrganizationDashboard({ params }: { params: Promise<{ orgCode: string }> }) {
  const { orgCode } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [org, setOrg] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrg = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select(`
            *,
            organization_members!inner(role)
          `)
          .eq('organization_code', orgCode)
          .eq('organization_members.user_id', user.id)
          .single()

        if (error) throw error
        if (data) {
          setOrg(data)
          // イベント一覧も取得
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('organization_id', data.id)
            .order('start_at', { ascending: false })
            
          if (!eventsError && eventsData) {
            setEvents(eventsData)
          }
        }
      } catch (err) {
        console.error('Error fetching org:', err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchOrg()
  }, [user, orgCode, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!org) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{org.name}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">団体ダッシュボード</h2>
          <p className="text-gray-600">{org.description || '説明なし'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* イベント管理 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <CalendarPlus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">イベント管理</h3>
              <p className="text-gray-500 text-sm mb-4">新しいイベントを作成したり、既存のイベントを管理します。</p>
              
              <Link
                href={`/admin/orgs/${orgCode}/events/new`}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                イベントを作成する
              </Link>
            </div>
            
            {events.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                <div className="px-6 py-3 border-b border-gray-100 text-sm font-medium text-gray-500">
                  作成済みのイベント
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {events.map(event => (
                    <Link
                      key={event.id}
                      href={`/admin/orgs/${orgCode}/events/${event.id}`}
                      className="block px-6 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900 truncate">{event.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(event.start_at).toLocaleDateString('ja-JP')} 開催
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 今後実装予定の機能スタブ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">参加者名簿・ラベル</h3>
              <p className="text-gray-500 text-sm mb-4">参加者の名簿管理や、属性ラベル（高齢者・子供など）の付与を行います。</p>
              <Link
                href={`/admin/orgs/${orgCode}/participants`}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                名簿を確認する
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-60">
            <div className="p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">団体設定</h3>
              <p className="text-gray-500 text-sm mb-4">団体名や説明、コードの変更を行います。</p>
              <button disabled className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-200 text-gray-500 font-medium rounded-lg cursor-not-allowed">
                準備中
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
