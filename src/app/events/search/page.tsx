'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import {
  ArrowLeft, Calendar, MapPin, Users, Search, Loader2, UserPlus,
} from 'lucide-react'
import Link from 'next/link'

interface EventRow {
  id: string
  title: string
  description: string | null
  location: string | null
  start_at: string
  end_at: string
  volunteer_capacity: number | null
  organizations: { name: string }
}

export default function VolunteerSearchPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventRow[]>([])
  const [filtered, setFiltered] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, description, location, start_at, end_at, volunteer_capacity, organizations(name)')
        .eq('status', 'published')
        .eq('visibility', 'public')
        .gte('end_at', new Date().toISOString())
        .order('start_at', { ascending: true })

      const list = (data ?? []) as unknown as EventRow[]
      setEvents(list)
      setFiltered(list)

      if (user) {
        const memberType = user.user_type === 'participant' ? 'participant' : 'volunteer'
        const { data: memberData } = await supabase
          .from('event_members')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('member_type', memberType)
        setJoinedIds(new Set((memberData ?? []).map(m => m.event_id)))
      }
      setLoading(false)
    }
    fetchEvents()
  }, [user])

  useEffect(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) {
      setFiltered(events)
      return
    }
    setFiltered(events.filter(e =>
      e.title.toLowerCase().includes(kw) ||
      (e.location ?? '').toLowerCase().includes(kw) ||
      e.organizations.name.toLowerCase().includes(kw) ||
      (e.description ?? '').toLowerCase().includes(kw)
    ))
  }, [keyword, events])

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-indigo-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link href="/" className="text-indigo-200 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {user?.user_type === 'participant' ? 'イベントを探す' : 'ボランティア募集を探す'}
            </h1>
            <p className="text-indigo-200 text-sm">参加可能なイベントを検索できます</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* 検索ボックス */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            placeholder="イベント名・場所・団体名で検索"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">該当するイベントが見つかりません</p>
            <p className="text-sm mt-1">キーワードを変えてお試しください</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{filtered.length} 件のイベントが見つかりました</p>
            {filtered.map(event => {
              const isJoined = joinedIds.has(event.id)
              const startDate = new Date(event.start_at)
              return (
                <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-indigo-600 mb-1">{event.organizations.name}</p>
                        <h2 className="font-bold text-gray-900 text-base leading-snug mb-2">{event.title}</h2>
                        {event.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            {startDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                            &nbsp;{startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              {event.location}
                            </span>
                          )}
                          {event.volunteer_capacity != null && event.volunteer_capacity > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              ボランティア募集: {event.volunteer_capacity}名
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {isJoined ? (
                        <span className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200">
                          申込済み
                        </span>
                      ) : user?.user_type === 'participant' ? (
                        <Link
                          href={`/events/${event.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          参加申込
                        </Link>
                      ) : user?.user_type === 'volunteer' ? (
                        <Link
                          href={`/events/${event.id}/volunteer`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          ボランティアに申し込む
                        </Link>
                      ) : null}
                      <Link
                        href={`/events/${event.id}`}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                        詳細を見る
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
