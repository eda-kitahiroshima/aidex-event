'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Bell, ArrowLeft, Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  body: string
  is_read: boolean
  created_at: string
  link_type: string | null
  link_id: string | null
  event_id: string | null
  events: { title: string } | null
}

function notifLink(n: Notification): string {
  if (n.link_type === 'board' && n.event_id && n.link_id) {
    return `/events/${n.event_id}/boards/${n.link_id}`
  }
  if (n.event_id) return `/events/${n.event_id}`
  return '#'
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchAndMarkRead = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*, events(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications((data ?? []) as unknown as Notification[])
      setLoading(false)

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
    fetchAndMarkRead()
  }, [user])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    if (diffMin < 1) return 'たった今'
    if (diffMin < 60) return `${diffMin}分前`
    if (diffHour < 24) return `${diffHour}時間前`
    if (diffDay < 7) return `${diffDay}日前`
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            お知らせ
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">お知らせはまだありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const href = notifLink(n)
              return (
                <Link
                  key={n.id}
                  href={href}
                  className={`block bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
                    !n.is_read ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        )}
                        <p className="font-bold text-gray-900 text-sm truncate">{n.title}</p>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{n.body}</p>
                      {n.events?.title && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-indigo-600">
                          <Calendar className="w-3.5 h-3.5" />
                          {n.events.title}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
