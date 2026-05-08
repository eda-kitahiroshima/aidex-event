'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { ArrowLeft, Loader2, Star, MessageSquareText, Calendar, MapPin, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface EventInfo {
  title: string
  start_at: string
  end_at: string
  location: string | null
}

interface ReportData {
  event: EventInfo | null
  participantCount: number
  volunteerCount: number
  checkinCount: number
  surveyResponseCount: number
  averageRating: number | null
  ratingDistribution: Record<number, number>
  freeTexts: string[]
}

export default function EventReportPage({ params }: { params: Promise<{ orgCode: string; eventId: string }> }) {
  const { orgCode, eventId } = use(params)
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ReportData>({
    event: null,
    participantCount: 0,
    volunteerCount: 0,
    checkinCount: 0,
    surveyResponseCount: 0,
    averageRating: null,
    ratingDistribution: {},
    freeTexts: [],
  })

  useEffect(() => {
    if (!user) return
    const fetchReport = async () => {
      try {
        const { data: eventData } = await supabase
          .from('events')
          .select('title, start_at, end_at, location')
          .eq('id', eventId)
          .single()

        const [
          { count: pCount },
          { count: vCount },
          { count: cCount },
        ] = await Promise.all([
          supabase.from('event_members').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('member_type', 'participant').eq('status', 'joined'),
          supabase.from('event_members').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('member_type', 'volunteer').eq('status', 'joined'),
          supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('event_id', eventId),
        ])

        const { data: surveyData } = await supabase
          .from('surveys')
          .select('id')
          .eq('event_id', eventId)
          .single()

        let surveyResponseCount = 0
        let averageRating: number | null = null
        const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        const freeTexts: string[] = []

        if (surveyData) {
          const { count: rCount } = await supabase
            .from('survey_responses')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', surveyData.id)
          surveyResponseCount = rCount ?? 0

          const { data: ratingQs } = await supabase
            .from('survey_questions')
            .select('id')
            .eq('survey_id', surveyData.id)
            .eq('question_type', 'rating')

          if (ratingQs && ratingQs.length > 0) {
            const { data: ratingAnswers } = await supabase
              .from('survey_answers')
              .select('answer_text')
              .in('question_id', ratingQs.map(q => q.id))

            if (ratingAnswers && ratingAnswers.length > 0) {
              const vals = ratingAnswers
                .map(a => parseFloat(a.answer_text))
                .filter(v => !isNaN(v) && v >= 1 && v <= 5)
              if (vals.length > 0) {
                averageRating = vals.reduce((a, b) => a + b, 0) / vals.length
                vals.forEach(v => {
                  const key = Math.round(v) as 1 | 2 | 3 | 4 | 5
                  ratingDistribution[key] = (ratingDistribution[key] ?? 0) + 1
                })
              }
            }
          }

          const { data: textQs } = await supabase
            .from('survey_questions')
            .select('id')
            .eq('survey_id', surveyData.id)
            .eq('question_type', 'text')

          if (textQs && textQs.length > 0) {
            const { data: textAnswers } = await supabase
              .from('survey_answers')
              .select('answer_text')
              .in('question_id', textQs.map(q => q.id))
              .not('answer_text', 'is', null)

            if (textAnswers) {
              freeTexts.push(...textAnswers.map(a => a.answer_text).filter(Boolean))
            }
          }
        }

        setReport({
          event: eventData ?? null,
          participantCount: pCount ?? 0,
          volunteerCount: vCount ?? 0,
          checkinCount: cCount ?? 0,
          surveyResponseCount,
          averageRating,
          ratingDistribution,
          freeTexts,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [user, eventId])

  const totalApplicants = report.participantCount + report.volunteerCount
  const checkinRate = totalApplicants > 0
    ? Math.round((report.checkinCount / totalApplicants) * 100)
    : null

  const totalRatings = Object.values(report.ratingDistribution).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}`} className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              実績レポート
            </h1>
            {report.event && <p className="text-xs text-gray-500">{report.event.title}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* イベント情報 */}
        {report.event && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{report.event.title}</h2>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {new Date(report.event.start_at).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
                  })}

                  {new Date(report.event.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  {' 〜 '}
                  {new Date(report.event.end_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {report.event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{report.event.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 主要指標 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{report.participantCount}</div>
            <div className="text-xs text-gray-500 mt-1">参加申込</div>
          </div>
          <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-indigo-700">{report.volunteerCount}</div>
            <div className="text-xs text-indigo-600 mt-1">ボランティア</div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{report.checkinCount}</div>
            <div className="text-xs text-blue-600 mt-1">当日受付</div>
            {checkinRate !== null && (
              <div className="text-xs font-bold text-blue-800 mt-0.5">受付率 {checkinRate}%</div>
            )}
          </div>
          <div className="bg-purple-50 rounded-xl border border-purple-100 shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">{report.surveyResponseCount}</div>
            <div className="text-xs text-purple-600 mt-1">アンケート回答</div>
          </div>
        </div>

        {/* 満足度 */}
        {report.averageRating !== null && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              満足度スコア
            </h3>
            <div className="flex items-center gap-6 mb-5">
              <div>
                <span className="text-5xl font-bold text-yellow-500">{report.averageRating.toFixed(1)}</span>
                <span className="text-gray-400 ml-1 text-lg">/ 5.0</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      n <= Math.round(report.averageRating!) ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
            {totalRatings > 0 && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(score => {
                  const count = report.ratingDistribution[score] ?? 0
                  const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
                  return (
                    <div key={score} className="flex items-center gap-3 text-sm">
                      <span className="w-4 text-gray-600 font-bold text-right">{score}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-yellow-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-gray-500 text-xs text-right">{count}件</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 自由記述 */}
        {report.freeTexts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-indigo-500" />
              自由記述（{report.freeTexts.length}件）
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {report.freeTexts.map((text, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border-l-4 border-indigo-200 leading-relaxed">
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 事業報告用サマリー */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <h3 className="text-sm font-bold text-indigo-900 mb-3">事業報告用サマリー（コピー用）</h3>
          <pre className="text-sm text-indigo-800 whitespace-pre-wrap font-sans leading-relaxed">
{`■ イベント名：${report.event?.title ?? ''}
■ 開催日：${report.event ? new Date(report.event.start_at).toLocaleDateString('ja-JP') : ''}
■ 会場：${report.event?.location ?? ''}
■ 参加申込人数：${report.participantCount}人
■ ボランティア人数：${report.volunteerCount}人
■ 当日参加人数（受付）：${report.checkinCount}人${checkinRate !== null ? `（受付率${checkinRate}%）` : ''}
■ アンケート回答数：${report.surveyResponseCount}件${report.averageRating !== null ? `\n■ 満足度平均：${report.averageRating.toFixed(1)} / 5.0` : ''}`}
          </pre>
        </div>

      </main>
    </div>
  )
}
