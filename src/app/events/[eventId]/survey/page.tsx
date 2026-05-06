'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, CheckCircle2, ClipboardList, Star } from 'lucide-react'
import Link from 'next/link'

export default function SurveyPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const { user } = useAuth()
  
  const [event, setEvent] = useState<any>(null)
  const [survey, setSurvey] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [memberInfo, setMemberInfo] = useState<any>(null)
  
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'initial' | 'success' | 'error' | 'already_answered'>('initial')

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const { data: eventData } = await supabase.from('events').select('title, has_survey').eq('id', eventId).single()
        setEvent(eventData)

        if (!eventData?.has_survey) {
          setLoading(false)
          return
        }

        const { data: surveyData } = await supabase
          .from('surveys')
          .select('*')
          .eq('event_id', eventId)
          .eq('target_type', 'participant')
          .single()

        if (surveyData) {
          setSurvey(surveyData)
          const { data: qData } = await supabase
            .from('survey_questions')
            .select('*')
            .eq('survey_id', surveyData.id)
            .order('sort_order', { ascending: true })
          
          if (qData) setQuestions(qData)
        }

        if (user && surveyData) {
          const { data: mData } = await supabase
            .from('event_members')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single()
            
          if (mData) {
            setMemberInfo(mData)
            // すでに回答済みかチェック
            const { data: responseData } = await supabase
              .from('survey_responses')
              .select('id')
              .eq('survey_id', surveyData.id)
              .eq('event_member_id', mData.id)
              .single()

            if (responseData) {
              setStatus('already_answered')
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurveyData()
  }, [eventId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !memberInfo || !survey) return

    // 必須チェック
    for (const q of questions) {
      if (q.required && (answers[q.id] === undefined || answers[q.id] === '')) {
        alert('未回答の必須項目があります。')
        return
      }
    }

    setIsSubmitting(true)
    try {
      // 1. responseの作成
      const { data: responseData, error: responseError } = await supabase
        .from('survey_responses')
        .insert([{
          survey_id: survey.id,
          event_member_id: memberInfo.id
        }])
        .select()
        .single()

      if (responseError) throw responseError

      // 2. answersの作成
      const answersToInsert = Object.keys(answers).map(qId => {
        const q = questions.find(question => question.id === qId)
        return {
          survey_response_id: responseData.id,
          question_id: qId,
          answer_text: q?.question_type === 'text' ? answers[qId] : String(answers[qId]),
          answer_value: q?.question_type !== 'text' ? { value: answers[qId] } : null
        }
      })

      if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase.from('survey_answers').insert(answersToInsert)
        if (answersError) throw answersError
      }

      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestionInput = (q: any) => {
    switch (q.question_type) {
      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setAnswers({ ...answers, [q.id]: num })}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                  answers[q.id] === num 
                    ? 'bg-amber-400 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )
      case 'yes_no':
        return (
          <div className="flex gap-4">
            <label className={`flex-1 py-3 border rounded-lg text-center cursor-pointer transition-colors ${answers[q.id] === 'yes' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white hover:bg-gray-50'}`}>
              <input type="radio" name={q.id} className="hidden" checked={answers[q.id] === 'yes'} onChange={() => setAnswers({ ...answers, [q.id]: 'yes' })} />
              はい
            </label>
            <label className={`flex-1 py-3 border rounded-lg text-center cursor-pointer transition-colors ${answers[q.id] === 'no' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white hover:bg-gray-50'}`}>
              <input type="radio" name={q.id} className="hidden" checked={answers[q.id] === 'no'} onChange={() => setAnswers({ ...answers, [q.id]: 'no' })} />
              いいえ
            </label>
          </div>
        )
      case 'text':
        return (
          <textarea
            value={answers[q.id] || ''}
            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
            placeholder="ご自由にお書きください"
          />
        )
      default:
        return null
    }
  }

  if (loading) return <div className="min-h-screen flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (!event || !event.has_survey || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div>
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">アンケートはありません</h1>
          <p className="text-gray-500 mb-6">このイベントではアンケートを実施していません。</p>
          <Link href="/" className="text-blue-600 hover:underline">ホームに戻る</Link>
        </div>
      </div>
    )
  }

  if (status === 'success' || status === 'already_answered') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">回答ありがとうございました</h2>
          <p className="text-gray-600 mb-8">
            {status === 'already_answered' ? '既にこのアンケートには回答済みです。' : 'アンケートの送信が完了しました。ご協力いただきありがとうございました。'}
          </p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors w-full">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-8 px-4 text-center">
        <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-90" />
        <h1 className="text-2xl font-bold mb-1">{survey.title}</h1>
        <p className="text-blue-100 text-sm">{event.title}</p>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {!user || !memberInfo ? (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center">
            <p className="text-amber-800 mb-4">アンケートに回答するには、イベントへの参加申込が必要です。</p>
            <Link href={`/events/${eventId}`} className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg font-medium">
              イベントページへ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <p className="text-gray-700">{survey.description}</p>
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <label className="font-bold text-gray-900 flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0">
                      Q{index + 1}
                    </span>
                    {q.question_text}
                    {q.required && <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">必須</span>}
                  </label>
                  {q.question_type === 'rating' && (
                    <div className="flex text-xs text-gray-400 mt-2 ml-8 justify-between max-w-[280px]">
                      <span>1: 良くない</span>
                      <span>5: 非常に良い</span>
                    </div>
                  )}
                </div>
                <div className="ml-8">
                  {renderQuestionInput(q)}
                </div>
              </div>
            ))}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : '回答を送信する'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
