'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, ArrowLeft, UserPlus, Tag, Search, X, Plus, Save, MoreVertical, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OrganizationParticipants({ params }: { params: Promise<{ orgCode: string }> }) {
  const { orgCode } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  
  const [org, setOrg] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // モーダル・状態管理
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [searchAidId, setSearchAidId] = useState('')
  const [foundUser, setFoundUser] = useState<any>(null)
  const [addUserError, setAddUserError] = useState('')
  
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6')

  useEffect(() => {
    fetchData()
  }, [user, orgCode])

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. 団体情報を取得
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('organization_code', orgCode)
        .single()
      
      if (orgError) throw orgError
      setOrg(orgData)

      // 2. ラベル一覧を取得
      const { data: labelsData } = await supabase
        .from('labels')
        .select('*')
        .eq('organization_id', orgData.id)
      setLabels(labelsData || [])

      // 3. 参加者名簿を取得
      const { data: participantsData, error: pError } = await supabase
        .from('organization_participants')
        .select(`
          *,
          users(id, display_name, aid_id, user_type),
          user_labels(label_id)
        `)
        .eq('organization_id', orgData.id)
      
      if (pError) throw pError
      setParticipants(participantsData || [])
    } catch (err) {
      console.error('Error fetching participants:', err)
    } finally {
      setLoading(false)
    }
  }

  // ユーザー検索
  const handleSearchUser = async () => {
    setAddUserError('')
    setFoundUser(null)
    if (!searchAidId.trim().startsWith('AID-')) {
      setAddUserError('AID-IDを正しく入力してください（例: AID-XXXXXX）')
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, aid_id')
      .eq('aid_id', searchAidId.trim().toUpperCase())
      .single()

    if (error || !data) {
      setAddUserError('ユーザーが見つかりませんでした')
    } else {
      setFoundUser(data)
    }
  }

  // 名簿に追加
  const handleAddParticipant = async () => {
    if (!foundUser || !org) return
    try {
      const { error } = await supabase
        .from('organization_participants')
        .insert([{
          organization_id: org.id,
          user_id: foundUser.id
        }])
      
      if (error) {
        if (error.code === '23505') {
          setAddUserError('このユーザーは既に名簿に登録されています')
        } else {
          throw error
        }
      } else {
        setIsAddUserModalOpen(false)
        setSearchAidId('')
        setFoundUser(null)
        fetchData()
      }
    } catch (err) {
      console.error(err)
      setAddUserError('登録に失敗しました')
    }
  }

  // ラベル作成
  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !org) return
    try {
      const { error } = await supabase
        .from('labels')
        .insert([{
          organization_id: org.id,
          name: newLabelName.trim(),
          color: newLabelColor
        }])
      if (error) throw error
      setNewLabelName('')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  // ラベル付与・解除
  const toggleLabel = async (participantId: string, labelId: string, hasLabel: boolean) => {
    try {
      if (hasLabel) {
        await supabase
          .from('user_labels')
          .delete()
          .eq('organization_participant_id', participantId)
          .eq('label_id', labelId)
      } else {
        await supabase
          .from('user_labels')
          .insert([{
            organization_participant_id: participantId,
            label_id: labelId
          }])
      }
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/admin/orgs/${orgCode}`} className="text-gray-500 hover:text-gray-900 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">参加者名簿・ラベル管理</h1>
              <p className="text-xs text-gray-500">{org?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsLabelModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Tag className="w-4 h-4 mr-2 text-indigo-500" />
              ラベル設定
            </button>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              名簿に追加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 統計・概要 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-sm text-gray-500">登録人数</div>
            <div className="text-2xl font-bold text-gray-900">{participants.length} 人</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-sm text-gray-500">ラベル数</div>
            <div className="text-2xl font-bold text-gray-900">{labels.length} 種</div>
          </div>
        </div>

        {/* 名簿テーブル */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">参加者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AID-ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ラベル</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メモ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      まだ名簿に登録されている参加者がいません。
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{p.users.display_name}</div>
                        <div className="text-xs text-gray-500 capitalize">{p.users.user_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                        {p.users.aid_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {labels.map(label => {
                            const hasLabel = p.user_labels?.some((ul: any) => ul.label_id === label.id)
                            return (
                              <button
                                key={label.id}
                                onClick={() => toggleLabel(p.id, label.id, hasLabel)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border ${
                                  hasLabel 
                                    ? 'shadow-sm opacity-100' 
                                    : 'opacity-20 border-transparent bg-gray-200 text-gray-500 grayscale hover:opacity-50'
                                }`}
                                style={{ 
                                  backgroundColor: hasLabel ? label.color : undefined,
                                  color: hasLabel ? '#fff' : undefined,
                                  borderColor: hasLabel ? label.color : undefined
                                }}
                              >
                                {label.name}
                              </button>
                            )
                          })}
                          {labels.length === 0 && <span className="text-xs text-gray-400">ラベル未設定</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                        {p.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ユーザー追加モーダル */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">AID-IDで名簿に追加</h3>
              <button onClick={() => setIsAddUserModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="AID-XXXXXX"
                  value={searchAidId}
                  onChange={(e) => setSearchAidId(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSearchUser}
                  className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {addUserError && <p className="text-red-500 text-xs">{addUserError}</p>}

              {foundUser && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <div className="font-bold text-blue-900">{foundUser.display_name}</div>
                    <div className="text-xs text-blue-700 font-mono">{foundUser.aid_id}</div>
                  </div>
                  <button
                    onClick={handleAddParticipant}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                  >
                    追加する
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ラベル設定モーダル */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">ラベル設定</h3>
              <button onClick={() => setIsLabelModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              {/* 新規作成 */}
              <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">新しいラベルを作成</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ラベル名 (例: 高齢者)"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="w-10 h-10 border-0 p-0 rounded cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleCreateLabel}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> ラベルを追加
                </button>
              </div>

              {/* ラベル一覧 */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">作成済みのラベル</p>
                <div className="flex flex-wrap gap-2">
                  {labels.map(label => (
                    <div
                      key={label.id}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 shadow-sm"
                      style={{ backgroundColor: label.color + '10', borderColor: label.color, color: label.color }}
                    >
                      {label.name}
                      <button className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {labels.length === 0 && <p className="text-xs text-gray-400 py-4 italic">まだラベルがありません</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
