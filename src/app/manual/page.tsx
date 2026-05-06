'use client'

import { HelpCircle, ChevronRight, Layout, Calendar, Users, QrCode, ClipboardCheck, MessageSquare, AlertTriangle, BookOpen } from 'lucide-react'
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Aidex Event へようこそ！</h2>
          <p className="text-blue-100 mb-0 leading-relaxed">
            このアプリは、個人情報を一切登録せずにイベント運営を完結できるツールです。
            メールアドレスやパスワードは不要で、ニックネームだけで今すぐ始められます。
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            操作デモ動画（ログイン〜イベント作成）
          </h3>
          <div className="bg-white p-2 rounded-2xl shadow-md border overflow-hidden">
            <img 
              src="/admin_demo.webp" 
              alt="操作デモ" 
              className="w-full h-auto rounded-xl"
            />
          </div>
          <p className="mt-3 text-sm text-gray-500 text-center">※管理者がログインして団体を作り、イベントを企画するまでの流れです。</p>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">最初にお読みください</h3>
          </div>
          <div className="bg-white rounded-xl border border-orange-100 p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2">匿名ログインの注意点</h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              個人情報を守るため、アプリはブラウザの内部データ（localStorage）であなたを識別しています。
              そのため、以下の制限があります：
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <li className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-green-500 font-bold">✓</span>
                <span>IDと復旧コードをメモすれば、機種変更後もデータを引き継げます。</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-green-500 font-bold">✓</span>
                <span>別のパソコンやスマホからでもログインが可能です。</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            団体管理者（主催者）の使い方
          </h3>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 flex gap-4">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xl">1</div>
              <div>
                <h4 className="font-bold text-lg mb-2">団体を作成する</h4>
                <p className="text-gray-600 text-sm mb-3">
                  ホーム画面で「団体名」と「団体コード（URL用）」を入力して作成ボタンを押します。
                </p>
                <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-500 italic">
                  ※団体コードは「pta-2026」のように半角英数字で入力してください。
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 flex gap-4">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xl">2</div>
              <div>
                <h4 className="font-bold text-lg mb-2">イベントを作成する</h4>
                <p className="text-gray-600 text-sm mb-4">
                  作成した団体のパネルをクリックしてダッシュボードを開き、「+ 新しいイベントを作成」からイベントを企画します。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                    <Users className="w-4 h-4 text-blue-500" /> ボランティア募集設定
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                    <ClipboardCheck className="w-4 h-4 text-green-500" /> アンケート自動生成
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 flex gap-4">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xl">3</div>
              <div>
                <h4 className="font-bold text-lg mb-2">参加者名簿とラベリング</h4>
                <p className="text-gray-600 text-sm mb-4">
                  「参加者名簿」から、以前参加した人のAID-IDを登録できます。
                  「高齢者」「子ども会」などのラベルを付けて、対象を絞った通知が送れます。
                </p>
                <div className="flex items-center gap-2 text-sm text-indigo-700 font-bold">
                  <Tag className="w-5 h-5" /> ラベルによる一括通知が可能
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 flex gap-4">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xl">4</div>
              <div>
                <h4 className="font-bold text-lg mb-2">URLを共有・受付する</h4>
                <p className="text-gray-600 text-sm mb-4">
                  イベントダッシュボードからURLを共有しましょう。
                  当日はダッシュボードの「QR受付」機能を使って、来場者のQRコードを読み取ります。
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-700 font-bold">
                  <QrCode className="w-5 h-5" /> QRコードで非接触受付が可能
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              ボランティアの方
            </h3>
            <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-indigo-500 mt-0.5" />
                <p className="text-sm text-gray-600">送られてきた「ボランティア募集URL」から申し込みます。</p>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-indigo-500 mt-0.5" />
                <p className="text-sm text-gray-600">担当する役割（受付、誘導など）を選択してください。</p>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-indigo-500 mt-0.5" />
                <p className="text-sm text-gray-600">専用の掲示板で、当日までの連絡事項を確認できます。</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-green-600" />
              参加者の方
            </h3>
            <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">「参加申込URL」から、ニックネームだけで申し込めます。</p>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">発行されたQRコードを当日受付で見せてください。</p>
              </div>
              <div className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">イベント終了後、同じURLからアンケートに回答できます。</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">このマニュアルはいつでも右上の「マニュアル」ボタンから確認できます。</p>
          <Link href="/" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            アプリを使ってみる
          </Link>
        </div>
      </main>
    </div>
  )
}
