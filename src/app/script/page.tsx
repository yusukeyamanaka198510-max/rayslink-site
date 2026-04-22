'use client'

import { useEffect, useState } from 'react'
import { supabase, TimetableItem } from '@/lib/supabase'

const SCRIPT_TEMPLATES: Record<string, string> = {
  'オープニング': `皆様、本日はお集まりいただきありがとうございます。
ただいまより、○○様・△△様の結婚披露パーティーを始めさせていただきます。
司会を務めます□□と申します。どうぞよろしくお願いいたします。`,

  '入場': `それではまず、本日の主役のお二人にご入場いただきましょう。
皆様、大きな拍手でお迎えください！`,

  '乾杯': `続きまして、乾杯のご発声をいただきたいと思います。
○○様、よろしくお願いいたします。
皆様、グラスをお持ちください。
　乾杯！`,

  '食事': `ここからは、お食事とともにゆっくりとお楽しみください。
ご歓談の時間となります。`,

  'スピーチ': `続きまして、ご来賓の方からお祝いのスピーチをいただきます。
○○様、よろしくお願いいたします。`,

  '余興': `続きまして、余興のお時間です。
皆様、どうぞお楽しみください。`,

  'ゲーム': `続きまして、皆さんで楽しめるゲームのお時間です。
ぜひご参加ください！`,

  '演出': `続きまして、特別な演出をご覧いただきます。`,

  'ケーキカット': `続きまして、ウェディングケーキのカットです。
お二人、正面にお進みください。
それでは、お二人お願いいたします！`,

  '花束贈呈': `続きまして、ご両親への花束贈呈です。
感謝の気持ちを込めて、どうぞ。`,

  '閉会': `以上をもちまして、○○様・△△様の結婚披露パーティーを終了させていただきます。
本日はご来場いただき、誠にありがとうございました。
お二人の末永い幸せを心よりお祈り申し上げます。`,
}

function generateScript(item: TimetableItem): string {
  const content = item.content.toLowerCase()
  for (const [key, template] of Object.entries(SCRIPT_TEMPLATES)) {
    if (content.includes(key.toLowerCase()) || key.toLowerCase().includes(content)) {
      return template
    }
  }
  // デフォルトスクリプト
  return `続きまして、「${item.content}」のお時間です。
${item.notes ? `${item.notes}\n` : ''}（司会者メモ: ここに詳細を記入してください）`
}

export default function ScriptPage() {
  const [items, setItems] = useState<TimetableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [scripts, setScripts] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'read'>('edit')

  const fetchItems = async () => {
    const { data } = await supabase.from('timetable').select('*').order('sort_order').order('start_time')
    const items = data || []
    setItems(items)
    setScripts(prev => {
      const updated = { ...prev }
      items.forEach(item => {
        if (!updated[item.id]) {
          updated[item.id] = generateScript(item)
        }
      })
      return updated
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
    const ch = supabase.channel('script-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, fetchItems)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const regenerateAll = () => {
    const newScripts: Record<string, string> = {}
    items.forEach(item => {
      newScripts[item.id] = generateScript(item)
    })
    setScripts(newScripts)
  }

  const copyAll = () => {
    const full = items.map(item => {
      const time = item.end_time ? `${item.start_time}〜${item.end_time}` : item.start_time
      return `【${time} ${item.content}】\n${scripts[item.id] || ''}`
    }).join('\n\n' + '─'.repeat(40) + '\n\n')
    navigator.clipboard.writeText(full).then(() => alert('台本をクリップボードにコピーしました'))
  }

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🎤 台本</h1>
        <div className="flex gap-2">
          <button onClick={regenerateAll} className="btn-secondary text-sm py-2 px-3">
            🔄 再生成
          </button>
          <button onClick={copyAll} className="btn-primary text-sm py-2 px-3">
            📋 全コピー
          </button>
        </div>
      </div>

      {/* 表示モード切替 */}
      <div className="flex gap-2">
        <button onClick={() => setViewMode('edit')}
          className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-colors ${viewMode === 'edit' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
          ✏️ 編集モード
        </button>
        <button onClick={() => setViewMode('read')}
          className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-colors ${viewMode === 'read' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
          📖 読み上げモード
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          <div className="text-4xl mb-3">🎤</div>
          <div className="font-medium">タイムテーブルが登録されていません</div>
          <div className="text-sm mt-1">まずタイムテーブルを作成してください</div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className={`card ${viewMode === 'read' ? 'border-2 border-rose-200' : ''}`}>
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-rose-100 text-rose-700 text-sm font-bold px-3 py-1 rounded-full">
                    {item.start_time}{item.end_time ? `〜${item.end_time}` : ''}
                  </span>
                  <span className="font-bold text-gray-800 text-base">{item.content}</span>
                </div>
                {viewMode === 'edit' && (
                  <button
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">
                    {editingId === item.id ? '完了' : '編集'}
                  </button>
                )}
              </div>

              {/* 台本テキスト */}
              {viewMode === 'edit' && editingId === item.id ? (
                <div className="space-y-2">
                  <textarea
                    className="input font-mono text-sm"
                    rows={8}
                    value={scripts[item.id] || ''}
                    onChange={e => setScripts(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScripts(prev => ({ ...prev, [item.id]: generateScript(item) }))}
                      className="text-xs px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">
                      テンプレートに戻す
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scripts[item.id] || '')
                        alert('コピーしました')
                      }}
                      className="text-xs px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium">
                      このセクションをコピー
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`whitespace-pre-wrap leading-relaxed ${viewMode === 'read' ? 'text-lg text-gray-800 font-medium' : 'text-sm text-gray-700 bg-gray-50 rounded-xl p-4'}`}>
                  {scripts[item.id]}
                </div>
              )}

              {item.notes && viewMode === 'edit' && (
                <div className="mt-2 text-xs text-gray-400 border-t border-gray-100 pt-2">
                  メモ: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
