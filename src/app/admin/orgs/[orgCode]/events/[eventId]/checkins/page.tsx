'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { ArrowLeft, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface CheckinRecord {
  id: string
  checked_in_at: string
  checkin_type: string
  event_members: {
    member_type: string
    users: {
      display_name: string
      login_id: string | null
    }
  }
}

export default function CheckinStatusPage({ params }: { params: Promise<{ orgCode: string; eventId: string }> }) {
  const { orgCode, eventId } = use(params)
  const { user } = useAuth()
  const [checkins, setCheckins] = useState<CheckinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [eventTitle, setEventTitle] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single()
      if (eventData) setEventTitle(eventData.title)

      const { data } = await supabase
        .from('checkins')
        .select(`
          id,
          checked_in_at,
          checkin_type,
          event_members(
            member_type,
            users(display_name, login_id)
          )
        `)
        .eq('event_id', eventId)
        .order('checked_in_at', { ascending: false })

      setCheckins((data ?? []) as unknown as CheckinRecord[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [eventId])

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user, fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const participantCheckins = checkins.filter(c => c.event_members?.member_type === 'participant')
  const volunteerCheckins = checkins.filter(c => c.event_members?.member_type === 'volunteer')

  const checkinTypeLabel = (type: string) => {
    if (type === 'self_qr') return 'QR自己受付'
    if (type === 'staff_scan') return 'スタッフスキャン'
    return '手動'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/admin/orgs/${orgCode}/events/${eventId}`} className="text-gray-500 hover:text-gray-900 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">当日受付状況</h1>
              <p className="text-xs text-gray-500 truncate max-w-xs">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{checkins.length}</div>
            <div className="text-sm text-gray-500 mt-1">合計受付</div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{participantCheckins.length}</div>
            <div className="text-sm text-blue-600 mt-1">参加者</div>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{volunteerCheckins.length}</div>
            <div className="text-sm text-green-600 mt-1">ボランティア</div>
          </div>
        </div>

        {/* 受付一覧 */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : checkins.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">まだ受付記録がありません</p>
            <p className="text-sm text-gray-400 mt-1">会場QRコードを掲示すると受付が始まります</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">受付履歴</span>
              <span className="text-xs text-gray-400">新しい順</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">名前</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">区分</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">受付時刻</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">方法</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {checkins.map((c, i) => (
                    <tr key={c.id} className={`hover:bg-gray-50 ${i === 0 ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {c.event_members?.users?.display_name ?? '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.event_members?.member_type === 'volunteer'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {c.event_members?.member_type === 'volunteer' ? 'ボランティア' : '参加者'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 font-mono text-sm">
                        {new Date(c.checked_in_at).toLocaleTimeString('ja-JP', {
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">
                        {checkinTypeLabel(c.checkin_type)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
