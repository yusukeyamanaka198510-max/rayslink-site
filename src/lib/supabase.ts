import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Task = {
  id: string
  title: string
  details: string | null
  due_date: string | null
  assignees: string[]
  status: '未着手' | '進行中' | '完了'
  created_at: string
  updated_at: string
}

export type Minute = {
  id: string
  date: string
  participants: string[]
  agenda: string | null
  details: string | null
  decisions: string | null
  created_at: string
  updated_at: string
}

export type BudgetItem = {
  id: string
  type: '収入' | '支出'
  name: string
  unit_price: number
  quantity: number
  paid_status: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type TimetableItem = {
  id: string
  start_time: string
  end_time: string | null
  content: string
  notes: string | null
  sort_order: number
  source_minutes_id: string | null
  created_at: string
  updated_at: string
}

export type ContentItem = {
  id: string
  title: string
  description: string | null
  category: string
  sort_order: number
  source_minutes_id: string | null
  created_at: string
  updated_at: string
}

export const MEMBERS = ['山中', '並木', '和田'] as const
export type Member = typeof MEMBERS[number]

export const STATUS_COLORS = {
  '未着手': 'bg-gray-100 text-gray-700 border-gray-300',
  '進行中': 'bg-blue-100 text-blue-700 border-blue-300',
  '完了': 'bg-green-100 text-green-700 border-green-300',
} as const

export const STATUS_BG = {
  '未着手': 'bg-gray-50 border-l-4 border-l-gray-400',
  '進行中': 'bg-blue-50 border-l-4 border-l-blue-400',
  '完了': 'bg-green-50 border-l-4 border-l-green-400',
} as const
