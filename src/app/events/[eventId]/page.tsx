'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

export default function EventParticipantPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const { user, signInAnonymously } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'loading' | 'unregistered' | 'joined'>('loading')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayName, setDisplayName] = useState('')

  const [baseUrl, setBaseUrl] = useState('')
  const checkinUrl = `${baseUrl}/events/${eventId}/checkin`

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const { data: eventData, error } = await supabase
          .from('events')
          .select('*, organizations(name)')
          .eq('id', eventId)
          .single()

        if (error || !eventData) throw new Error('イベントが見つかりません')
        setEvent(eventData)

        if (user) {
          // 既に参加済みかチェック
          const { data: memberData } = await supabase
            .from('event_members')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single()

          if (memberData) {
            setStatus('joined')
          } else {
            setStatus('unregistered')
          }
        } else {
          setStatus('unregistered')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [eventId, user])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      let currentUserId = user?.id

      // 未ログインなら自動的に匿名ログイン（参加者として）
      if (!currentUserId) {
        if (!displayName.trim()) {
          alert('表示名を入力してください')
          setIsSubmitting(false)
          return
        }
        // オリジナルの匿名ログインを実行してIDを取得
        const newUser = await signInAnonymously(displayName, 'participant')
        currentUserId = newUser?.id
      }

      if (!currentUserId) throw new Error('ユーザー情報の取得に失敗しました')

      // イベント参加登録
      const { error } = await supabase
        .from('event_members')
        .insert([{
          event_id: eventId,
          user_id: currentUserId,
          member_type: 'participant',
          status: 'joined'
        }])

      if (error && error.code !== '23505') throw error // unique violation(23505)は既に登録済みとみなす

      setStatus('joined')
    } catch (err) {
      console.error(err)
      alert('参加申込に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  if (!event) return <div className="text-center py-20 text-gray-500">イベントが見つかりません。</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white pb-16 pt-8 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-blue-100 text-sm font-medium mb-2">{event.organizations.name} 主催</div>
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <div className="flex flex-col space-y-2 text-blue-50">
            <div className="flex items-center"><Calendar className="w-5 h-5 mr-2" /> {new Date(event.start_at).toLocaleString('ja-JP')}</div>
            <div className="flex items-center"><MapPin className="w-5 h-5 mr-2" /> {event.location}</div>
            {event.capacity > 0 && <div className="flex items-center"><Users className="w-5 h-5 mr-2" /> 定員: {event.capacity}名</div>}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">イベント詳細</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{event.description || '説明がありません'}</p>
        </div>

        {status === 'joined' ? (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">参加申込が完了しました！</h2>
            <p className="text-gray-500 mb-8">イベント当日にお待ちしております。</p>

            {event.has_qr_checkin && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">あなたの参加用QRコード</h3>
                <p className="text-sm text-blue-700 mb-4">当日、受付でこの画面を提示して「受付する」ボタンを押すか、<br/>受付の端末でQRコードを読み取ってもらってください。</p>
                <div className="bg-white p-4 inline-block rounded-xl border">
                  {/* 当日受付で参加者自身を識別するためのURL (ここではモックとしてeventIdを含めるのみ) */}
                  <QRCodeSVG value={`${checkinUrl}?u=${user?.id}`} size={150} />
                </div>
              </div>
            )}
            
            <Link href="/" className="text-blue-600 font-medium hover:underline">ホームに戻る</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100 border-t-4 border-t-blue-500">
            <h2 className="text-xl font-bold text-gray-900 mb-2">参加申込</h2>
            <p className="text-gray-500 text-sm mb-6">個人情報の入力は不要です。</p>

            <form onSubmit={handleJoin} className="space-y-4">
              {!user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">表示名（ニックネーム） <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="例: やまだ、防災親子"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              
              {user && (
                <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-600">
                  <span className="font-bold text-gray-800">{user.display_name}</span> として申し込みます。
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                参加を申し込む
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
