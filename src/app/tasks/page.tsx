'use client'

import { useEffect, useState } from 'react'
import { supabase, Task, MEMBERS, STATUS_COLORS, STATUS_BG } from '@/lib/supabase'
import Link from 'next/link'

const STATUSES: Task['status'][] = ['未着手', '進行中', '完了']

const emptyForm = {
  title: '',
  details: '',
  due_date: '',
  assignees: [] as string[],
  status: '未着手' as Task['status'],
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMember, setFilterMember] = useState<string>('all')

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false })
    setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
    const ch = supabase.channel('tasks-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const openNew = () => {
    setEditingTask(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setForm({
      title: task.title,
      details: task.details || '',
      due_date: task.due_date || '',
      assignees: task.assignees,
      status: task.status,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const payload = {
      title: form.title.trim(),
      details: form.details || null,
      due_date: form.due_date || null,
      assignees: form.assignees,
      status: form.status,
    }

    if (editingTask) {
      await supabase.from('tasks').update(payload).eq('id', editingTask.id)
    } else {
      await supabase.from('tasks').insert(payload)
    }
    setShowForm(false)
  }

  const updateStatus = async (task: Task, status: Task['status']) => {
    await supabase.from('tasks').update({ status }).eq('id', task.id)
  }

  const deleteTask = async (id: string) => {
    if (!confirm('このタスクを削除しますか？')) return
    await supabase.from('tasks').delete().eq('id', id)
  }

  const toggleAssignee = (member: string) => {
    setForm(f => ({
      ...f,
      assignees: f.assignees.includes(member)
        ? f.assignees.filter(a => a !== member)
        : [...f.assignees, member]
    }))
  }

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterMember !== 'all' && !t.assignees.includes(filterMember)) return false
    return true
  })

  const today = new Date()

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">✅ タスク一覧</h1>
        <button onClick={openNew} className="btn-primary">
          ＋ 追加
        </button>
      </div>

      {/* メンバー個人ページへのリンク */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEMBERS.map(m => (
          <Link key={m} href={`/tasks/${m}`}
            className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors">
            {m}のタスク
          </Link>
        ))}
      </div>

      {/* フィルター */}
      <div className="flex gap-2 flex-wrap">
        <select className="input !w-auto text-sm py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">全ステータス</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input !w-auto text-sm py-2" value={filterMember} onChange={e => setFilterMember(e.target.value)}>
          <option value="all">全メンバー</option>
          {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="text-sm text-gray-500 py-2">{filtered.length}件</span>
      </div>

      {/* タスクリスト */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card text-center text-gray-500 py-8">タスクがありません</div>
        )}
        {filtered.map(task => {
          const daysLeft = task.due_date
            ? Math.ceil((new Date(task.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : null
          return (
            <div key={task.id} className={`card ${STATUS_BG[task.status]}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-base">{task.title}</div>
                  {task.details && <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{task.details}</div>}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {task.assignees.map(a => (
                      <span key={a} className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-medium">{a}</span>
                    ))}
                    {task.due_date && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        daysLeft !== null && daysLeft <= 0 ? 'bg-red-100 text-red-700'
                        : daysLeft !== null && daysLeft <= 3 ? 'bg-orange-100 text-orange-700'
                        : daysLeft !== null && daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                        📅 {task.due_date}
                        {daysLeft !== null && (daysLeft <= 0 ? ' (期日超過)' : ` (残${daysLeft}日)`)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${STATUS_COLORS[task.status]}`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* ステータス変更ボタン & 編集/削除 */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 flex-wrap">
                {STATUSES.filter(s => s !== task.status).map(s => (
                  <button key={s} onClick={() => updateStatus(task, s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${STATUS_COLORS[s]} hover:opacity-80`}>
                    → {s}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  <button onClick={() => openEdit(task)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium">
                    編集
                  </button>
                  <button onClick={() => deleteTask(task.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium">
                    削除
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* フォームモーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingTask ? 'タスクを編集' : '新しいタスク'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">タイトル *</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">詳細</label>
                  <textarea className="input" rows={3} value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} />
                </div>
                <div>
                  <label className="label">期日</label>
                  <input type="date" className="input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">担当者（複数選択可）</label>
                  <div className="flex gap-2">
                    {MEMBERS.map(m => (
                      <button key={m} type="button"
                        onClick={() => toggleAssignee(m)}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium text-base transition-colors ${
                          form.assignees.includes(m)
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">ステータス</label>
                  <div className="flex gap-2">
                    {STATUSES.map(s => (
                      <button key={s} type="button"
                        onClick={() => setForm(f => ({ ...f, status: s }))}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-colors ${
                          form.status === s
                            ? s === '未着手' ? 'bg-gray-500 border-gray-500 text-white'
                              : s === '進行中' ? 'bg-blue-500 border-blue-500 text-white'
                              : 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">キャンセル</button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingTask ? '更新' : '追加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
