'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock } from 'lucide-react'

interface DateTimePickerProps {
  label: string
  required?: boolean
  value: string            // "YYYY-MM-DDTHH:mm" 形式
  onChange: (value: string) => void
  error?: string
}

export function DateTimePicker({ label, required, value, onChange, error }: DateTimePickerProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')

  // 外部 value が変わったら内部 state を同期
  useEffect(() => {
    if (value) {
      const [d, t] = value.split('T')
      setDate(d ?? '')
      setTime(t?.slice(0, 5) ?? '10:00')
    }
  }, [value])

  const emitChange = (d: string, t: string) => {
    if (d) onChange(`${d}T${t}`)
  }

  const handleDateChange = (d: string) => {
    setDate(d)
    emitChange(d, time)
  }

  const handleTimeChange = (t: string) => {
    setTime(t)
    emitChange(date, t)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex gap-2">
        {/* 日付 */}
        <div className="flex-1">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={e => handleDateChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 pl-1">日付</p>
        </div>

        {/* 時刻（日付が選ばれてから活性化） */}
        <div className="w-32">
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="time"
              value={time}
              onChange={e => handleTimeChange(e.target.value)}
              disabled={!date}
              className="w-full pl-9 pr-2 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 pl-1">時刻</p>
        </div>
      </div>

      {/* 選択中の表示 */}
      {date && (
        <p className="text-xs text-blue-600 mt-1.5 font-medium pl-1">
          {new Date(`${date}T${time}`).toLocaleString('ja-JP', {
            year: 'numeric', month: 'long', day: 'numeric',
            weekday: 'short', hour: '2-digit', minute: '2-digit'
          })}
        </p>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
