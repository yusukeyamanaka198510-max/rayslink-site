'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Task, STATUS_BG, STATUS_COLORS, MEMBERS } from '@/lib/supabase'

const STATUSES: Task['status'][] = ['未着手', '進行中', '完了']

export default function UserTasksPage() {
  const params = useParams()
  const user = decodeURIComponent(params.user as string)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .contains('assignees', [user])
      .order('due_date', { ascending: true, nullsFirst: false })
    setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!MEMBERS.includes(user as any)) return
    fetchTasks()
    const ch = supabase.channel(`user-tasks-${user}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user])

  const updateStatus = async (task: Task, status: Task['status']) => {
    await supabase.from('tasks').update({ status }).eq('id', task.id)
  }

  const today = new Date()
  const pending = tasks.filter(t => t.status !== '完了')
  const completed = tasks.filter(t => t.status === '完了')

  if (!MEMBERS.includes(user as any)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">メンバーが見つかりません</p>
        <Link href="/tasks" className="text-rose-500 mt-4 block">← タスク一覧へ</Link>
      </div>
    )
  }

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/tasks" className="text-gray-500 hover:text-gray-700 text-2xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-900">{user}のタスク</h1>
      </div>

      {/* メンバー切り替え */}
      <div className="flex gap-2">
        {MEMBERS.map(m => (
          <Link key={m} href={`/tasks/${m}`}
            className={`flex-1 py-3 rounded-xl text-center font-medium text-base transition-colors border-2 ${
              m === user
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-rose-200'
            }`}>
            {m}
          </Link>
        ))}
      </div>

      <div className="flex gap-4 text-sm text-gray-600">
        <span>進行中: <strong className="text-blue-600">{pending.length}</strong></span>
        <span>完了: <strong className="text-green-600">{completed.length}</strong></span>
      </div>

      {/* 未完了タスク */}
      <section>
        <h2 className="text-base font-bold text-gray-700 mb-2">進行中・未着手</h2>
        <div className="space-y-3">
          {pending.length === 0 && (
            <div className="card text-center text-gray-500 py-6">タスクがありません 🎉</div>
          )}
          {pending.map(task => {
            const daysLeft = task.due_date
              ? Math.ceil((new Date(task.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              : null
            return (
              <div key={task.id} className={`card ${STATUS_BG[task.status]}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{task.title}</div>
                    {task.details && <div className="text-sm text-gray-600 mt-1">{task.details}</div>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.assignees.filter(a => a !== user).map(a => (
                        <span key={a} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">共同: {a}</span>
                      ))}
                      {task.due_date && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          daysLeft !== null && daysLeft <= 0 ? 'bg-red-100 text-red-700'
                          : daysLeft !== null && daysLeft <= 3 ? 'bg-orange-100 text-orange-700'
                          : daysLeft !== null && daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                          📅 {task.due_date}
                          {daysLeft !== null && (daysLeft <= 0 ? ' 期日超過!' : ` 残${daysLeft}日`)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg border font-medium flex-shrink-0 ${STATUS_COLORS[task.status]}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 flex-wrap">
                  {STATUSES.filter(s => s !== task.status).map(s => (
                    <button key={s} onClick={() => updateStatus(task, s)}
                      className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${STATUS_COLORS[s]} hover:opacity-80`}>
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 完了タスク */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-700 mb-2">完了済み</h2>
          <div className="space-y-2">
            {completed.map(task => (
              <div key={task.id} className="card bg-green-50 border-l-4 border-l-green-400 opacity-75">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-gray-700 line-through">{task.title}</div>
                    {task.due_date && <div className="text-xs text-gray-400 mt-0.5">📅 {task.due_date}</div>}
                  </div>
                  <button onClick={() => updateStatus(task, '進行中')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium flex-shrink-0">
                    再開
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
