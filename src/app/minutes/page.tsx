'use client'

import { useEffect, useState } from 'react'
import { supabase, Minute, Task, MEMBERS } from '@/lib/supabase'

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  participants: [] as string[],
  agenda: '',
  details: '',
  decisions: '',
}

type TaskCandidate = {
  text: string
  title: string
  assignees: string[]
  due_date: string
  selected: boolean
}

export default function MinutesPage() {
  const [minutes, setMinutes] = useState<Minute[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMinute, setEditingMinute] = useState<Minute | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [taskCandidates, setTaskCandidates] = useState<TaskCandidate[]>([])
  const [showTaskModal, setShowTaskModal] = useState(false)

  const fetchMinutes = async () => {
    const { data } = await supabase.from('minutes').select('*').order('date', { ascending: false })
    setMinutes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMinutes()
    const ch = supabase.channel('minutes-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'minutes' }, fetchMinutes)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const toggleParticipant = (m: string) => {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(m)
        ? f.participants.filter(p => p !== m)
        : [...f.participants, m]
    }))
  }

  const openNew = () => {
    setEditingMinute(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (m: Minute) => {
    setEditingMinute(m)
    setForm({
      date: m.date,
      participants: m.participants,
      agenda: m.agenda || '',
      details: m.details || '',
      decisions: m.decisions || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      date: form.date,
      participants: form.participants,
      agenda: form.agenda || null,
      details: form.details || null,
      decisions: form.decisions || null,
    }

    let savedId: string | null = null
    if (editingMinute) {
      await supabase.from('minutes').update(payload).eq('id', editingMinute.id)
      savedId = editingMinute.id
    } else {
      const { data } = await supabase.from('minutes').insert(payload).select().single()
      savedId = data?.id || null
    }

    setShowForm(false)

    // 決定事項があればタスク候補を生成
    if (form.decisions.trim()) {
      const lines = form.decisions.split('\n').filter(l => l.trim())
      const candidates: TaskCandidate[] = lines.map(line => ({
        text: line.trim(),
        title: line.trim().replace(/^[・\-\*\d\.]+\s*/, ''),
        assignees: [],
        due_date: '',
        selected: true,
      }))
      setTaskCandidates(candidates)
      setShowTaskModal(true)
    }
  }

  const handleCreateTasks = async () => {
    const selected = taskCandidates.filter(c => c.selected && c.title.trim())
    for (const c of selected) {
      await supabase.from('tasks').insert({
        title: c.title,
        details: `議事録より: ${c.text}`,
        due_date: c.due_date || null,
        assignees: c.assignees,
        status: '未着手',
      })
      if (c.due_date) {
        // タイムテーブルへの登録（時間形式の場合）
        const timeMatch = c.title.match(/(\d{1,2}):(\d{2})/)
        if (timeMatch) {
          await supabase.from('timetable').insert({
            start_time: `${timeMatch[1]}:${timeMatch[2]}`,
            content: c.title,
            sort_order: 99,
          })
        }
      }
    }
    setShowTaskModal(false)
    setTaskCandidates([])
  }

  const deleteMinute = async (id: string) => {
    if (!confirm('この議事録を削除しますか？')) return
    await supabase.from('minutes').delete().eq('id', id)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📝 議事録</h1>
        <button onClick={openNew} className="btn-primary">＋ 新規作成</button>
      </div>

      <div className="space-y-3">
        {minutes.length === 0 && (
          <div className="card text-center text-gray-500 py-8">議事録がまだありません</div>
        )}
        {minutes.map(m => (
          <div key={m.id} className="card">
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
            >
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-lg">{m.date}</div>
                {m.agenda && <div className="text-gray-600 mt-1">{m.agenda}</div>}
                <div className="text-sm text-gray-400 mt-1">
                  参加者: {m.participants.join(', ') || 'なし'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); openEdit(m) }}
                  className="text-xs px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">
                  編集
                </button>
                <button onClick={e => { e.stopPropagation(); deleteMinute(m.id) }}
                  className="text-xs px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-medium">
                  削除
                </button>
                <span className="text-gray-400 text-xl">{expandedId === m.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedId === m.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                {m.details && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">議題・詳細</h3>
                    <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-3 text-sm">{m.details}</div>
                  </div>
                )}
                {m.decisions && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">決定事項</h3>
                    <div className="text-gray-700 whitespace-pre-wrap bg-rose-50 rounded-xl p-3 text-sm border border-rose-100">{m.decisions}</div>
                    <button
                      onClick={() => {
                        const lines = m.decisions!.split('\n').filter(l => l.trim())
                        setTaskCandidates(lines.map(line => ({
                          text: line.trim(),
                          title: line.trim().replace(/^[・\-\*\d\.]+\s*/, ''),
                          assignees: [],
                          due_date: '',
                          selected: true,
                        })))
                        setShowTaskModal(true)
                      }}
                      className="mt-2 text-sm px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium transition-colors">
                      ✅ 決定事項からタスクを作成
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 入力フォームモーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingMinute ? '議事録を編集' : '新しい議事録'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">日付 *</label>
                  <input type="date" className="input" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">参加者</label>
                  <div className="flex gap-2">
                    {MEMBERS.map(m => (
                      <button key={m} type="button" onClick={() => toggleParticipant(m)}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium text-base transition-colors ${
                          form.participants.includes(m)
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">議題</label>
                  <input className="input" value={form.agenda}
                    onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                    placeholder="例: 会場装飾について" />
                </div>
                <div>
                  <label className="label">詳細・メモ</label>
                  <textarea className="input" rows={4} value={form.details}
                    onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                    placeholder="話し合った内容を記録してください" />
                </div>
                <div>
                  <label className="label">決定事項</label>
                  <textarea className="input" rows={4} value={form.decisions}
                    onChange={e => setForm(f => ({ ...f, decisions: e.target.value }))}
                    placeholder="・決定事項1&#10;・決定事項2&#10;※1行1項目で記入するとタスク変換しやすくなります" />
                  <p className="text-xs text-gray-400 mt-1">保存後、決定事項をタスクに変換できます</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">キャンセル</button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingMinute ? '更新' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* タスク候補モーダル */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">タスク候補</h2>
              <p className="text-sm text-gray-500 mb-4">決定事項からタスクを作成します。担当者と期日を設定してください。</p>
              <div className="space-y-4">
                {taskCandidates.map((c, i) => (
                  <div key={i} className={`border-2 rounded-xl p-4 transition-colors ${c.selected ? 'border-rose-200 bg-rose-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked={c.selected}
                        onChange={e => setTaskCandidates(prev => prev.map((p, j) => j === i ? { ...p, selected: e.target.checked } : p))}
                        className="mt-1 w-5 h-5 accent-rose-500" />
                      <div className="flex-1">
                        <input className="input !py-2 text-sm" value={c.title}
                          onChange={e => setTaskCandidates(prev => prev.map((p, j) => j === i ? { ...p, title: e.target.value } : p))} />
                        <div className="flex gap-2 mt-2">
                          {MEMBERS.map(m => (
                            <button key={m} type="button"
                              onClick={() => setTaskCandidates(prev => prev.map((p, j) => j === i ? {
                                ...p,
                                assignees: p.assignees.includes(m)
                                  ? p.assignees.filter(a => a !== m)
                                  : [...p.assignees, m]
                              } : p))}
                              className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                                c.assignees.includes(m)
                                  ? 'bg-rose-500 border-rose-500 text-white'
                                  : 'bg-white border-gray-200 text-gray-700'
                              }`}>
                              {m}
                            </button>
                          ))}
                        </div>
                        <input type="date" className="input !py-2 text-sm mt-2" value={c.due_date}
                          onChange={e => setTaskCandidates(prev => prev.map((p, j) => j === i ? { ...p, due_date: e.target.value } : p))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowTaskModal(false); setTaskCandidates([]) }} className="btn-secondary flex-1">
                  スキップ
                </button>
                <button onClick={handleCreateTasks} className="btn-primary flex-1">
                  タスクを作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
