'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, Calendar, MapPin, CheckCircle2, UserPlus, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function VolunteerRecruitPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const { user, signInAnonymously } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'loading' | 'unregistered' | 'joined'>('loading')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*, organizations(name)')
          .eq('id', eventId)
          .single()

        if (eventError || !eventData) throw new Error('イベントが見つかりません')
        setEvent(eventData)

        const { data: rolesData } = await supabase
          .from('event_roles')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true })

        if (rolesData) setRoles(rolesData)

        if (user) {
          const { data: memberData } = await supabase
            .from('event_members')
            .select('id, role_id')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single()

          if (memberData && memberData.role_id) {
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

    fetchData()
  }, [eventId, user])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoleId) {
      alert('希望する役割を選択してください')
      return
    }

    setIsSubmitting(true)
    
    try {
      let currentUserId = user?.id

      if (!currentUserId) {
        if (!displayName.trim()) {
          alert('表示名を入力してください')
          setIsSubmitting(false)
          return
        }
        const newUser = await signInAnonymously(displayName, 'volunteer')
        currentUserId = newUser?.id
      }

      if (!currentUserId) throw new Error('ユーザー情報の取得に失敗しました')

      // イベント参加（ボランティアとして）
      const { error } = await supabase
        .from('event_members')
        .insert([{
          event_id: eventId,
          user_id: currentUserId,
          member_type: 'volunteer',
          role_id: selectedRoleId,
          status: 'joined'
        }])

      if (error && error.code !== '23505') throw error

      setStatus('joined')
    } catch (err) {
      console.error(err)
      alert('申込に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
  if (!event) return <div className="text-center py-20 text-gray-500">イベントが見つかりません。</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-indigo-600 text-white pb-16 pt-8 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 bg-indigo-500 text-indigo-50 rounded-full text-xs font-bold mb-3 border border-indigo-400">
            ボランティアスタッフ募集
          </div>
          <div className="text-indigo-100 text-sm font-medium mb-2">{event.organizations.name}</div>
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <div className="flex flex-col space-y-2 text-indigo-50">
            <div className="flex items-center"><Calendar className="w-5 h-5 mr-2" /> {new Date(event.start_at).toLocaleString('ja-JP')} 集合</div>
            <div className="flex items-center"><MapPin className="w-5 h-5 mr-2" /> {event.location}</div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-indigo-600" />
            活動内容
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{event.description || '説明がありません'}</p>
        </div>

        {status === 'joined' ? (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">スタッフ登録が完了しました！</h2>
            <p className="text-gray-500 mb-8">イベント当日にお待ちしております。</p>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-left border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-2">今後の流れ</h3>
              <ul className="text-sm text-indigo-800 space-y-2 list-disc list-inside">
                <li>ホーム画面から「担当イベント」として確認できます。</li>
                <li>スタッフ用掲示板で連絡事項を確認してください。</li>
                <li>当日の集合場所や時間は掲示板で共有されます。</li>
              </ul>
            </div>
            
            <Link href="/" className="text-indigo-600 font-medium hover:underline flex items-center justify-center">
              ホーム・掲示板を見る
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100 border-t-4 border-t-indigo-500">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-indigo-600" />
              ボランティアに申し込む
            </h2>
            <p className="text-gray-500 text-sm mb-6">希望する役割を選択してください。個人情報の入力は不要です。</p>

            {roles.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                現在、選択できる役割が設定されていません。
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">希望の役割を選択</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roles.map(role => (
                      <label 
                        key={role.id} 
                        className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${
                          selectedRoleId === role.id 
                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <input 
                            type="radio" 
                            name="role" 
                            value={role.id}
                            checked={selectedRoleId === role.id}
                            onChange={() => setSelectedRoleId(role.id)}
                            className="text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-3" 
                          />
                          <span className="font-bold text-gray-900">{role.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 ml-7">
                          {role.capacity ? `募集枠: ${role.capacity}名` : '募集人数制限なし'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {!user && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">表示名（ニックネーム） <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="例: たなか、誘導スタッフ"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}
                
                {user && (
                  <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-600">
                    <span className="font-bold text-gray-800">{user.display_name}</span> としてスタッフ登録します。
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedRoleId}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  スタッフとして登録する
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
