'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { ArrowLeft, Loader2, Link as LinkIcon, Trash2, Plus, Users, Send, Bell, MessageSquare, ClipboardList, Pencil, BarChart3, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

interface Event {
  id: string
  title: string
  description: string
  start_at: string
  end_at: string
  status: string
  organization_id: string
  has_qr_checkin: boolean
  has_survey: boolean
}

interface Role {
  id: string
  name: string
  capacity: number | null
}

interface Label {
  id: string
  name: string
  color: string
}

export default function EventDashboardPage({ params }: { params: Promise<{ orgCode: string, eventId: string }> }) {
  const { orgCode, eventId } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [stats, setStats] = useState({ participants: 0, volunteers: 0, checkins: 0 })
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedLabelId, setSelectedLabelId] = useState<string>('all')
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeBody, setNoticeBody] = useState('')
  const [isSendingNotice, setIsSendingNotice] = useState(false)

  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleCapacity, setNewRoleCapacity] = useState('')
  const [isAddingRole, setIsAddingRole] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const participantUrl = `${baseUrl}/events/${eventId}`
  const volunteerUrl = `${baseUrl}/events/${eventId}/volunteer`
  const checkinUrl = `${baseUrl}/events/${eventId}/checkin`
  const surveyUrl = `${baseUrl}/events/${eventId}/survey`

  useEffect(() => {
    const fetchEventData = async () => {
      if (!user) return
      setLoading(true)
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*, organizations!inner(organization_code)')
          .eq('id', eventId)
          .eq('organizations.organization_code', orgCode)
          .single()

        if (eventError || !eventData) throw new Error('イベントが見つかりません')
        setEvent(eventData as Event)

        const { data: rolesData } = await supabase
          .from('event_roles')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true })

        if (rolesData) setRoles(rolesData)

        const { count: pCount } = await supabase.from('event_members').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('member_type', 'participant').eq('status', 'joined')
        const { count: vCount } = await supabase.from('event_members').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('member_type', 'volunteer').eq('status', 'joined')
        const { count: cCount } = await supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('event_id', eventId)

        setStats({
          participants: pCount || 0,
          volunteers: vCount || 0,
          checkins: cCount || 0
        })

        const { data: labelsData } = await supabase
          .from('labels')
          .select('*')
          .eq('organization_id', eventData.organization_id)
        if (labelsData) setLabels(labelsData)

      } catch (err) {
        console.error(err)
        router.push(`/admin/orgs/${orgCode}`)
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [eventId, orgCode, user, router])

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return

    setIsAddingRole(true)
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('event_roles')
        .insert([{
          event_id: eventId,
          name: newRoleName,
          capacity: parseInt(newRoleCapacity) || null
        }])
        .select()
        .single()

      if (roleError) throw roleError

      const { error: boardError } = await supabase
        .from('boards')
        .insert([{
          event_id: eventId,
          role_id: roleData.id,
          board_type: 'role',
          title: `${newRoleName}係 掲示板`,
          description: `${newRoleName}係の専用掲示板です。`,
          visibility: 'role',
          post_permission: 'admin',
          reply_permission: 'role'
        }])

      if (boardError) throw boardError

      setRoles([...roles, roleData])
      setNewRoleName('')
      setNewRoleCapacity('')
    } catch (err) {
      console.error('役割追加エラー:', err)
      alert('役割の追加に失敗しました。')
    } finally {
      setIsAddingRole(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('この役割を削除しますか？\n関連する掲示板も削除されます。')) return

    try {
      const { error } = await supabase
        .from('event_roles')
        .delete()
        .eq('id', roleId)

      if (error) throw error
      setRoles(roles.filter(r => r.id !== roleId))
    } catch (err) {
      console.error('削除エラー:', err)
      alert('役割の削除に失敗しました。')
    }
  }

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noticeTitle.trim() || !noticeBody.trim() || !event) return

    setIsSendingNotice(true)
    try {
      let targetUserIds: string[] = []

      if (selectedLabelId === 'all') {
        const { data } = await supabase
          .from('organization_participants')
          .select('user_id')
          .eq('organization_id', event.organization_id)
        targetUserIds = data?.map((d: { user_id: string }) => d.user_id) || []
      } else {
        const { data } = await supabase
          .from('user_labels')
          .select('organization_participants(user_id)')
          .eq('label_id', selectedLabelId)
        targetUserIds = data?.flatMap((d: { organization_participants: { user_id: string }[] }) => d.organization_participants.map(p => p.user_id)) || []
      }

      if (targetUserIds.length === 0) {
        alert('通知対象のユーザーが見つかりませんでした。')
        return
      }

      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        event_id: eventId,
        title: noticeTitle,
        body: noticeBody,
        link_type: 'event',
        link_id: eventId
      }))

      const { error } = await supabase.from('notifications').insert(notifications)
      if (error) throw error

      alert(`${targetUserIds.length}名に通知を送信しました。`)
      setNoticeTitle('')
      setNoticeBody('')
    } catch (err) {
      console.error(err)
      alert('通知の送信に失敗しました。')
    } finally {
      setIsSendingNotice(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/admin/orgs/${orgCode}`} className="text-gray-500 hover:text-gray-900 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/orgs/${orgCode}/events/${eventId}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              編集
            </Link>
            <Link
              href={`/admin/orgs/${orgCode}/events/${eventId}/report`}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              実績レポート
            </Link>
            <Link
              href={`/events/${eventId}/boards`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              掲示板
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 統計情報 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}/members`} className="bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col transition-colors group">
            <div className="text-sm text-gray-500 font-medium mb-1">参加者申込</div>
            <div className="text-2xl font-bold text-gray-900">{stats.participants} <span className="text-sm font-normal text-gray-500">人</span></div>
            <div className="text-xs text-blue-600 mt-1 group-hover:underline">一覧を見る →</div>
          </Link>
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}/members`} className="bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col transition-colors group">
            <div className="text-sm text-gray-500 font-medium mb-1">ボランティア申込</div>
            <div className="text-2xl font-bold text-gray-900">{stats.volunteers} <span className="text-sm font-normal text-gray-500">人</span></div>
            <div className="text-xs text-green-600 mt-1 group-hover:underline">役割別を見る →</div>
          </Link>
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}/checkins`} className="bg-blue-50/80 hover:bg-blue-100/80 rounded-xl shadow-sm border border-blue-200 p-5 flex flex-col justify-between transition-colors group">
            <div className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-1">
              <CheckSquare className="w-4 h-4" />
              当日受付
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.checkins} <span className="text-sm font-normal text-blue-700">人</span></div>
            <div className="text-xs text-blue-600 mt-1 group-hover:underline">詳細を見る →</div>
          </Link>
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}/surveys`} className="bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center items-center transition-colors group">
            <ClipboardList className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-1" />
            <div className="text-sm text-gray-600 font-bold group-hover:text-blue-600">
              アンケート結果
            </div>
          </Link>
        </section>

        {/* URLとQRコードセクション */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
            募集URL・QRコード
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 参加者用 */}
            <div className="border rounded-lg p-4 flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">参加者募集用</h3>
              <div className="bg-white p-2 rounded-lg border mb-3">
                <QRCodeSVG value={participantUrl} size={100} />
              </div>
              <input readOnly value={participantUrl} className="w-full text-xs p-1.5 bg-gray-50 border rounded text-gray-500 mb-2" onClick={e => e.currentTarget.select()} />
              <Link href={`/events/${eventId}`} target="_blank" className="text-blue-600 text-xs font-medium hover:underline">ページを開く</Link>
            </div>

            {/* ボランティア用 */}
            <div className="border rounded-lg p-4 flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">ボランティア募集用</h3>
              <div className="bg-white p-2 rounded-lg border mb-3">
                <QRCodeSVG value={volunteerUrl} size={100} />
              </div>
              <input readOnly value={volunteerUrl} className="w-full text-xs p-1.5 bg-gray-50 border rounded text-gray-500 mb-2" onClick={e => e.currentTarget.select()} />
              <Link href={`/events/${eventId}/volunteer`} target="_blank" className="text-blue-600 text-xs font-medium hover:underline">ページを開く</Link>
            </div>

            {/* 当日受付用 */}
            {event.has_qr_checkin && (
              <div className="border rounded-lg p-4 flex flex-col items-center text-center bg-blue-50/50">
                <h3 className="font-bold text-blue-800 mb-2 text-sm">当日会場受付QR</h3>
                <div className="bg-white p-2 rounded-lg border mb-3">
                  <QRCodeSVG value={checkinUrl} size={100} />
                </div>
                <p className="text-xs text-gray-600 mb-2">会場入り口に掲示</p>
                <Link href={`/events/${eventId}/checkin`} target="_blank" className="text-blue-600 text-xs font-medium hover:underline">ページを開く</Link>
              </div>
            )}

            {/* アンケート用 */}
            {event.has_survey && (
              <div className="border rounded-lg p-4 flex flex-col items-center text-center bg-purple-50/50">
                <h3 className="font-bold text-purple-800 mb-2 text-sm">アンケートQR</h3>
                <div className="bg-white p-2 rounded-lg border mb-3">
                  <QRCodeSVG value={surveyUrl} size={100} />
                </div>
                <p className="text-xs text-gray-600 mb-2">イベント終了後に掲示</p>
                <Link href={`/events/${eventId}/survey`} target="_blank" className="text-purple-600 text-xs font-medium hover:underline">ページを開く</Link>
              </div>
            )}
          </div>
        </section>

        {/* 役割管理セクション */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            ボランティア役割設定
          </h2>

          <div className="mb-6 space-y-2">
            {roles.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg text-center">
                役割が設定されていません。受付係などを追加してください。
              </p>
            ) : (
              roles.map(role => (
                <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="font-bold text-gray-800">{role.name}</span>
                    <span className="ml-3 text-sm text-gray-500">
                      必要人数: {role.capacity ? `${role.capacity}名` : '無制限'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddRole} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="役割名（例: 受付係）"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="number"
              placeholder="人数(空で無制限)"
              value={newRoleCapacity}
              onChange={e => setNewRoleCapacity(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              min="1"
            />
            <button
              type="submit"
              disabled={isAddingRole || !newRoleName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isAddingRole ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              追加
            </button>
          </form>
        </section>

        {/* 通知送信セクション */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-red-500" />
            参加者へのイベント案内通知
          </h2>

          <form onSubmit={handleSendNotice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">送信対象（ラベル）</label>
                <select
                  value={selectedLabelId}
                  onChange={e => setSelectedLabelId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                >
                  <option value="all">名簿の全員（{stats.participants}名）</option>
                  {labels.map(label => (
                    <option key={label.id} value={label.id}>{label.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">通知タイトル</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  placeholder="例: 【重要】明日の集合場所について"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ本文</label>
              <textarea
                value={noticeBody}
                onChange={e => setNoticeBody(e.target.value)}
                placeholder="案内文を入力してください..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSendingNotice || !noticeTitle.trim()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isSendingNotice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                一括通知を送信する
              </button>
            </div>
          </form>
        </section>

      </main>
    </div>
  )
}
