'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { ArrowLeft, Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'

const eventSchema = z.object({
  title: z.string().min(1, 'イベント名は必須です').max(100),
  description: z.string().optional(),
  location: z.string().min(1, '会場は必須です'),
  start_at: z.string().min(1, '開始日時は必須です'),
  end_at: z.string().min(1, '終了日時は必須です'),
  capacity: z.number().min(0).optional(),
  volunteer_capacity: z.number().min(0).optional(),
  visibility: z.enum(['public', 'url_only', 'organization_only']),
  has_survey: z.boolean(),
  has_qr_checkin: z.boolean(),
})

type EventFormValues = z.infer<typeof eventSchema>

export default function CreateEventPage({ params }: { params: Promise<{ orgCode: string }> }) {
  const { orgCode } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      visibility: 'public',
      has_survey: true,
      has_qr_checkin: true,
      capacity: 0,
      volunteer_capacity: 0,
    },
  })

  // 団体IDの取得
  useEffect(() => {
    const fetchOrgId = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id')
        .eq('organization_code', orgCode)
        .single()
      if (data) {
        setOrgId(data.id)
      } else {
        router.push('/')
      }
    }
    fetchOrgId()
  }, [orgCode, router])

  const onSubmit = async (data: EventFormValues) => {
    if (!user || !orgId) return
    setIsSubmitting(true)
    setGlobalError('')

    try {
      // 1. イベント作成
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([{
          organization_id: orgId,
          title: data.title,
          description: data.description,
          location: data.location,
          start_at: new Date(data.start_at).toISOString(),
          end_at: new Date(data.end_at).toISOString(),
          capacity: data.capacity || null,
          volunteer_capacity: data.volunteer_capacity || null,
          visibility: data.visibility,
          has_survey: data.has_survey,
          has_qr_checkin: data.has_qr_checkin,
          created_by: user.id,
          status: 'published' // MVPなので最初から公開
        }])
        .select()
        .single()

      if (eventError) throw eventError

      // 2. イベント作成者自身をAdminとしてメンバーに追加
      await supabase.from('event_members').insert([{
        event_id: eventData.id,
        user_id: user.id,
        member_type: 'admin',
        status: 'joined'
      }])

      // 3. デフォルト掲示板の自動作成
      const defaultBoards = [
        {
          event_id: eventData.id,
          board_type: 'all_notice',
          title: '全体連絡',
          description: '参加者・ボランティア全員への連絡事項です。',
          visibility: 'all',
          post_permission: 'admin',
          reply_permission: 'none'
        },
        {
          event_id: eventData.id,
          board_type: 'staff',
          title: 'スタッフ全体連絡',
          description: 'ボランティアスタッフ向けの全体連絡です。',
          visibility: 'volunteer',
          post_permission: 'admin',
          reply_permission: 'volunteer'
        },
        {
          event_id: eventData.id,
          board_type: 'participant_notice',
          title: '参加者向けお知らせ',
          description: '参加者へのお知らせ事項です。',
          visibility: 'all',
          post_permission: 'admin',
          reply_permission: 'none'
        },
        {
          event_id: eventData.id,
          board_type: 'participant_qa',
          title: '参加者Q&A',
          description: '参加者からの質問と回答です。',
          visibility: 'all',
          post_permission: 'participant',
          reply_permission: 'admin'
        }
      ]

      const { error: boardsError } = await supabase.from('boards').insert(defaultBoards)
      if (boardsError) throw boardsError

      // 4. アンケートの自動作成 (has_survey が true の場合)
      if (data.has_survey) {
        const { data: surveyData, error: surveyError } = await supabase.from('surveys').insert([{
          event_id: eventData.id,
          target_type: 'participant',
          title: 'イベント参加後アンケート',
          description: '本日はご参加いただきありがとうございました。今後の参考のためアンケートにご協力ください。'
        }]).select().single()

        if (surveyError) throw surveyError

        const defaultQuestions = [
          {
            survey_id: surveyData.id,
            question_text: 'イベントは楽しかったですか？',
            question_type: 'rating',
            required: true,
            sort_order: 1
          },
          {
            survey_id: surveyData.id,
            question_text: '内容はわかりやすかったですか？',
            question_type: 'rating',
            required: true,
            sort_order: 2
          },
          {
            survey_id: surveyData.id,
            question_text: 'また参加したいですか？',
            question_type: 'yes_no',
            required: true,
            sort_order: 3
          },
          {
            survey_id: surveyData.id,
            question_text: '感想（自由記述）',
            question_type: 'text',
            required: false,
            sort_order: 4
          }
        ]

        await supabase.from('survey_questions').insert(defaultQuestions)
      }

      // 作成成功、イベント詳細（今回はダッシュボード）へリダイレクト
      router.push(`/admin/orgs/${orgCode}`)
      
    } catch (error: any) {
      console.error(error)
      setGlobalError(error.message || 'イベントの作成に失敗しました')
      setIsSubmitting(false)
    }
  }

  if (!orgId) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href={`/admin/orgs/${orgCode}`} className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            新しいイベントを作成
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {globalError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {globalError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">イベント名 <span className="text-red-500">*</span></label>
              <input
                {...register('title')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="例: 防災親子イベント"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="イベントの概要を入力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会場・場所 <span className="text-red-500">*</span></label>
              <input
                {...register('location')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="例: 〇〇小学校体育館"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日時 <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  {...register('start_at')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                {errors.start_at && <p className="text-red-500 text-sm mt-1">{errors.start_at.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日時 <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  {...register('end_at')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                {errors.end_at && <p className="text-red-500 text-sm mt-1">{errors.end_at.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参加者定員 (0で無制限)</label>
                <input
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ボランティア募集人数 (0で無制限)</label>
                <input
                  type="number"
                  {...register('volunteer_capacity', { valueAsNumber: true })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_qr_checkin"
                  {...register('has_qr_checkin')}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="has_qr_checkin" className="ml-2 text-sm text-gray-700">
                  当日会場でQR受付を行う
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_survey"
                  {...register('has_survey')}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="has_survey" className="ml-2 text-sm text-gray-700">
                  イベント終了後にアンケートを取る
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <Link
              href={`/admin/orgs/${orgCode}`}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium mr-4"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg flex items-center transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              イベントを作成
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
