'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, CheckCircle2, AlertCircle, ScanLine } from 'lucide-react'
import Link from 'next/link'

export default function QRCheckinPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const { user } = useAuth()
  
  const [event, setEvent] = useState<any>(null)
  const [memberInfo, setMemberInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'initial' | 'success' | 'error'>('initial')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchCheckinInfo = async () => {
      try {
        const { data: eventData } = await supabase.from('events').select('title, has_qr_checkin').eq('id', eventId).single()
        setEvent(eventData)

        if (user) {
          const { data: mData } = await supabase
            .from('event_members')
            .select('id, checked_in')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single()
            
          setMemberInfo(mData)

          if (mData?.checked_in) {
            setStatus('success')
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCheckinInfo()
  }, [eventId, user])

  const handleCheckin = async () => {
    if (!user || !memberInfo) {
      setStatus('error')
      setErrorMessage('参加登録が見つかりません。先にイベントの参加申込を行ってください。')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. checkins に履歴を残す
      const { error: checkinError } = await supabase.from('checkins').insert([{
        event_id: eventId,
        event_member_id: memberInfo.id,
        checkin_type: 'self_qr'
      }])

      if (checkinError) throw checkinError

      // 2. event_members のステータスを更新
      const { error: memberError } = await supabase
        .from('event_members')
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq('id', memberInfo.id)

      if (memberError) throw memberError

      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('受付処理に失敗しました。スタッフにお声がけください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (!event || !event.has_qr_checkin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center">
        <div>
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">このイベントではQR受付を行っていません</h1>
          <Link href="/" className="text-blue-600 hover:underline">ホームに戻る</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-blue-600 p-6 text-center text-white">
          <ScanLine className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold mb-1">イベント受付</h1>
          <p className="text-blue-100 text-sm">{event.title}</p>
        </div>

        <div className="p-8 text-center">
          {status === 'success' ? (
            <div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">受付完了しました</h2>
              <p className="text-gray-600 mb-8">ご来場ありがとうございます。<br/>そのまま会場へお入りください。</p>
              
              <Link href="/" className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-lg transition-colors">
                ホームに戻る
              </Link>
            </div>
          ) : status === 'error' ? (
            <div>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
              <p className="text-red-600 mb-8">{errorMessage}</p>
              
              {!user || !memberInfo ? (
                <div className="space-y-3">
                  <Link href={`/events/${eventId}`} className="block w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700">
                    イベント参加申込ページへ
                  </Link>
                  <Link href="/" className="block w-full bg-gray-100 text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-200">
                    ホームに戻る
                  </Link>
                </div>
              ) : (
                <button onClick={() => setStatus('initial')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-lg transition-colors">
                  戻る
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-8">
                下のボタンを押して受付を完了してください。
              </p>
              
              <button
                onClick={handleCheckin}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <CheckCircle2 className="w-6 h-6 mr-2" />}
                受付する
              </button>

              <div className="mt-8 text-sm text-gray-400">
                {!user ? '※まだログイン・参加申込が済んでいない場合はエラーになります' : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
