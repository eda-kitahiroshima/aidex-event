'use client'

import { HelpCircle, ChevronRight, Layout, Calendar, Users, QrCode, ClipboardCheck, MessageSquare, BookOpen, Tag, UserPlus, KeyRound, Shield, BarChart3, Bell } from 'lucide-react'
import Link from 'next/link'

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">操作マニュアル</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">

        {/* ヒーロー */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Aidex Event へようこそ！</h2>
          <p className="text-blue-100 leading-relaxed">
            地域イベント・ボランティア活動を、個人情報をできるだけ持たずに運営できるアプリです。
            イベント作成からボランティア募集、当日QR受付、アンケート集計まで一体管理できます。
          </p>
        </div>

        {/* 利用者の種類 */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            利用者の種類
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Layout className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">団体管理者</h4>
              <p className="text-sm text-gray-600">NPO・町内会・PTAなどのイベント主催者。団体作成・イベント管理・報告書作成ができます。</p>
            </div>
            <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">ボランティアスタッフ</h4>
              <p className="text-sm text-gray-600">受付・設営・誘導などを担当するスタッフ。役割を選んで申し込み、掲示板で連絡を受け取れます。</p>
            </div>
            <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <HelpCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">一般参加者</h4>
              <p className="text-sm text-gray-600">イベントに参加する方。申込・QR受付・アンケート回答ができます。</p>
            </div>
          </div>
        </section>

        {/* アカウント登録 */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-blue-600" />
            アカウント登録・ログイン
          </h3>
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm">1</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">「新規登録」タブを選ぶ</h4>
                <p className="text-sm text-gray-600">ログインID（3〜20文字の半角英数字・アンダースコア）とパスワード（6文字以上）を設定します。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm">2</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">利用区分を選ぶ</h4>
                <p className="text-sm text-gray-600">「団体管理者」「ボランティア」「参加者」から自分の役割を選択してください。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm">3</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">表示名（ニックネーム）を設定する</h4>
                <p className="text-sm text-gray-600">本名でなくニックネームでOKです。他の利用者に表示される名前です。</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
              <strong>ログインIDとパスワードを忘れずに保管してください。</strong><br />
              スマホを変えても同じIDとパスワードでログインできます。メールアドレスや本名は不要です。
            </div>
          </div>
        </section>

        {/* 管理者向け */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            団体管理者の使い方
          </h3>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: '団体を作成する',
                desc: 'ホーム画面で「団体名」と「団体コード（URL用）」を入力して作成します。団体コードは「pta-2026」のように半角英数字で入力してください。',
              },
              {
                step: 2,
                title: 'イベントを作成する',
                desc: '団体ダッシュボードから「イベントを作成する」をクリック。イベント名・日時・会場・定員を入力すると、掲示板とアンケートが自動で作成されます。',
              },
              {
                step: 3,
                title: 'ボランティア役割を設定する',
                desc: 'イベント管理画面で「受付係（2名）」「設営係（4名）」などの役割を追加できます。役割ごとの掲示板も自動生成されます。',
              },
              {
                step: 4,
                title: 'URLとQRコードを配布する',
                desc: 'イベント管理画面に参加者用・ボランティア用・受付用・アンケート用のQRコードが自動で発行されます。チラシやSNSに掲載してください。',
              },
              {
                step: 5,
                title: '当日・申込状況を確認する',
                desc: '「申込者一覧」で誰が申し込んだか・役割の充足状況を確認できます。「当日受付状況」では誰が来場したかをリアルタイムで確認できます。',
              },
              {
                step: 6,
                title: '実績レポートを確認する',
                desc: 'イベント終了後に「実績レポート」から参加人数・受付率・満足度・自由記述を一覧で確認できます。事業報告用のサマリーテキストも出力されます。',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-xl border p-5 flex gap-4 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-bold">{step}</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 管理機能一覧 */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <Users className="w-4 h-4 text-indigo-500" />, label: '申込者一覧・役割充足確認' },
              { icon: <Tag className="w-4 h-4 text-indigo-500" />, label: '参加者名簿・ラベル管理' },
              { icon: <Bell className="w-4 h-4 text-indigo-500" />, label: 'ラベル別一括通知' },
              { icon: <MessageSquare className="w-4 h-4 text-indigo-500" />, label: '役割別掲示板' },
              { icon: <ClipboardCheck className="w-4 h-4 text-indigo-500" />, label: 'アンケート作成・集計' },
              { icon: <BarChart3 className="w-4 h-4 text-indigo-500" />, label: '実績レポート出力' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg border shadow-sm">
                {icon} {label}
              </div>
            ))}
          </div>
        </section>

        {/* ボランティア・参加者向け */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              ボランティアの方
            </h3>
            <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
              {[
                'アカウントを作成し「ボランティア」を選択してログインします。',
                'ホーム画面の「ボランティア募集を探す」からイベントを検索するか、主催者から送られたURLを開きます。',
                '担当したい役割（受付、誘導など）を選んで申し込みます。',
                '掲示板で当日までの連絡事項・集合場所を確認できます。',
                'イベント終了後、ボランティアアンケートに回答できます。',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-green-600" />
              参加者の方
            </h3>
            <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
              {[
                'アカウントを作成し「参加者」を選択してログインします。表示名はニックネームでOKです。',
                'チラシ・SNS等に掲載されているQRコードか参加申込URLを開きます。',
                '「参加を申し込む」ボタンを押すだけで申込完了です。',
                '当日は会場に掲示されているQRコードを読み取り「受付する」を押してください。',
                'イベント終了後、アンケートURLからご感想をお寄せください。',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 参加者名簿 */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-600" />
            参加者名簿・ラベル機能（管理者向け）
          </h3>
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-3">
            <p className="text-sm text-gray-600">
              団体ダッシュボードの「名簿を確認する」から、参加者・ボランティアを管理できます。
            </p>
            <div className="flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">「名簿に追加」ボタンでログインIDを検索してメンバーを追加できます。</p>
            </div>
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">「高齢者」「子ども会」などのラベルを作成し、対象者に付与することで、ラベル別に絞った通知が送れます。</p>
            </div>
            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">タブで「参加者」「ボランティア」を切り替えて確認できます。</p>
            </div>
          </div>
        </section>

        {/* 個人情報について */}
        <section className="bg-green-50 border border-green-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-900 mb-3">個人情報の取り扱いについて</h3>
          <p className="text-sm text-green-800 leading-relaxed">
            このアプリは、本名・住所・電話番号・メールアドレスを登録しないポリシーで設計されています。
            登録するのは「ログインID」「表示名（ニックネーム）」「利用区分」のみです。
            地域団体でも安心して導入いただけます。
          </p>
        </section>

        {/* フッター */}
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">このマニュアルはいつでもヘッダーの「マニュアル」から確認できます。</p>
          <Link href="/" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            アプリを使ってみる
          </Link>
        </div>

      </main>
    </div>
  )
}
