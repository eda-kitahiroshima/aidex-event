'use client'

import {
  BookOpen, ChevronRight, Layout, Calendar, Users, QrCode,
  ClipboardCheck, MessageSquare, Tag, UserPlus, KeyRound, Shield,
  BarChart3, Bell, Search, Settings, LogOut, UserCircle, CheckCircle2,
  Lock, Send, Star, ArrowRight, HelpCircle, Pencil, Info,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

function Section({ id, icon, title, color = 'blue', children }: {
  id: string
  icon: React.ReactNode
  title: string
  color?: 'blue' | 'indigo' | 'green' | 'purple' | 'amber'
  children: React.ReactNode
}) {
  const colorMap = {
    blue:   { icon: 'text-blue-600',   border: 'border-blue-200',   bg: 'bg-blue-50' },
    indigo: { icon: 'text-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50' },
    green:  { icon: 'text-green-600',  border: 'border-green-200',  bg: 'bg-green-50' },
    purple: { icon: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50' },
    amber:  { icon: 'text-amber-600',  border: 'border-amber-200',  bg: 'bg-amber-50' },
  }
  const c = colorMap[color]
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className={`text-xl font-bold text-gray-900 mb-5 flex items-center gap-2 pb-3 border-b ${c.border}`}>
        <span className={c.icon}>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm mt-0.5">{n}</div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
      <span>{children}</span>
    </div>
  )
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
      <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
      <span>{children}</span>
    </div>
  )
}

const TOC = [
  { id: 'overview',       label: 'アプリ概要' },
  { id: 'user-types',     label: '利用者の種類' },
  { id: 'auth',           label: 'アカウント登録・ログイン' },
  { id: 'admin',          label: '団体管理者の使い方' },
  { id: 'volunteer',      label: 'ボランティアの使い方' },
  { id: 'participant',    label: '参加者の使い方' },
  { id: 'boards',         label: '掲示板の使い方' },
  { id: 'checkin',        label: 'QR受付の使い方' },
  { id: 'survey',         label: 'アンケートの使い方' },
  { id: 'notifications',  label: 'お知らせ（通知）' },
  { id: 'account',        label: 'アカウント設定' },
  { id: 'privacy',        label: '個人情報の取り扱い' },
]

export default function ManualPage() {
  const [tocOpen, setTocOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">操作マニュアル</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTocOpen(v => !v)}
              className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors md:hidden"
            >
              目次
            </button>
            <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
              ホームに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8">

        {/* サイドバー目次 (md以上) */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-20 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">目次</p>
            <nav className="space-y-1">
              {TOC.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded px-2 py-1 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* モバイル目次 */}
        {tocOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setTocOpen(false)}>
            <div className="bg-white w-64 h-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">目次</p>
              <nav className="space-y-2">
                {TOC.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setTocOpen(false)}
                    className="block text-sm text-gray-700 hover:text-blue-600 py-1"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* 本文 */}
        <main className="flex-1 min-w-0 space-y-14">

          {/* ヒーロー */}
          <div id="overview" className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg scroll-mt-20">
            <h2 className="text-2xl font-bold mb-3">Aidex Event とは？</h2>
            <p className="text-blue-100 leading-relaxed mb-5">
              地域イベント・ボランティア活動を、個人情報をできるだけ持たずに運営できる管理アプリです。
              NPO・町内会・PTA などの団体が、イベント作成からボランティア募集・当日QR受付・アンケート集計・実績レポートまでを一体管理できます。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: <Calendar className="w-5 h-5" />, text: 'イベント作成・管理' },
                { icon: <Users className="w-5 h-5" />,   text: 'ボランティア役割管理' },
                { icon: <QrCode className="w-5 h-5" />,  text: 'QRコード受付' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2 text-sm font-medium">
                  {icon} {text}
                </div>
              ))}
            </div>
          </div>

          {/* 利用者の種類 */}
          <Section id="user-types" icon={<Shield className="w-6 h-6" />} title="利用者の種類" color="blue">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Layout className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">団体管理者</h3>
                <p className="text-sm text-gray-600 leading-relaxed">NPO・町内会・PTAなどの主催者。団体作成・イベント管理・ボランティア役割設定・参加者名簿管理・レポート作成ができます。</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium">
                  <ArrowRight className="w-3 h-3" /> 登録時「団体管理者」を選択
                </div>
              </div>
              <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">ボランティアスタッフ</h3>
                <p className="text-sm text-gray-600 leading-relaxed">受付・設営・誘導などを担当するスタッフ。役割を選んで申し込み、掲示板で当日連絡を受け取ります。</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium">
                  <ArrowRight className="w-3 h-3" /> 登録時「ボランティア」を選択
                </div>
              </div>
              <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <HelpCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">一般参加者</h3>
                <p className="text-sm text-gray-600 leading-relaxed">イベントに参加する方。申込・当日QR受付・アンケート回答・掲示板の閲覧ができます。</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
                  <ArrowRight className="w-3 h-3" /> 登録時「参加者」を選択
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Tip>利用区分は登録後に変更できません。複数の役割がある場合は用途別にアカウントを作成してください。</Tip>
            </div>
          </Section>

          {/* アカウント登録・ログイン */}
          <Section id="auth" icon={<KeyRound className="w-6 h-6" />} title="アカウント登録・ログイン" color="blue">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-gray-800 text-base">新規登録の手順</h3>
              <Step n={1} title="「新規登録」タブを開く">
                トップページのログインフォームで <strong>「新規登録」</strong> タブを選択します。
              </Step>
              <Step n={2} title="ログインIDとパスワードを設定する">
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>ログインID: <strong>半角英数字・アンダースコア（_）のみ、3〜20文字</strong>（例: yamada_taro）</li>
                  <li>パスワード: <strong>6文字以上</strong>（英字・数字の組み合わせ推奨）</li>
                  <li>パスワード確認欄に同じパスワードを再入力します</li>
                </ul>
              </Step>
              <Step n={3} title="表示名（ニックネーム）を入力する">
                掲示板やお知らせで他の人に表示される名前です。本名でなくニックネームでかまいません。省略するとログインIDが使用されます。
              </Step>
              <Step n={4} title="利用区分を選ぶ">
                「参加者」「ボランティア」「団体管理者」の中から自分の役割を選択し、<strong>「アカウントを作成する」</strong> を押します。
              </Step>
              <Warn>
                <strong>ログインIDとパスワードは必ずメモに保管してください。</strong><br />
                本アプリはメールアドレスを使用しないため、パスワードを紛失した場合に復元する手段がありません。
                スマホを機種変更しても同じID・パスワードでログインできます。
              </Warn>

              <hr className="border-gray-100" />
              <h3 className="font-bold text-gray-800 text-base">ログインの手順</h3>
              <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
                <p>トップページの <strong>「ログイン」</strong> タブで、登録済みのログインIDとパスワードを入力して <strong>「ログイン」</strong> を押します。</p>
                <p>ログイン状態はブラウザに保存されます。同じブラウザ・端末を使う限り次回以降は自動ログインされます。</p>
              </div>
            </div>
          </Section>

          {/* 団体管理者 */}
          <Section id="admin" icon={<Layout className="w-6 h-6" />} title="団体管理者の使い方" color="blue">

            {/* 団体作成 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-5 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                団体を作成する
              </h3>
              <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
                <p>ログイン後のホーム画面で <strong>「団体名」</strong> と <strong>「団体コード（URL用）」</strong> を入力して作成します。</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>団体コードは半角英数字・ハイフンのみ（例: <code className="bg-gray-100 px-1 rounded">pta-2026</code>）</li>
                  <li>URLの一部になるため他の団体と重複しない文字列にしてください</li>
                </ul>
                <p>作成すると団体ダッシュボード（<code className="bg-gray-100 px-1 rounded text-xs">/admin/orgs/[団体コード]</code>）に移動します。</p>
              </div>
            </div>

            {/* イベント作成 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                イベントを作成する
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                <p>団体ダッシュボードの <strong>「イベントを作成する」</strong> をクリックし、以下の項目を入力します。</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left font-medium text-gray-600 w-36">項目</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">説明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['イベント名 *', 'イベントのタイトル（100文字以内）'],
                      ['説明文', 'イベント内容・持ち物・注意事項など'],
                      ['会場・場所 *', '会場名や住所（参加者に表示されます）'],
                      ['開始日時 *', '年月日・時分をカレンダーから選択'],
                      ['終了日時 *', '年月日・時分をカレンダーから選択'],
                      ['参加者定員', '0または空白で無制限'],
                      ['ボランティア募集人数', '0または空白で無制限'],
                      ['当日QR受付', 'チェックで会場QR受付機能を有効化'],
                      ['アンケート', 'チェックで参加後アンケートを自動作成'],
                    ].map(([item, desc]) => (
                      <tr key={item}>
                        <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{item}</td>
                        <td className="px-4 py-2.5 text-gray-600">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Tip>イベント作成時に「全体連絡」「スタッフ連絡」などの掲示板とアンケート（有効時）が自動で作成されます。</Tip>
            </div>

            {/* 役割設定 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
                ボランティア役割を設定する
              </h3>
              <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
                <p>イベント管理画面の <strong>「ボランティア役割設定」</strong> セクションで役割を追加できます。</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>役割名（例: 受付係）と必要人数を入力して「追加」ボタンを押す</li>
                  <li>役割を追加すると、その役割専用の掲示板が自動生成されます</li>
                  <li>人数欄を空白にすると無制限（定員なし）になります</li>
                  <li>役割は削除ボタンから削除できます（関連掲示板も同時削除）</li>
                </ul>
              </div>
            </div>

            {/* URL・QR配布 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">4</span>
                URLとQRコードを配布する
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed mb-3">
                イベント管理画面の <strong>「募集URL・QRコード」</strong> セクションに4種類のQRコードが表示されます。
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: '参加者募集用',       desc: 'チラシ・SNSに掲載。参加申込ページへのリンク',          color: 'border-blue-200 bg-blue-50' },
                  { label: 'ボランティア募集用',  desc: 'ボランティア向けに配布。役割選択・申込ページへのリンク', color: 'border-indigo-200 bg-indigo-50' },
                  { label: '当日会場受付QR',      desc: '会場入口に掲示。来場者が自分でスキャンして受付',       color: 'border-green-200 bg-green-50' },
                  { label: 'アンケートQR',        desc: 'イベント終了後に掲示。参加者がアンケートに回答',       color: 'border-purple-200 bg-purple-50' },
                ].map(({ label, desc, color }) => (
                  <div key={label} className={`rounded-lg border p-3 ${color}`}>
                    <div className="font-bold text-gray-800 text-sm mb-1">{label}</div>
                    <div className="text-xs text-gray-600">{desc}</div>
                  </div>
                ))}
              </div>
              <Tip>URLの横にある入力欄をクリックするとテキスト全選択になります。コピー後にチラシやLINEに貼り付けてください。</Tip>
            </div>

            {/* 申込・受付状況確認 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">5</span>
                申込状況・当日受付を確認する
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-gray-800 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> 申込者一覧</div>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>「参加者申込」カードをクリック</li>
                    <li>参加者タブ・ボランティアタブで切替</li>
                    <li>役割別の充足状況をプログレスバーで確認</li>
                    <li>各ユーザーの申込日・受付済み状況を表示</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-gray-800 text-sm flex items-center gap-2"><QrCode className="w-4 h-4 text-green-600" /> 当日受付状況</div>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>「当日受付」カードをクリック</li>
                    <li>受付した参加者・ボランティアを時刻順に表示</li>
                    <li>「更新」ボタンで最新データを取得</li>
                    <li>リアルタイムで来場者数を把握</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* イベント編集 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">6</span>
                イベント情報を編集する
              </h3>
              <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
                <p>イベント管理画面ヘッダーの <strong>「編集」</strong> ボタンから、イベント名・日時・会場・ステータス等を変更できます。</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    ['公開中', '参加者に公開（通常状態）'],
                    ['受付終了', '新規申込を停止（掲示板は使用可能）'],
                    ['終了', 'イベント終了（通常は自動移行）'],
                    ['下書き', '非公開のまま準備中'],
                    ['中止', 'イベントを中止'],
                  ].map(([status, desc]) => (
                    <div key={status} className="bg-gray-50 rounded p-2 text-xs">
                      <div className="font-bold text-gray-800">{status}</div>
                      <div className="text-gray-500">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 通知送信 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">7</span>
                参加者へ通知を送る
              </h3>
              <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
                <p>イベント管理画面の <strong>「参加者へのイベント案内通知」</strong> セクションで一括通知を送れます。</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>「送信対象（ラベル）」で「名簿の全員」または特定のラベルを選択</li>
                  <li>「通知タイトル」「メッセージ本文」を入力</li>
                  <li>「一括通知を送信する」ボタンを押す</li>
                </ol>
                <p>受信した通知はユーザーのホーム画面のベルアイコン（お知らせ）から確認できます。</p>
              </div>
            </div>

            {/* アンケート結果・実績レポート */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3 mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">8</span>
                アンケート結果と実績レポートを確認する
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-gray-800 text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-purple-600" /> アンケート結果</div>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>「アンケート結果」カードをクリック</li>
                    <li>評価（1〜5点）の平均・分布を表示</li>
                    <li>はい/いいえの回答割合を表示</li>
                    <li>自由記述の全回答を閲覧</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-gray-800 text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-600" /> 実績レポート</div>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>ヘッダーの「実績レポート」ボタンをクリック</li>
                    <li>参加申込・ボランティア・受付数・受付率を表示</li>
                    <li>満足度スコアと分布グラフ</li>
                    <li>事業報告用サマリーをコピーして利用</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 参加者名簿 */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-700 text-xs font-bold flex items-center justify-center">9</span>
                参加者名簿とラベル管理
              </h3>
              <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
                <p>団体ダッシュボードの <strong>「名簿を確認する」</strong> から管理できます。</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <UserPlus className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div><strong className="text-gray-800">メンバーの追加：</strong>「名簿に追加」ボタン → ログインIDを入力 → ユーザーを検索して「追加する」</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div><strong className="text-gray-800">ラベルの作成：</strong>「ラベル設定」ボタン → ラベル名とカラーを入力 → 「ラベルを追加」（例: 高齢者・子ども会・要配慮）</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div><strong className="text-gray-800">ラベルの付与：</strong>名簿のラベル欄にあるボタンをクリックしてON/OFF切替。付与したラベルを使って通知の送信対象を絞り込めます</div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ボランティア */}
          <Section id="volunteer" icon={<Users className="w-6 h-6" />} title="ボランティアの使い方" color="indigo">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              {[
                {
                  title: 'アカウントを作成する',
                  body: '新規登録画面で「ボランティア」を選択してアカウントを作成します。',
                },
                {
                  title: 'イベントに申し込む',
                  body: '①ホーム画面の「ボランティア募集を探す」から検索する、または ②主催者から送られたURLを開く、のいずれかでボランティア募集ページに移動します。希望の役割（受付係・設営係など）を選んで「スタッフとして登録する」を押すと申込完了です。',
                },
                {
                  title: '掲示板で連絡を確認する',
                  body: 'ホーム画面の担当イベントカードにある「掲示板」ボタンから閲覧できます。「全体連絡」「スタッフ全体連絡」「役割専用掲示板」など複数の掲示板が表示されます。管理者からの投稿に返信することもできます。',
                },
                {
                  title: '当日にQR受付をする',
                  body: 'ホーム画面の「当日受付」ボタンを押すか、会場入口のQRコードをスキャンして受付ページを開き、「受付する」ボタンを押します（要ログイン）。受付完了の画面が表示されれば OK です。',
                },
                {
                  title: 'アンケートに回答する',
                  body: 'イベント終了後、ホーム画面の「アンケート」ボタン、または主催者が掲示するアンケートQRコードからアンケートに回答できます。',
                },
              ].map(({ title, body }, i) => (
                <div key={title} className="flex gap-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-sm">{i + 1}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 参加者 */}
          <Section id="participant" icon={<HelpCircle className="w-6 h-6" />} title="参加者の使い方" color="green">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              {[
                {
                  title: 'アカウントを作成する',
                  body: '新規登録画面で「参加者」を選択してアカウントを作成します。表示名はニックネームで OK です。',
                },
                {
                  title: 'イベントを探して申し込む',
                  body: '①ホーム画面の「イベントを探す」ボタンから検索する、または ②チラシ・SNS等に掲載されているURLを開く、のいずれかで参加申込ページに移動します。「参加を申し込む」ボタンを押すだけで申込完了です。',
                },
                {
                  title: '掲示板でお知らせを確認する',
                  body: 'ホーム画面の参加イベントカードにある「掲示板」ボタンから閲覧できます。主催者からのお知らせや Q&A が確認できます。',
                },
                {
                  title: '当日にQR受付をする',
                  body: '会場入口に掲示されているQRコードをスキャンして受付ページを開き、「受付する」ボタンを押します。または参加申込完了画面に表示された QR コードを受付スタッフに提示します。',
                },
                {
                  title: 'アンケートに回答する',
                  body: 'イベント終了後、ホーム画面の「アンケート」ボタン、または主催者が配布するアンケート URL や QR コードから回答できます。回答は1回限りで、送信後の変更はできません。',
                },
              ].map(({ title, body }, i) => (
                <div key={title} className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-700 font-bold text-sm">{i + 1}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 掲示板 */}
          <Section id="boards" icon={<MessageSquare className="w-6 h-6" />} title="掲示板の使い方" color="blue">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-5">
              <div className="text-sm text-gray-600 leading-relaxed">
                掲示板はイベントごとに複数作成されます。閲覧・投稿できる掲示板は <strong>利用者の区分と役割</strong> によって異なります。
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">掲示板の種類</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">閲覧できる人</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">投稿できる人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['全体連絡',       '全員（未ログインも可）',     '管理者のみ'],
                      ['参加者向けお知らせ', '全員',              '管理者のみ'],
                      ['参加者Q&A',      '全員',                '参加者（質問）/ 管理者（返信）'],
                      ['スタッフ全体連絡', 'ボランティア全員',         '管理者（返信はスタッフ可）'],
                      ['役割専用掲示板', '担当役割のスタッフのみ',     '管理者（返信は役割スタッフ可）'],
                    ].map(([kind, view, post]) => (
                      <tr key={kind}>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{kind}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">{view}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">{post}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <h4 className="font-bold text-gray-800">投稿・返信の方法</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>掲示板一覧から投稿したい掲示板を選んで開きます</li>
                  <li>テキストエリアに500文字以内で内容を入力して「投稿する」を押します</li>
                  <li>既存の投稿への返信は返信フォームから200文字以内で入力できます</li>
                  <li>投稿後は即座に全メンバーに反映されます</li>
                </ul>
                <Warn>掲示板には個人情報（電話番号・住所・氏名など）は書き込まないでください。</Warn>
              </div>
            </div>
          </Section>

          {/* QR受付 */}
          <Section id="checkin" icon={<QrCode className="w-6 h-6" />} title="QR受付の使い方" color="green">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><Users className="w-4 h-4 text-green-600" /> 来場者（参加者・ボランティア）</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>事前にアカウントでログインしておく</li>
                    <li>会場入口のQRコードをスマートフォンで読み取る</li>
                    <li>受付ページが開いたら <strong>「受付する」</strong> ボタンを押す</li>
                    <li>「受付完了しました」と表示されれば OK</li>
                  </ol>
                  <Tip>参加申込完了ページにも個人用QRコードが表示されます。スクリーンショットを保存しておくと便利です。</Tip>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><Layout className="w-4 h-4 text-blue-600" /> 管理者（当日受付確認）</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>イベント管理画面の <strong>「当日受付」</strong> カードをクリック</li>
                    <li>受付済みの参加者・ボランティアが時刻順に表示される</li>
                    <li>「更新」ボタンで最新データを随時確認</li>
                    <li>参加者別・ボランティア別の人数集計が上部に表示</li>
                  </ol>
                </div>
              </div>
              <Warn>QR受付機能はイベント作成時に「当日会場でQR受付を行う」をチェックした場合のみ有効です。後から変更する場合はイベント編集画面をご利用ください。</Warn>
            </div>
          </Section>

          {/* アンケート */}
          <Section id="survey" icon={<ClipboardCheck className="w-6 h-6" />} title="アンケートの使い方" color="purple">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-purple-600" /> 参加者・ボランティア</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>イベント終了後に主催者が掲示するQRコードを読み取るか、ホーム画面の「アンケート」ボタンを押す</li>
                    <li>各質問に回答する（評価 1〜5・はい/いいえ・自由記述）</li>
                    <li>「回答を送信する」ボタンを押して完了</li>
                  </ol>
                  <Tip>回答は1回のみです。送信後の変更・取消はできません。必須項目（赤の「必須」ラベル）は必ず回答してください。</Tip>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-600" /> 管理者（結果確認）</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">イベント管理画面の「アンケート結果」カードから確認できます。</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> 評価（1〜5点）の平均スコアと分布</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> はい/いいえの回答件数・割合</div>
                      <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-500" /> 自由記述の全回答一覧</div>
                    </div>
                    <p className="text-sm text-gray-600">実績レポートでは満足度の平均スコアも表示されます。</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 通知 */}
          <Section id="notifications" icon={<Bell className="w-6 h-6" />} title="お知らせ（通知）" color="amber">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
                <p>管理者が一括通知を送ると、対象ユーザーのホーム画面にベルアイコンが表示されます。</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" /> 通知の確認方法</h4>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      <li>ホーム画面ヘッダーのベルアイコンをクリック</li>
                      <li>未読は青丸バッジで件数表示</li>
                      <li>「お知らせ」ページを開くと全件一覧表示</li>
                      <li>ページを開いた時点で既読になる</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Send className="w-4 h-4 text-red-500" /> 管理者が通知を送る方法</h4>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      <li>イベント管理画面の「参加者へのイベント案内通知」</li>
                      <li>対象: 名簿全員またはラベル別に絞り込み</li>
                      <li>タイトルと本文を入力して「一括通知を送信する」</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* アカウント設定 */}
          <Section id="account" icon={<UserCircle className="w-6 h-6" />} title="アカウント設定" color="blue">
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              <p className="text-sm text-gray-600">ホーム画面ヘッダーの <strong>表示名ボタン</strong>（丸いアイコン）をクリックするとアカウント情報ページに移動します。</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <Pencil className="w-4 h-4 text-blue-500" />, title: '表示名の変更', desc: '「変更」ボタンから新しいニックネームを入力して保存できます。' },
                  { icon: <Lock className="w-4 h-4 text-gray-500" />,   title: 'ログインID・区分', desc: '変更できません。確認のみ可能です。' },
                  { icon: <LogOut className="w-4 h-4 text-red-500" />,  title: 'ログアウト', desc: '「ログアウト」ボタンでセッションを終了します。' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="bg-gray-50 rounded-lg p-4 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">{icon} {title}</div>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
              <Warn>パスワードの変更・再設定機能は現バージョンでは提供していません。パスワードは登録時に必ず安全な場所に保管してください。</Warn>
            </div>
          </Section>

          {/* 個人情報 */}
          <Section id="privacy" icon={<Shield className="w-6 h-6" />} title="個人情報の取り扱い" color="green">
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 space-y-3">
              <p className="text-sm text-green-800 leading-relaxed">
                Aidex Event は、<strong>本名・住所・電話番号・メールアドレスを収集しない</strong> ポリシーで設計されています。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-sm space-y-1 border border-green-100">
                  <div className="font-bold text-green-800">収集する情報</div>
                  <ul className="text-green-700 space-y-0.5 text-xs list-disc list-inside">
                    <li>ログインID（任意の文字列）</li>
                    <li>パスワードのハッシュ値（不可逆）</li>
                    <li>表示名（ニックネーム）</li>
                    <li>利用区分（管理者・ボランティア・参加者）</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-3 text-sm space-y-1 border border-green-100">
                  <div className="font-bold text-green-800">収集しない情報</div>
                  <ul className="text-green-700 space-y-0.5 text-xs list-disc list-inside">
                    <li>本名・氏名</li>
                    <li>住所・電話番号</li>
                    <li>メールアドレス</li>
                    <li>生年月日・性別</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-green-700">地域団体・NPO・ボランティア組織でも安心して導入いただけます。</p>
            </div>
          </Section>

          {/* フッター */}
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm mb-5">このマニュアルはホーム画面のヘッダーにある「マニュアル」リンクからいつでも確認できます。</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white font-bold py-3 px-10 rounded-xl shadow-md hover:bg-blue-700 transition-colors"
            >
              アプリを使ってみる
            </Link>
          </div>

        </main>
      </div>
    </div>
  )
}
