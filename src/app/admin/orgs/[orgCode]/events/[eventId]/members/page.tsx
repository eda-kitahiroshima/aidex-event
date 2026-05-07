'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { ArrowLeft, Loader2, Users, CheckCircle2, Clock, UserCheck } from 'lucide-react'
import Link from 'next/link'

interface MemberRow {
  id: string
  member_type: string
  role_id: string | null
  status: string
  checked_in: boolean
  checked_in_at: string | null
  created_at: string
  users: { display_name: string; login_id: string | null }
  event_roles: { id: string; name: string; capacity: number | null } | null
}

interface RoleGroup {
  id: string | null
  name: string
  capacity: number | null
  members: MemberRow[]
}

export default function EventMembersPage({ params }: { params: Promise<{ orgCode: string; eventId: string }> }) {
  const { orgCode, eventId } = use(params)
  const { user } = useAuth()
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [eventTitle, setEventTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'participant' | 'volunteer'>('participant')

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: eventData } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single()
      if (eventData) setEventTitle(eventData.title)

      const { data } = await supabase
        .from('event_members')
        .select(`
          id, member_type, role_id, status, checked_in, checked_in_at, created_at,
          users(display_name, login_id),
          event_roles(id, name, capacity)
        `)
        .eq('event_id', eventId)
        .neq('member_type', 'admin')
        .eq('status', 'joined')
        .order('created_at', { ascending: true })

      setMembers((data ?? []) as unknown as MemberRow[])
      setLoading(false)
    }
    fetchData()
  }, [user, eventId])

  const participants = members.filter(m => m.member_type === 'participant')
  const volunteers = members.filter(m => m.member_type === 'volunteer')

  // ボランティアを役割別にグループ化
  const roleGroups: RoleGroup[] = []
  const roleMap = new Map<string | null, RoleGroup>()

  volunteers.forEach(m => {
    const key = m.role_id ?? 'none'
    if (!roleMap.has(m.role_id)) {
      roleMap.set(m.role_id, {
        id: m.role_id,
        name: m.event_roles?.name ?? '役割なし',
        capacity: m.event_roles?.capacity ?? null,
        members: [],
      })
      roleGroups.push(roleMap.get(m.role_id)!)
    }
    roleMap.get(m.role_id)!.members.push(m)
    void key
  })

  const fulfillColor = (count: number, capacity: number | null) => {
    if (capacity === null) return 'bg-gray-100'
    if (count >= capacity) return 'bg-green-100 border-green-200'
    if (count >= capacity * 0.5) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const fulfillTextColor = (count: number, capacity: number | null) => {
    if (capacity === null) return 'text-gray-700'
    if (count >= capacity) return 'text-green-700'
    if (count >= capacity * 0.5) return 'text-yellow-700'
    return 'text-red-700'
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}`} className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">申込者一覧</h1>
            <p className="text-xs text-gray-500 truncate max-w-xs">{eventTitle}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{members.length}</div>
            <div className="text-xs text-gray-500 mt-1">申込合計</div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{participants.length}</div>
            <div className="text-xs text-blue-600 mt-1">参加者</div>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{volunteers.length}</div>
            <div className="text-xs text-green-600 mt-1">ボランティア</div>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {([
            { key: 'participant', label: '参加者', count: participants.length },
            { key: 'volunteer',   label: 'ボランティア（役割別）', count: volunteers.length },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : activeTab === 'participant' ? (
          /* ── 参加者タブ ── */
          participants.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p>まだ参加申込がありません</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">#</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">名前</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">ログインID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">申込日</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">受付</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {participants.map((m, i) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{m.users.display_name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{m.users.login_id ?? '-'}</td>
                      <td className="px-5 py-3.5 text-gray-500">{formatDate(m.created_at)}</td>
                      <td className="px-5 py-3.5">
                        {m.checked_in ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> 受付済
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> 未受付
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ── ボランティア（役割別）タブ ── */
          volunteers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
              <UserCheck className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p>まだボランティア申込がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {roleGroups.map(group => {
                const filled = group.members.length
                const cap = group.capacity
                const pct = cap ? Math.min(100, Math.round((filled / cap) * 100)) : null
                return (
                  <div
                    key={group.id ?? 'none'}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden ${fulfillColor(filled, cap)}`}
                  >
                    {/* 役割ヘッダー */}
                    <div className={`px-5 py-4 border-b ${cap === null ? 'border-gray-100' : filled >= cap ? 'border-green-200' : filled >= cap * 0.5 ? 'border-yellow-200' : 'border-red-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{group.name}</h3>
                        <span className={`text-sm font-bold ${fulfillTextColor(filled, cap)}`}>
                          {filled} / {cap !== null ? `${cap}人` : '無制限'}
                          {cap !== null && filled >= cap && ' ✓ 充足'}
                          {cap !== null && filled < cap && ` (あと${cap - filled}人)`}
                        </span>
                      </div>
                      {pct !== null && (
                        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* 参加者リスト */}
                    <div className="divide-y divide-gray-100">
                      {group.members.map((m, i) => (
                        <div key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-xs w-5 text-right">{i + 1}</span>
                            <span className="font-medium text-gray-900">{m.users.display_name}</span>
                            {m.users.login_id && (
                              <span className="text-xs text-gray-400 font-mono">{m.users.login_id}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatDate(m.created_at)}</span>
                            {m.checked_in ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> 受付済
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" /> 未
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </main>
    </div>
  )
}
