'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, ArrowLeft, BarChart3, MessageSquareText } from 'lucide-react'
import Link from 'next/link'

interface Survey {
  id: string;
  title: string;
  target_type: string;
  // Add other fields
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  // Add other fields
}

interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  answer_value: string;
}

export default function SurveyResultsPage({ params }: { params: Promise<{ orgCode: string, eventId: string }> }) {
  const { orgCode, eventId } = use(params)
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responsesCount, setResponsesCount] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 対象のアンケートを取得
        const { data: surveyData } = await supabase
          .from('surveys')
          .select('*')
          .eq('event_id', eventId)
          .single()

        if (!surveyData) {
          setLoading(false)
          return
        }
        setSurvey(surveyData)

        // 質問を取得
        const { data: qData } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', surveyData.id)
          .order('sort_order', { ascending: true })
        
        if (qData) setQuestions(qData)

        // 回答数(レスポンス数)を取得
        const { count } = await supabase
          .from('survey_responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', surveyData.id)
        
        setResponsesCount(count || 0)

        // すべての回答内容を取得
        const { data: aData } = await supabase
          .from('survey_answers')
          .select('*, survey_responses(event_member_id)')
          .in('question_id', qData?.map(q => q.id) || [])

        if (aData) setAnswers(aData)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, user])

  // 質問ごとの集計ロジック
  const renderAnalysis = (question: Question) => {
    const questionAnswers = answers.filter(a => a.question_id === question.id)
    
    if (questionAnswers.length === 0) return <p className="text-gray-500 text-sm">まだ回答がありません</p>

    if (question.question_type === 'rating') {
      const sum = questionAnswers.reduce((acc, curr) => acc + (parseInt(curr.answer_text) || 0), 0)
      const avg = sum / questionAnswers.length
      
      const counts = [1, 2, 3, 4, 5].map(num => ({
        rating: num,
        count: questionAnswers.filter(a => parseInt(a.answer_text) === num).length
      }))

      return (
        <div>
          <div className="flex items-end mb-4">
            <span className="text-3xl font-bold text-gray-900 mr-2">{avg.toFixed(1)}</span>
            <span className="text-gray-500 mb-1">/ 5.0</span>
          </div>
          <div className="space-y-2">
            {counts.reverse().map(c => (
              <div key={c.rating} className="flex items-center text-sm">
                <span className="w-4 mr-2 text-gray-600">{c.rating}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 mr-4">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${responsesCount > 0 ? (c.count / responsesCount) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right text-gray-500">{c.count}件</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (question.question_type === 'yes_no') {
      const yesCount = questionAnswers.filter(a => a.answer_text === 'yes').length
      const noCount = questionAnswers.filter(a => a.answer_text === 'no').length
      
      return (
        <div className="flex gap-4">
          <div className="flex-1 bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
            <div className="text-sm text-blue-600 font-bold mb-1">はい</div>
            <div className="text-2xl font-bold text-blue-900">{yesCount} <span className="text-sm font-normal">件</span></div>
            <div className="text-xs text-blue-500 mt-1">{Math.round((yesCount / questionAnswers.length) * 100)}%</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div className="text-sm text-gray-600 font-bold mb-1">いいえ</div>
            <div className="text-2xl font-bold text-gray-900">{noCount} <span className="text-sm font-normal">件</span></div>
            <div className="text-xs text-gray-500 mt-1">{Math.round((noCount / questionAnswers.length) * 100)}%</div>
          </div>
        </div>
      )
    }

    if (question.question_type === 'text') {
      const validAnswers = questionAnswers.filter(a => a.answer_text?.trim())
      return (
        <div className="space-y-3 mt-2 max-h-60 overflow-y-auto pr-2">
          {validAnswers.length === 0 ? (
            <p className="text-gray-500 text-sm">テキストの回答はありません</p>
          ) : (
            validAnswers.map((a, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-100 flex items-start">
                <MessageSquareText className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="whitespace-pre-wrap">{a.answer_text}</p>
              </div>
            ))
          )}
        </div>
      )
    }

    return null
  }

  if (loading) return <div className="min-h-screen flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (!survey) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <p className="text-gray-500 mb-4">アンケートが設定されていません。</p>
        <Link href={`/admin/orgs/${orgCode}/events/${eventId}`} className="text-blue-600 hover:underline">
          戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/admin/orgs/${orgCode}/events/${eventId}`} className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            アンケート結果
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* サマリー */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">{survey.title}</h2>
            <p className="text-sm text-gray-500 mt-1">アンケート対象: 参加者</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-bold">回答数</div>
            <div className="text-3xl font-bold text-blue-600">{responsesCount} <span className="text-sm text-gray-500 font-normal">件</span></div>
          </div>
        </div>

        {/* 質問ごとの結果 */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-start">
                <span className="bg-gray-100 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {q.question_text}
              </h3>
              <div className="ml-8">
                {renderAnalysis(q)}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
