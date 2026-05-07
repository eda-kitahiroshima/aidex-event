'use client'

import { useAuth } from '@/lib/supabase/auth'
import { SignInForm } from '@/components/auth/SignInForm'
import { CreateOrganizationForm } from '@/components/admin/CreateOrganizationForm'
import { OrganizationList } from '@/components/admin/OrganizationList'
import { Loader2, LogOut, HelpCircle, Calendar, MessageSquare, QrCode, ClipboardList, UserCircle, Search, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface EventDetails {
  id: string
  title: string
  start_at: string
  location: string
  has_qr_checkin: boolean
  has_survey: boolean
}

interface JoinedEvent {
  event_id: string
  member_type: string
  role_id: string | null
  events: EventDetails
  event_roles: { name: string } | null
}

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [refreshOrgList, setRefreshOrgList] = useState(0)
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      setUnreadCount(count ?? 0)
    }
    fetchUnread()
  }, [user])

  useEffect(() => {
    if (!user || user.user_type === 'admin') return

    const fetchJoinedEvents = async () => {
      setEventsLoading(true)
      try {
        const { data } = await supabase
          .from('event_members')
          .select(`
            event_id,
            member_type,
            role_id,
            events(id, title, start_at, location, has_qr_checkin, has_survey),
            event_roles(name)
          `)
          .eq('user_id', user.id)
          .neq('member_type', 'admin')
          .order('created_at', { ascending: false })

        if (data) setJoinedEvents(data as unknown as JoinedEvent[])
      } catch (err) {
        console.error(err)
      } finally {
        setEventsLoading(false)
      }
    }

    fetchJoinedEvents()
  }, [user])

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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aidex Event</h1>
          <p className="text-gray-500">地域イベント・ボランティア運営管理アプリ</p>
        </div>
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
          <div className="flex items-center gap-3">
            <Link
              href="/manual"
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">マニュアル</span>
            </Link>
            <Link
              href="/notifications"
              className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              title="お知らせ"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              {user.display_name}
            </Link>
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

        {(user.user_type === 'volunteer' || user.user_type === 'participant') && (
          <div className="space-y-6">
            <Link
              href="/events/search"
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-4 rounded-xl transition-colors shadow"
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="text-base">
                  {user.user_type === 'volunteer' ? 'ボランティア募集を探す' : 'イベントを探す'}
                </div>
                <div className="text-xs font-normal text-indigo-200">
                  {user.user_type === 'volunteer' ? '参加可能なイベントを検索する' : '参加申込できるイベントを検索する'}
                </div>
              </div>
            </Link>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-1">
                {user.user_type === 'volunteer' ? '担当イベント' : '参加予定のイベント'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {user.user_type === 'volunteer'
                  ? '申し込んだボランティアイベントが表示されます。'
                  : '申し込んだイベントが表示されます。'}
              </p>

              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : joinedEvents.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">まだ参加しているイベントはありません</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {user.user_type === 'volunteer'
                      ? 'ボランティア募集URLから申し込んでください。'
                      : 'イベントの参加申込URLから申し込んでください。'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinedEvents.map(item => (
                    <div key={item.event_id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-900 text-lg">{item.events.title}</h3>
                        <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.events.start_at).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </span>
                          {item.event_roles?.name && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                              担当: {item.event_roles.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/events/${item.events.id}/boards`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          掲示板
                        </Link>
                        {item.events.has_qr_checkin && (
                          <Link
                            href={`/events/${item.events.id}/checkin`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                            当日受付
                          </Link>
                        )}
                        {item.events.has_survey && (
                          <Link
                            href={`/events/${item.events.id}/survey`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                          >
                            <ClipboardList className="w-4 h-4" />
                            アンケート
                          </Link>
                        )}
                        <Link
                          href={`/events/${item.events.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          イベント詳細
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {user.login_id && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="text-sm text-blue-800 font-medium">
                  ログインID: <span className="font-mono font-bold">{user.login_id}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
