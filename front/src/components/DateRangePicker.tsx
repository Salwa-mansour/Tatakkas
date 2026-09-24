import { useState } from 'react'
import { DateRange, RangeKeyDict } from 'react-date-range'
import { format, addYears } from 'date-fns'
import { DateRangeSelection } from '../types/weather'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

interface DateRangePickerProps {
  onRangeChange: (selection: DateRangeSelection) => void
}

export default function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const today = new Date()
  const oneYearFromNow = addYears(today, 1)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [range, setRange] = useState([
    {
      startDate: today,
      endDate: today,
      key: 'selection',
    },
  ])

  const isTodaySelected = (start: Date, end: Date): boolean => {
    const todayStr = format(today, 'yyyy-MM-dd')
    return format(start, 'yyyy-MM-dd') === todayStr && format(end, 'yyyy-MM-dd') === todayStr
  }

  const handleSelect = (ranges: RangeKeyDict): void => {
    const selection = ranges.selection
    const startDate = selection.startDate || today
    const endDate = selection.endDate || today

    setRange([
      {
        startDate,
        endDate,
        key: 'selection',
      },
    ])

    onRangeChange({
      startDate,
      endDate,
      isLiveForecast: isTodaySelected(startDate, endDate),
    })
  }

  const handleResetToToday = (): void => {
    setRange([
      {
        startDate: today,
        endDate: today,
        key: 'selection',
      },
    ])

    onRangeChange({
      startDate: today,
      endDate: today,
      isLiveForecast: true,
    })

    setIsOpen(false)
  }

  const startDateStr = format(range[0].startDate, 'MMM dd, yyyy')
  const endDateStr = format(range[0].endDate, 'MMM dd, yyyy')
  const isSingleDay = startDateStr === endDateStr

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📅 {isSingleDay ? startDateStr : `${startDateStr} — ${endDateStr}`}
        </button>

        <button
          type="button"
          onClick={handleResetToToday}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            background: isTodaySelected(range[0].startDate, range[0].endDate) ? '#dbeafe' : '#f1f5f9',
            color: isTodaySelected(range[0].startDate, range[0].endDate) ? '#1d4ed8' : '#475569',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          Live Weather
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 50,
            background: '#ffffff',
            borderRadius: '12px',
            padding: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            overflowX: 'auto',
            maxWidth: '100vw',
          }}
        >
          <DateRange
            ranges={range}
            onChange={handleSelect}
            minDate={today}
            maxDate={oneYearFromNow}
            showMonthAndYearPickers={false}
            months={2}
            direction="horizontal"
            preventSnapRefocus={true}
          />
          <div style={{ padding: '8px', textAlign: 'right', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '6px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}