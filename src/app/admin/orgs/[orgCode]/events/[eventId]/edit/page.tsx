'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { DateTimePicker } from '@/components/ui/DateTimePicker'

const eventSchema = z.object({
  title: z.string().min(1, 'イベント名は必須です').max(100),
  description: z.string().optional(),
  location: z.string().min(1, '会場は必須です'),
  start_at: z.string().min(1, '開始日時は必須です'),
  end_at: z.string().min(1, '終了日時は必須です'),
  capacity: z.number().min(0).optional(),
  volunteer_capacity: z.number().min(0).optional(),
  visibility: z.enum(['public', 'url_only', 'organization_only']),
  status: z.enum(['draft', 'published', 'closed', 'finished', 'cancelled']),
})

type EventFormValues = z.infer<typeof eventSchema>

const toLocalDatetime = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  published: '公開中',
  closed: '受付終了',
  finished: '終了',
  cancelled: '中止',
}

export default function EditEventPage({ params }: { params: Promise<{ orgCode: string; eventId: string }> }) {
  const { orgCode, eventId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [globalError, setGlobalError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      visibility: 'public',
      status: 'published',
      capacity: 0,
      volunteer_capacity: 0,
      start_at: '',
      end_at: '',
    },
  })

  const startAt = watch('start_at')
  const endAt = watch('end_at')

  useEffect(() => {
    if (!user) return
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error || !data) {
        router.push(`/admin/orgs/${orgCode}/events/${eventId}`)
        return
      }

      setValue('title', data.title ?? '')
      setValue('description', data.description ?? '')
      setValue('location', data.location ?? '')
      setValue('start_at', toLocalDatetime(data.start_at))
      setValue('end_at', toLocalDatetime(data.end_at))
      setValue('capacity', data.capacity ?? 0)
      setValue('volunteer_capacity', data.volunteer_capacity ?? 0)
      setValue('visibility', data.visibility ?? 'public')
      setValue('status', data.status ?? 'published')
      setLoadingEvent(false)
    }
    fetchEvent()
  }, [user, eventId, orgCode, router, setValue])

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true)
    setGlobalError('')
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: values.title,
          description: values.description || null,
          location: values.location,
          start_at: new Date(values.start_at).toISOString(),
          end_at: new Date(values.end_at).toISOString(),
          capacity: values.capacity || null,
          volunteer_capacity: values.volunteer_capacity || null,
          visibility: values.visibility,
          status: values.status,
        })
        .eq('id', eventId)

      if (error) throw error
      router.push(`/admin/orgs/${orgCode}/events/${eventId}`)
    } catch (err) {
      console.error(err)
      setGlobalError('更新に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}`} className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">イベント編集</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {globalError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{globalError}</div>
          )}

          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900">基本情報</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                イベント名 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 防災親子イベント2026"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="イベントの概要・内容・持ち物などを入力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会場 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('location')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 〇〇小学校体育館"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
          </div>

          {/* 開催日時 */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-blue-900">開催日時</h2>
            <DateTimePicker
              label="開始日時"
              required
              value={startAt}
              onChange={v => setValue('start_at', v, { shouldValidate: true })}
              error={errors.start_at?.message}
            />
            <DateTimePicker
              label="終了日時"
              required
              value={endAt}
              onChange={v => setValue('end_at', v, { shouldValidate: true })}
              error={errors.end_at?.message}
            />
          </div>

          {/* 定員・公開設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900">定員・公開設定</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参加者定員（0=無制限）</label>
                <input
                  type="number"
                  min={0}
                  {...register('capacity', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ボランティア定員（0=無制限）</label>
                <input
                  type="number"
                  min={0}
                  {...register('volunteer_capacity', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公開範囲</label>
              <select
                {...register('visibility')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">一般公開</option>
                <option value="url_only">URLを知っている人のみ</option>
                <option value="organization_only">団体メンバーのみ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">「受付終了」にすると新規申込を停止できます。</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/admin/orgs/${orgCode}/events/${eventId}`}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold text-center hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              保存する
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
