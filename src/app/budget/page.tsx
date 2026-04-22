'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, BudgetItem } from '@/lib/supabase'

const newRow = (type: '収入' | '支出', order: number): Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'> => ({
  type,
  name: '',
  unit_price: 0,
  quantity: 1,
  paid_status: false,
  sort_order: order,
})

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'収入' | '支出'>('支出')
  const [saving, setSaving] = useState<string | null>(null)

  const fetchItems = async () => {
    const { data } = await supabase.from('budget_items').select('*').order('sort_order').order('created_at')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
    const ch = supabase.channel('budget-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_items' }, fetchItems)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const addRow = async () => {
    const typeItems = items.filter(i => i.type === tab)
    const maxOrder = typeItems.reduce((m, i) => Math.max(m, i.sort_order), 0)
    await supabase.from('budget_items').insert({ ...newRow(tab, maxOrder + 1) })
  }

  const updateItem = useCallback(async (id: string, field: keyof BudgetItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
    setSaving(id)
    await supabase.from('budget_items').update({ [field]: value }).eq('id', id)
    setSaving(null)
  }, [])

  const deleteItem = async (id: string) => {
    await supabase.from('budget_items').delete().eq('id', id)
  }

  const togglePaid = async (item: BudgetItem) => {
    await supabase.from('budget_items').update({ paid_status: !item.paid_status }).eq('id', item.id)
  }

  const displayed = items.filter(i => i.type === tab)
  const incomeItems = items.filter(i => i.type === '収入')
  const expenseItems = items.filter(i => i.type === '支出')

  const totalIncome = incomeItems.reduce((s, i) => s + (i.unit_price * i.quantity), 0)
  const totalExpense = expenseItems.reduce((s, i) => s + (i.unit_price * i.quantity), 0)
  const paidExpense = expenseItems.filter(i => i.paid_status).reduce((s, i) => s + (i.unit_price * i.quantity), 0)
  const balance = totalIncome - totalExpense

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">💰 予算管理</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-green-50 border-green-200">
          <div className="text-sm text-green-600 font-medium">総収入</div>
          <div className="text-2xl font-bold text-green-700 mt-1">¥{totalIncome.toLocaleString()}</div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="text-sm text-red-600 font-medium">総支出</div>
          <div className="text-2xl font-bold text-red-700 mt-1">¥{totalExpense.toLocaleString()}</div>
        </div>
        <div className={`card col-span-2 ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`text-sm font-medium ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>収支バランス</div>
          <div className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">支払済: ¥{paidExpense.toLocaleString()} / ¥{totalExpense.toLocaleString()}</div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-2">
        {(['支出', '収入'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 rounded-xl font-semibold text-base transition-colors border-2 ${
              tab === t
                ? t === '支出' ? 'bg-red-500 border-red-500 text-white' : 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-200 text-gray-700'
            }`}>
            {t === '支出' ? '💳 支出' : '💵 収入'}
            <span className="ml-2 text-sm opacity-75">
              ¥{(t === '支出' ? totalExpense : totalIncome).toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* テーブル */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-600 font-medium">名称</th>
              <th className="text-right px-3 py-3 text-gray-600 font-medium whitespace-nowrap">単価</th>
              <th className="text-right px-3 py-3 text-gray-600 font-medium">個数</th>
              <th className="text-right px-3 py-3 text-gray-600 font-medium">小計</th>
              {tab === '支出' && <th className="text-center px-3 py-3 text-gray-600 font-medium">支払</th>}
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">項目がありません</td>
              </tr>
            )}
            {displayed.map(item => (
              <tr key={item.id} className={`border-b border-gray-50 ${item.paid_status && tab === '支出' ? 'opacity-60' : ''}`}>
                <td className="px-4 py-2">
                  <input
                    className="w-full border-0 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 text-gray-800 text-base"
                    value={item.name}
                    placeholder="項目名"
                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                    onBlur={e => updateItem(item.id, 'name', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-24 border-0 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 text-right text-gray-800 text-base"
                    value={item.unit_price}
                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, unit_price: Number(e.target.value) } : i))}
                    onBlur={e => updateItem(item.id, 'unit_price', Number(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-16 border-0 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 text-right text-gray-800 text-base"
                    value={item.quantity}
                    min={1}
                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Number(e.target.value) } : i))}
                    onBlur={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">
                  ¥{(item.unit_price * item.quantity).toLocaleString()}
                </td>
                {tab === '支出' && (
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => togglePaid(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        item.paid_status
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {item.paid_status ? '済' : '未'}
                    </button>
                  </td>
                )}
                <td className="px-3 py-2 text-center">
                  <button onClick={() => deleteItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50">
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td colSpan={2} className="px-4 py-3 font-bold text-gray-800">合計</td>
              <td className="px-3 py-3 text-right font-bold text-gray-800">
                {displayed.reduce((s, i) => s + i.quantity, 0)}
              </td>
              <td className="px-3 py-3 text-right font-bold text-lg text-gray-800 whitespace-nowrap">
                ¥{displayed.reduce((s, i) => s + i.unit_price * i.quantity, 0).toLocaleString()}
              </td>
              {tab === '支出' && <td></td>}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <button onClick={addRow} className="btn-secondary w-full">
        ＋ 行を追加
      </button>
    </div>
  )
}
