'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Loader2, ArrowLeft, Send, MessageCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type Reply = {
  id: string
  body: string
  created_at: string
  users: { display_name: string; user_type: string }
}

type Post = {
  id: string
  title: string
  body: string
  created_at: string
  users: { display_name: string; user_type: string }
  board_replies: Reply[]
}

export default function BoardDetailPage({ params }: { params: Promise<{ eventId: string, boardId: string }> }) {
  const { eventId, boardId } = use(params)
  const { user } = useAuth()
  const [board, setBoard] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [memberInfo, setMemberInfo] = useState<any>(null)

  const [newPostContent, setNewPostContent] = useState('')
  const [replyContent, setReplyContent] = useState<{ [postId: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchBoardData = async () => {
    if (!user) return
    try {
      const { data: mData } = await supabase.from('event_members').select('*').eq('event_id', eventId).eq('user_id', user.id).single()
      setMemberInfo(mData)

      const { data: bData } = await supabase.from('boards').select('*').eq('id', boardId).single()
      setBoard(bData)

      const { data: pData } = await supabase
        .from('board_posts')
        .select(`
          id, title, body, created_at,
          users!inner(display_name, user_type),
          board_replies(id, body, created_at, users!inner(display_name, user_type))
        `)
        .eq('board_id', boardId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
      
      if (pData) {
        // 返信も作成日時順に並び替え
        const sortedPosts = pData.map(post => ({
          ...post,
          board_replies: post.board_replies.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        })) as unknown as Post[]
        setPosts(sortedPosts)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoardData()
  }, [eventId, boardId, user])

  const canPost = () => {
    if (!memberInfo || !board) return false
    if (memberInfo.member_type === 'admin') return true
    if (board.post_permission === 'all') return true
    if (board.post_permission === 'volunteer' && memberInfo.member_type === 'volunteer') return true
    if (board.post_permission === 'participant' && memberInfo.member_type === 'participant') return true
    if (board.post_permission === 'role' && memberInfo.member_type === 'volunteer' && memberInfo.role_id === board.role_id) return true
    return false
  }

  const canReply = () => {
    if (!memberInfo || !board) return false
    if (board.reply_permission === 'none') return false
    if (memberInfo.member_type === 'admin') return true
    if (board.reply_permission === 'all') return true
    if (board.reply_permission === 'volunteer' && memberInfo.member_type === 'volunteer') return true
    if (board.reply_permission === 'participant' && memberInfo.member_type === 'participant') return true
    if (board.reply_permission === 'role' && memberInfo.member_type === 'volunteer' && memberInfo.role_id === board.role_id) return true
    return false
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() || !user) return
    setIsSubmitting(true)
    try {
      await supabase.from('board_posts').insert([{
        board_id: boardId,
        user_id: user.id,
        body: newPostContent
      }])
      setNewPostContent('')
      await fetchBoardData()
    } catch (err) {
      console.error(err)
      alert('投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateReply = async (e: React.FormEvent, postId: string) => {
    e.preventDefault()
    const content = replyContent[postId]
    if (!content?.trim() || !user) return
    setIsSubmitting(true)
    try {
      await supabase.from('board_replies').insert([{
        post_id: postId,
        user_id: user.id,
        body: content
      }])
      setReplyContent({ ...replyContent, [postId]: '' })
      await fetchBoardData()
    } catch (err) {
      console.error(err)
      alert('返信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  if (!board) return <div className="text-center py-20 text-gray-500">掲示板が見つかりません。</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/events/${eventId}/boards`} className="text-gray-500 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{board.title}</h1>
            <p className="text-xs text-gray-500">{board.description}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* 新規投稿フォーム */}
        {canPost() && (
          <form onSubmit={handleCreatePost} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="mb-2 flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded">
              <AlertCircle className="w-4 h-4 mr-1" />
              個人情報（電話番号、住所など）は書き込まないでください。
            </div>
            <textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder="連絡事項や質問を入力（500文字以内）"
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none mb-3"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newPostContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                投稿する
              </button>
            </div>
          </form>
        )}

        {/* 投稿一覧 */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
              まだ投稿がありません。
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* 親投稿 */}
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm mr-3">
                      {post.users.display_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">
                        {post.users.display_name} 
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{post.users.user_type}</span>
                      </div>
                      <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('ja-JP')}</div>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.body}</p>
                </div>

                {/* 返信一覧 */}
                {post.board_replies.length > 0 && (
                  <div className="bg-gray-50 p-4 sm:px-6 space-y-4">
                    {post.board_replies.map(reply => (
                      <div key={reply.id} className="flex">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs mr-3 flex-shrink-0 mt-1">
                          {reply.users.display_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline mb-1">
                            <span className="font-bold text-sm text-gray-900 mr-2">{reply.users.display_name}</span>
                            <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString('ja-JP')}</span>
                          </div>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 返信フォーム */}
                {canReply() && (
                  <div className="bg-gray-50 border-t border-gray-100 p-3 sm:px-6">
                    <form onSubmit={(e) => handleCreateReply(e, post.id)} className="flex gap-2">
                      <input
                        type="text"
                        value={replyContent[post.id] || ''}
                        onChange={e => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                        placeholder="返信を入力..."
                        maxLength={200}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !replyContent[post.id]?.trim()}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        返信
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}
