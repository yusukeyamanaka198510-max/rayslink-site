'use client'

import { useEffect, useState } from 'react'
import { supabase, ContentItem, Minute } from '@/lib/supabase'

const CATEGORIES = ['オープニング', 'ゲーム', '食事', '余興', '演出', 'スピーチ', 'その他']

const emptyForm = {
  title: '',
  description: '',
  category: 'その他',
  sort_order: 0,
}

export default function ContentsPage() {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [minutes, setMinutes] = useState<Minute[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterCategory, setFilterCategory] = useState('all')

  const fetchData = async () => {
    const [c, m] = await Promise.all([
      supabase.from('contents').select('*').order('sort_order').order('created_at'),
      supabase.from('minutes').select('*').order('date', { ascending: false }),
    ])
    setContents(c.data || [])
    setMinutes(m.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const ch = supabase.channel('contents-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contents' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const openNew = () => {
    setEditingItem(null)
    setForm({ ...emptyForm, sort_order: contents.length })
    setShowForm(true)
  }

  const openEdit = (item: ContentItem) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      sort_order: item.sort_order,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      category: form.category,
      sort_order: form.sort_order,
    }
    if (editingItem) {
      await supabase.from('contents').update(payload).eq('id', editingItem.id)
    } else {
      await supabase.from('contents').insert(payload)
    }
    setShowForm(false)
  }

  const deleteItem = async (id: string) => {
    if (!confirm('このコンテンツを削除しますか？')) return
    await supabase.from('contents').delete().eq('id', id)
  }

  // 議事録の決定事項からコンテンツを一括インポート
  const importFromMinutes = async (minute: Minute) => {
    if (!minute.decisions?.trim()) return
    const lines = minute.decisions.split('\n').filter(l => l.trim())
    const maxOrder = contents.reduce((m, c) => Math.max(m, c.sort_order), 0)
    const newItems = lines.map((line, i) => ({
      title: line.trim().replace(/^[・\-\*\d\.]+\s*/, ''),
      description: `議事録 ${minute.date} より`,
      category: 'その他' as string,
      sort_order: maxOrder + i + 1,
      source_minutes_id: minute.id,
    }))
    await supabase.from('contents').insert(newItems)
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = contents.filter(c => c.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<string, ContentItem[]>)

  const otherItems = contents.filter(c => !CATEGORIES.includes(c.category))
  if (otherItems.length > 0) grouped['その他'] = [...(grouped['その他'] || []), ...otherItems]

  const displayed = filterCategory === 'all' ? contents : contents.filter(c => c.category === filterCategory)

  const categoryColors: Record<string, string> = {
    'オープニング': 'bg-purple-100 text-purple-700',
    'ゲーム': 'bg-yellow-100 text-yellow-700',
    '食事': 'bg-orange-100 text-orange-700',
    '余興': 'bg-pink-100 text-pink-700',
    '演出': 'bg-indigo-100 text-indigo-700',
    'スピーチ': 'bg-blue-100 text-blue-700',
    'その他': 'bg-gray-100 text-gray-700',
  }

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🎉 コンテンツ</h1>
        <button onClick={openNew} className="btn-primary">＋ 追加</button>
      </div>

      {/* 議事録からインポート */}
      {minutes.filter(m => m.decisions?.trim()).length > 0 && (
        <div className="card bg-rose-50 border-rose-200">
          <h2 className="text-sm font-bold text-rose-700 mb-2">📋 議事録から決定事項をインポート</h2>
          <div className="space-y-2">
            {minutes.filter(m => m.decisions?.trim()).map(m => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">{m.date}</span>
                  {m.agenda && <span className="text-xs text-gray-500 ml-2">{m.agenda}</span>}
                </div>
                <button onClick={() => importFromMinutes(m)}
                  className="text-xs px-3 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium transition-colors flex-shrink-0">
                  インポート
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilterCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === 'all' ? 'bg-rose-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
          すべて ({contents.length})
        </button>
        {CATEGORIES.filter(c => contents.some(i => i.category === c)).map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-rose-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
            {cat} ({contents.filter(i => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* コンテンツリスト */}
      <div className="space-y-2">
        {displayed.length === 0 && (
          <div className="card text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🎉</div>
            コンテンツがまだありません<br />
            <span className="text-sm">議事録からインポートするか、手動で追加してください</span>
          </div>
        )}
        {displayed.map((item, idx) => (
          <div key={item.id} className="card flex items-start gap-3">
            <div className="text-gray-400 font-bold text-sm pt-1 min-w-[24px]">{idx + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[item.category] || 'bg-gray-100 text-gray-700'}`}>
                  {item.category}
                </span>
                <span className="font-semibold text-gray-800">{item.title}</span>
              </div>
              {item.description && (
                <div className="text-sm text-gray-500 mt-1">{item.description}</div>
              )}
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
                {editingItem ? 'コンテンツを編集' : '新しいコンテンツ'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">タイトル *</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">カテゴリ</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))}
                        className={`px-4 py-2 rounded-xl border-2 font-medium text-sm transition-colors ${
                          form.category === cat
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">説明・詳細</label>
                  <textarea className="input" rows={3} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
