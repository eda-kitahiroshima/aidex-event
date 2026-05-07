'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Copy, Loader2, Settings } from 'lucide-react'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  description: string | null
  organization_code: string
}

export default function OrgSettingsPage({ params }: { params: Promise<{ orgCode: string }> }) {
  const { orgCode } = use(params)
  const { user } = useAuth()
  const router = useRouter()

  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, description, organization_code, organization_members!inner(role)')
        .eq('organization_code', orgCode)
        .eq('organization_members.user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/')
        return
      }
      setOrg(data)
      setName(data.name)
      setDescription(data.description ?? '')
      setLoading(false)
    }
    fetch()
  }, [user, orgCode, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org || !name.trim()) return
    setSaving(true)
    setSaveError('')
    setSaved(false)

    const { error } = await supabase
      .from('organizations')
      .update({ name: name.trim(), description: description.trim() || null })
      .eq('id', org.id)

    setSaving(false)
    if (error) {
      setSaveError('保存に失敗しました: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const copyCode = () => {
    if (!org) return
    navigator.clipboard.writeText(org.organization_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }
  if (!org) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/admin/orgs/${orgCode}`} className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            団体設定
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 団体コード（読み取り専用） */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">団体コード</h2>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-xl text-gray-900 tracking-widest">{org.organization_code}</span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'コピー済' : 'コピー'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ※ 団体コードは変更できません。メンバーへの招待時などに使用します。
          </p>
        </div>

        {/* 団体情報編集 */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">基本情報の編集</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              団体名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 防災ボランティア団体"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28 resize-none"
              placeholder="団体の活動内容や目的を入力"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length} / 500</p>
          </div>

          {saveError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{saveError}</div>
          )}

          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> 保存しました
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                保存する
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
