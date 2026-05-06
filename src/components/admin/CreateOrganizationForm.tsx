'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { PlusCircle, Loader2 } from 'lucide-react'

type Props = {
  onCreated: () => void
}

export function CreateOrganizationForm({ onCreated }: Props) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [organizationCode, setOrganizationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!name.trim() || !organizationCode.trim()) {
      setError('団体名と団体コードは必須です')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // 1. 団体を作成
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name, description, organization_code: organizationCode }])
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '23505') {
          throw new Error('この団体コードは既に使用されています。')
        }
        throw orgError
      }

      // 2. 団体メンバーとして自分（管理者）を登録
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{ organization_id: orgData.id, user_id: user.id, role: 'owner' }])

      if (memberError) throw memberError

      // 完了
      setName('')
      setDescription('')
      setOrganizationCode('')
      onCreated()
    } catch (err: any) {
      setError(err.message || '団体の作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
        新しく団体を作成する
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            団体名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例: Aidex実行委員会、〇〇町内会"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            団体コード（URL用・英数字） <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={organizationCode}
            onChange={(e) => setOrganizationCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例: aidex-2026 (英数字とハイフンのみ)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            団体の説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
            placeholder="任意"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            作成する
          </button>
        </div>
      </form>
    </div>
  )
}
