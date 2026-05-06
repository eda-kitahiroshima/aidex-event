'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, MessageSquare, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'

export default function BoardsListPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const { user } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [boards, setBoards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBoards = async () => {
      if (!user) return
      setLoading(true)
      try {
        // イベント情報の取得
        const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single()
        setEvent(eventData)

        // 自分がこのイベント内で持っている権限・役割を取得
        const { data: memberData } = await supabase
          .from('event_members')
          .select('member_type, role_id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single()

        if (!memberData) throw new Error('参加情報が見つかりません')

        const { member_type, role_id } = memberData

        // イベントのすべての掲示板を取得
        const { data: allBoards } = await supabase
          .from('boards')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true })

        if (allBoards) {
          // 権限に基づいてフィルタリング
          const visibleBoards = allBoards.filter(board => {
            if (member_type === 'admin') return true // 管理者はすべて見える
            
            switch (board.visibility) {
              case 'all': return true
              case 'volunteer': return member_type === 'volunteer'
              case 'role': return member_type === 'volunteer' && board.role_id === role_id
              default: return false
            }
          })
          setBoards(visibleBoards)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [eventId, user])

  if (loading) return <div className="min-h-screen flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              連絡掲示板
            </h1>
            <p className="text-xs text-gray-500">{event?.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {boards.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              表示できる掲示板がありません。
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {boards.map(board => (
                <li key={board.id}>
                  <Link 
                    href={`/events/${eventId}/boards/${board.id}`}
                    className="block hover:bg-gray-50 p-6 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        {board.visibility !== 'all' && <Lock className="w-4 h-4 text-gray-400 mr-2" />}
                        {board.title}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600">{board.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
