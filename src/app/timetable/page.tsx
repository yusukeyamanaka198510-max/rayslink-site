'use client'

import { useEffect, useState } from 'react'
import { supabase, TimetableItem, Minute } from '@/lib/supabase'

const emptyForm = {
  start_time: '',
  end_time: '',
  content: '',
  notes: '',
  sort_order: 0,
}

export default function TimetablePage() {
  const [items, setItems] = useState<TimetableItem[]>([])
  const [minutes, setMinutes] = useState<Minute[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<TimetableItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    const [t, m] = await Promise.all([
      supabase.from('timetable').select('*').order('sort_order').order('start_time'),
      supabase.from('minutes').select('*').order('date', { ascending: false }),
    ])
    setItems(t.data || [])
    setMinutes(m.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const ch = supabase.channel('timetable-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const openNew = () => {
    setEditingItem(null)
    setForm({ ...emptyForm, sort_order: items.length })
    setShowForm(true)
  }

  const openEdit = (item: TimetableItem) => {
    setEditingItem(item)
    setForm({
      start_time: item.start_time,
      end_time: item.end_time || '',
      content: item.content,
      notes: item.notes || '',
      sort_order: item.sort_order,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      start_time: form.start_time,
      end_time: form.end_time || null,
      content: form.content.trim(),
      notes: form.notes || null,
      sort_order: form.sort_order,
    }
    if (editingItem) {
      await supabase.from('timetable').update(payload).eq('id', editingItem.id)
    } else {
      await supabase.from('timetable').insert(payload)
    }
    setShowForm(false)
  }

  const deleteItem = async (id: string) => {
    if (!confirm('この項目を削除しますか？')) return
    await supabase.from('timetable').delete().eq('id', id)
  }

  // 議事録からタイムテーブルを自動生成（時間パターン検出）
  const importFromMinutes = async (minute: Minute) => {
    const text = [minute.details, minute.decisions].filter(Boolean).join('\n')
    const lines = text.split('\n').filter(l => l.trim())
    const timePattern = /(\d{1,2})[：:時](\d{0,2})/

    const newItems: any[] = []
    lines.forEach((line, i) => {
      const match = line.match(timePattern)
      if (match) {
        const h = match[1].padStart(2, '0')
        const m = (match[2] || '00').padStart(2, '0')
        newItems.push({
          start_time: `${h}:${m}`,
          content: line.trim().replace(timePattern, '').replace(/^[：:\s・\-]+/, '').trim() || line.trim(),
          notes: `議事録 ${minute.date} より`,
          sort_order: items.length + i,
          source_minutes_id: minute.id,
        })
      }
    })

    if (newItems.length === 0) {
      alert('時間（例: 13:00 や 13時00分）が含まれる行が見つかりませんでした')
      return
    }
    await supabase.from('timetable').insert(newItems)
    alert(`${newItems.length}件のタイムテーブル項目を追加しました`)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🕐 タイムテーブル</h1>
        <button onClick={openNew} className="btn-primary">＋ 追加</button>
      </div>

      {/* 議事録からインポート */}
      {minutes.filter(m => m.details?.trim() || m.decisions?.trim()).length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <h2 className="text-sm font-bold text-blue-700 mb-2">📋 議事録から自動生成（時間を検出）</h2>
          <div className="space-y-2">
            {minutes.filter(m => m.details?.trim() || m.decisions?.trim()).map(m => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">{m.date}</span>
                  {m.agenda && <span className="text-xs text-gray-500 ml-2">{m.agenda}</span>}
                </div>
                <button onClick={() => importFromMinutes(m)}
                  className="text-xs px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors flex-shrink-0">
                  自動生成
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* タイムテーブル表示 */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="card text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🕐</div>
            タイムテーブルがまだありません<br />
            <span className="text-sm">議事録から自動生成するか、手動で追加してください</span>
          </div>
        )}
        {items.map((item, idx) => (
          <div key={item.id} className="card flex items-start gap-4">
            <div className="flex-shrink-0 text-center min-w-[80px]">
              <div className="text-base font-bold text-rose-600">{item.start_time}</div>
              {item.end_time && <div className="text-xs text-gray-400">〜{item.end_time}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800">{item.content}</div>
              {item.notes && <div className="text-sm text-gray-500 mt-1">{item.notes}</div>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(item)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">
                編集
              </button>
              <button onClick={() => deleteItem(item.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-medium">
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* フォームモーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? '項目を編集' : '新しい項目'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">開始時間 *</label>
                    <input type="time" className="input" value={form.start_time}
                      onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">終了時間</label>
                    <input type="time" className="input" value={form.end_time}
                      onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">内容 *</label>
                  <input className="input" value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required
                    placeholder="例: オープニング" />
                </div>
                <div>
                  <label className="label">メモ・詳細</label>
                  <textarea className="input" rows={2} value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div>
                  <label className="label">表示順</label>
                  <input type="number" className="input" value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">キャンセル</button>
                  <button type="submit" className="btn-primary flex-1">{editingItem ? '更新' : '追加'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
