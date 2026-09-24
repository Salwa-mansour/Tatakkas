import { useState, useEffect } from 'react'
import { DateRange, RangeKeyDict } from 'react-date-range'
import { format, addYears } from 'date-fns'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface DateRangeSelection {
  startDate: Date
  endDate: Date
  isLiveForecast: boolean
}

export interface LocationCoords {
  lat: number
  lng: number
}

interface OpenMeteoResponse {
  current_weather?: {
    temperature: number
    windspeed: number
    weathercode: number
  }
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weathercode: number[]
  }
}

interface TripWeatherProps {
  location: LocationCoords
}
interface WeatherInfo {
  label: string
  icon: string
}
interface DailySummary {
  avgMaxTemp: number
  avgMinTemp: number
  dominantWeather: WeatherInfo
}

function calculateDailySummary(daily: NonNullable<OpenMeteoResponse['daily']>): DailySummary | null {
  if (!daily.time || daily.time.length === 0) return null

  const count = daily.time.length
  
  // Calculate Averages
  const sumMax = daily.temperature_2m_max.reduce((acc, temp) => acc + temp, 0)
  const sumMin = daily.temperature_2m_min.reduce((acc, temp) => acc + temp, 0)

  // Find Dominant Weather Code (Mode)
  const codeFrequency: Record<number, number> = {}
  daily.weathercode.forEach((code) => {
    codeFrequency[code] = (codeFrequency[code] || 0) + 1
  })

  let dominantCode = daily.weathercode[0]
  let maxCount = 0

  Object.entries(codeFrequency).forEach(([codeStr, freq]) => {
    if (freq > maxCount) {
      maxCount = freq
      dominantCode = Number(codeStr)
    }
  })

  return {
    avgMaxTemp: Math.round((sumMax / count) * 10) / 10,
    avgMinTemp: Math.round((sumMin / count) * 10) / 10,
    dominantWeather: getWeatherDetails(dominantCode),
  }
}
function getWeatherDetails(code: number): WeatherInfo {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: '☀️' }
    case 1:
      return { label: 'Mainly Clear', icon: '🌤️' }
    case 2:
      return { label: 'Partly Cloudy', icon: '⛅' }
    case 3:
      return { label: 'Overcast', icon: '☁️' }
    case 45:
    case 48:
      return { label: 'Foggy', icon: '🌫️' }
    case 51:
    case 53:
    case 55:
      return { label: 'Drizzle', icon: '🌧️' }
    case 61:
    case 63:
    case 65:
      return { label: 'Rain', icon: '🌧️' }
    case 66:
    case 67:
      return { label: 'Freezing Rain', icon: '🌧️❄️' }
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Snowfall', icon: '❄️' }
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: '🌦️' }
    case 85:
    case 86:
      return { label: 'Snow Showers', icon: '🌨️' }
    case 95:
      return { label: 'Thunderstorm', icon: '⛈️' }
    case 96:
    case 99:
      return { label: 'Thunderstorm w/ Hail', icon: '⛈️🧊' }
    default:
      return { label: 'Unknown', icon: '🌡️' }
  }
}
// ==========================================
// 2. MAIN COMBINED COMPONENT
// ==========================================

export default function TripWeather({ location }: TripWeatherProps) {
  const today = new Date()
  const oneYearFromNow = addYears(today, 1)

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: today,
    endDate: today,
  })

  const [weatherData, setWeatherData] = useState<OpenMeteoResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Range Picker State
  const [range, setRange] = useState([
    {
      startDate: today,
      endDate: today,
      key: 'selection',
    },
  ])

  // Helper checks
  const isTodaySelected = (start: Date, end: Date): boolean => {
    const todayStr = format(today, 'yyyy-MM-dd')
    return format(start, 'yyyy-MM-dd') === todayStr && format(end, 'yyyy-MM-dd') === todayStr
  }

  const isLive = isTodaySelected(dateRange.startDate, dateRange.endDate)

  // Handlers
  const handleSelect = (ranges: RangeKeyDict): void => {
    const selection = ranges.selection
    const startDate = selection.startDate || today
    const endDate = selection.endDate || today

    setRange([{ startDate, endDate, key: 'selection' }])
    setDateRange({ startDate, endDate })
  }

  const handleResetToToday = (): void => {
    setRange([{ startDate: today, endDate: today, key: 'selection' }])
    setDateRange({ startDate: today, endDate: today })
    setIsOpen(false)
  }

// Inside TripWeather.tsx

// State to track if historical fallback is active
const [isHistoricalFallback, setIsHistoricalFallback] = useState<boolean>(false)

useEffect(() => {
  if (!location?.lat || !location?.lng || !dateRange.startDate || !dateRange.endDate) return
const controller = new AbortController()
  setLoading(true)
  setError(null)
  setIsHistoricalFallback(false)

  const today = new Date()
  const maxForecastDate = new Date()
  maxForecastDate.setDate(today.getDate() + 15) // Open-Meteo 16-day limit

  const startStr = format(dateRange.startDate, 'yyyy-MM-dd')
  const endStr = format(dateRange.endDate, 'yyyy-MM-dd')
  const todayStr = format(today, 'yyyy-MM-dd')
  const maxForecastStr = format(maxForecastDate, 'yyyy-MM-dd')

  const isToday = startStr === todayStr && endStr === todayStr
  const isPast = endStr < todayStr
  const isBeyondForecast = endStr > maxForecastStr

  let url = ''

  if (isBeyondForecast) {
    // 1. Shift dates back by 1 year for dates beyond the forecast limit
    const pastStart = new Date(dateRange.startDate)
    pastStart.setFullYear(pastStart.getFullYear() - 1)

    const pastEnd = new Date(dateRange.endDate)
    pastEnd.setFullYear(pastEnd.getFullYear() - 1)

    const fallbackStartStr = format(pastStart, 'yyyy-MM-dd')
    const fallbackEndStr = format(pastEnd, 'yyyy-MM-dd')

    setIsHistoricalFallback(true)

    // Query historical archive endpoint
    url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lng}&start_date=${fallbackStartStr}&end_date=${fallbackEndStr}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`

  } else if (isPast) {
    // 2. Past dates within current/previous years
    url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lng}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`

  } else if (isToday) {
    // 3. Current day live weather
    url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`

  } else {
    // 4. Standard future forecast (up to 16 days)
    url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
  }

fetch(url, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch weather telemetry')
      return res.json()
    })
    .then((data: OpenMeteoResponse) => setWeatherData(data))
    .catch((err: Error) => {
      if (err.name !== 'AbortError') setError(err.message)
    })
    .finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })

  return () => controller.abort()
}, [dateRange, location])

  const startDateStr = format(range[0].startDate, 'MMM dd, yyyy')
  const endDateStr = format(range[0].endDate, 'MMM dd, yyyy')
  const isSingleDay = startDateStr === endDateStr

  return (
    <div style={styles.wrapper}>
      {/* Date Picker Controls */}
      <div style={styles.pickerContainer}>
        <div style={styles.controlsGroup}>
          <button type="button" onClick={() => setIsOpen(!isOpen)} style={styles.triggerBtn}>
            📅 {isSingleDay ? startDateStr : `${startDateStr} — ${endDateStr}`}
          </button>

          <button
            type="button"
            onClick={handleResetToToday}
            style={{
              ...styles.liveBtn,
              background: isLive ? '#dbeafe' : '#f1f5f9',
              color: isLive ? '#1d4ed8' : '#475569',
            }}
          >
            Live Weather
          </button>
        </div>

        {isOpen && (
          <div style={styles.popover}>
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
            <div style={styles.popoverFooter}>
              <button type="button" onClick={() => setIsOpen(false)} style={styles.doneBtn}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weather Results */}
      {loading && <p style={styles.mutedText}>Fetching weather data...</p>}
      {error && <p style={styles.errorText}>Error: {error}</p>}

      {!loading && weatherData && (
  <div style={styles.card}>
    <h4 style={styles.cardTitle}>Weather Overview</h4>

    {/* 1. Show live current weather if available */}
    {weatherData.current_weather ? (
      <div style={styles.currentReading}>
        <span style={{ fontSize: '2.5rem' }}>
          {getWeatherDetails(weatherData.current_weather.weathercode).icon}
        </span>
        <div>
          <span style={styles.temp}>{weatherData.current_weather.temperature}°C</span>
          <p style={{ margin: 0, color: '#475569', fontWeight: 500 }}>
            {getWeatherDetails(weatherData.current_weather.weathercode).label}
          </p>
        </div>
      </div>
    ) : weatherData.daily ? (
      /* 2. Fallback: Aggregate Summary for Historical / Date Range Data */
      (() => {
        const summary = calculateDailySummary(weatherData.daily)
        if (!summary) return null

        return (
          <div style={styles.currentReading}>
            <span style={{ fontSize: '2.5rem' }}>
              {summary.dominantWeather.icon}
            </span>
            <div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                <span style={styles.temp}>
                  {summary.avgMaxTemp}°C
                  <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}> (Avg High)</span>
                </span>
                <span style={{ fontSize: '1.1rem', color: '#64748b' }}>
                  {summary.avgMinTemp}°C <span style={{ fontSize: '0.85rem' }}>(Avg Low)</span>
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', color: '#475569', fontWeight: 500 }}>
                Predominantly {summary.dominantWeather.label} across {weatherData.daily.time.length} days
              </p>
            </div>
          </div>
        )
      })()
    ) : null}

    {/* Daily Rows List */}
    {weatherData.daily && (
      <div style={{ ...styles.dailyGrid, marginTop: '1rem' }}>
        {weatherData.daily.time.map((dateStr: string, index: number) => {
          const code = weatherData.daily?.weathercode?.[index] ?? -1
          const weather = getWeatherDetails(code)

          return (
            <div key={dateStr} style={styles.dailyRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>{weather.icon}</span>
                <div>
                  <span style={{ fontWeight: 500, display: 'block' }}>{dateStr}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{weather.label}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span>
                  High: <strong>{weatherData.daily?.temperature_2m_max[index]}°C</strong>
                </span>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>
                  Low: <strong>{weatherData.daily?.temperature_2m_min[index]}°C</strong>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
)}
    </div>
  )
}

// ==========================================
// 3. CLEAN COMPONENT STYLES OBJECT
// ==========================================

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: '1.5rem',
  },
  pickerContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  controlsGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  triggerBtn: {
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
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  liveBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  popover: {
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
    maxWidth: '90vw',
  },
  popoverFooter: {
    padding: '8px',
    textAlign: 'right',
    borderTop: '1px solid #f1f5f9',
  },
  doneBtn: {
    padding: '6px 16px',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  card: {
    marginTop: '1rem',
    padding: '1.25rem',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    margin: '0 0 1rem 0',
    color: '#1e293b',
  },
  currentReading: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  temp: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dailyGrid: {
    display: 'grid',
    gap: '0.75rem',
  },
  dailyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
  },
  mutedText: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  errorText: {
    color: '#ef4444',
  },
}