'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Task, Minute, BudgetItem, TimetableItem, MEMBERS } from '@/lib/supabase'

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [minutes, setMinutes] = useState<Minute[]>([])
  const [budget, setBudget] = useState<BudgetItem[]>([])
  const [timetable, setTimetable] = useState<TimetableItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [t, m, b, tt] = await Promise.all([
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        supabase.from('minutes').select('*').order('date', { ascending: false }).limit(3),
        supabase.from('budget_items').select('*'),
        supabase.from('timetable').select('*').order('sort_order', { ascending: true }).limit(5),
      ])
      setTasks(t.data || [])
      setMinutes(m.data || [])
      setBudget(b.data || [])
      setTimetable(tt.data || [])
      setLoading(false)
    }
    fetchAll()

    const ch = supabase.channel('dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        supabase.from('tasks').select('*').order('due_date').then(r => setTasks(r.data || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const taskCounts = {
    '未着手': tasks.filter(t => t.status === '未着手').length,
    '進行中': tasks.filter(t => t.status === '進行中').length,
    '完了': tasks.filter(t => t.status === '完了').length,
  }

  const totalIncome = budget.filter(b => b.type === '収入').reduce((s, b) => s + b.unit_price * b.quantity, 0)
  const totalExpense = budget.filter(b => b.type === '支出').reduce((s, b) => s + b.unit_price * b.quantity, 0)
  const balance = totalIncome - totalExpense

  const today = new Date()
  const urgentTasks = tasks.filter(t => {
    if (t.status === '完了' || !t.due_date) return false
    const diff = Math.ceil((new Date(t.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff <= 7
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-gray-500">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">💒 Our Wedding Project</h1>
        <p className="text-gray-500 mt-1">結婚パーティー運営管理システム</p>
      </div>

      {/* タスク概要 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">タスク概要</h2>
          <Link href="/tasks" className="text-rose-500 text-sm font-medium">すべて見る →</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '未着手', count: taskCounts['未着手'], color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', badge: 'bg-gray-200' },
            { label: '進行中', count: taskCounts['進行中'], color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-200' },
            { label: '完了', count: taskCounts['完了'], color: 'bg-green-50 border-green-200', text: 'text-green-700', badge: 'bg-green-200' },
          ].map(s => (
            <div key={s.label} className={`card ${s.color} text-center`}>
              <div className={`text-3xl font-bold ${s.text}`}>{s.count}</div>
              <div className={`text-sm font-medium ${s.text} mt-1`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 期日が近いタスク */}
      {urgentTasks.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">⚠️ 期日が近いタスク</h2>
          <div className="space-y-2">
            {urgentTasks.slice(0, 3).map(task => {
              const diff = Math.ceil((new Date(task.due_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={task.id} href="/tasks" className="card flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="font-medium text-gray-800">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.assignees.join(', ')}</div>
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${diff <= 0 ? 'bg-red-100 text-red-700' : diff <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {diff <= 0 ? '期日超過' : `残${diff}日`}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* メンバー別タスク */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">メンバー別タスク</h2>
        <div className="grid grid-cols-3 gap-3">
          {MEMBERS.map(member => {
            const memberTasks = tasks.filter(t => t.assignees.includes(member) && t.status !== '完了')
            return (
              <Link key={member} href={`/tasks/${member}`} className="card hover:shadow-md transition-shadow text-center">
                <div className="text-2xl font-bold text-rose-600">{memberTasks.length}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">{member}</div>
                <div className="text-xs text-gray-500">進行中タスク</div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 予算サマリー */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">予算概要</h2>
          <Link href="/budget" className="text-rose-500 text-sm font-medium">詳細 →</Link>
        </div>
        <div className="card space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">総収入</span>
            <span className="font-bold text-green-600">¥{totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">総支出</span>
            <span className="font-bold text-red-600">¥{totalExpense.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-800">収支バランス</span>
            <span className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* 最近の議事録 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">最近の議事録</h2>
          <Link href="/minutes" className="text-rose-500 text-sm font-medium">すべて見る →</Link>
        </div>
        {minutes.length === 0 ? (
          <div className="card text-center text-gray-500">議事録がまだありません</div>
        ) : (
          <div className="space-y-2">
            {minutes.map(m => (
              <Link key={m.id} href="/minutes" className="card hover:shadow-md transition-shadow block">
                <div className="font-medium text-gray-800">{m.date}</div>
                <div className="text-sm text-gray-500 mt-1">{m.agenda || '議題未設定'}</div>
                <div className="text-xs text-gray-400 mt-1">参加者: {m.participants.join(', ')}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* タイムテーブル */}
      {timetable.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">タイムテーブル</h2>
            <Link href="/timetable" className="text-rose-500 text-sm font-medium">詳細 →</Link>
          </div>
          <div className="card space-y-2">
            {timetable.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="text-sm font-bold text-rose-600 min-w-[80px]">{item.start_time}{item.end_time ? `〜${item.end_time}` : ''}</div>
                <div className="text-sm text-gray-700">{item.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="h-4" />
    </div>
  )
}
