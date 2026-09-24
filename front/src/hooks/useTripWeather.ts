import { useState, useEffect } from 'react'
import { RangeKeyDict } from 'react-date-range'
import { format, addYears } from 'date-fns'

export interface LocationCoords {
  lat: number
  lng: number
}

export interface OpenMeteoResponse {
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
    precipitation_probability_max?: number[]
    relative_humidity_2m_mean?: number[]
    windspeed_10m_max?: number[]
  }
}

export interface WeatherInfo {
  label: string
  icon: string
}

export interface DailySummary {
  avgMaxTemp: number
  avgMinTemp: number
  dominantWeather: WeatherInfo
}

export function getWeatherDetails(code: number): WeatherInfo {
  switch (code) {
    case 0: return { label: 'Clear Sky', icon: '☀️' }
    case 1: return { label: 'Mainly Clear', icon: '🌤️' }
    case 2: return { label: 'Partly Cloudy', icon: '⛅' }
    case 3: return { label: 'Overcast', icon: '☁️' }
    case 45: case 48: return { label: 'Foggy', icon: '🌫️' }
    case 51: case 53: case 55: return { label: 'Drizzle', icon: '🌧️' }
    case 61: case 63: case 65: return { label: 'Rain', icon: '🌧️' }
    case 66: case 67: return { label: 'Freezing Rain', icon: '🌧️❄️' }
    case 71: case 73: case 75: case 77: return { label: 'Snowfall', icon: '❄️' }
    case 80: case 81: case 82: return { label: 'Rain Showers', icon: '🌦️' }
    case 85: case 86: return { label: 'Snow Showers', icon: '🌨️' }
    case 95: return { label: 'Thunderstorm', icon: '⛈️' }
    case 96: case 99: return { label: 'Thunderstorm w/ Hail', icon: '⛈️🧊' }
    default: return { label: 'Unknown', icon: '🌡️' }
  }
}

export function calculateDailySummary(daily: NonNullable<OpenMeteoResponse['daily']>): DailySummary | null {
  if (!daily.time || daily.time.length === 0) return null

  const count = daily.time.length
  const sumMax = daily.temperature_2m_max.reduce((acc, temp) => acc + temp, 0)
  const sumMin = daily.temperature_2m_min.reduce((acc, temp) => acc + temp, 0)

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

export function useTripWeather(location: LocationCoords) {
  const today = new Date()
  const oneYearFromNow = addYears(today, 1)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: today,
    endDate: today,
  })

  const [weatherData, setWeatherData] = useState<OpenMeteoResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isHistoricalFallback, setIsHistoricalFallback] = useState<boolean>(false)

  const [range, setRange] = useState([
    {
      startDate: today,
      endDate: today,
      key: 'selection',
    },
  ])

  const isTodaySelected = (start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false
    const todayStr = format(today, 'yyyy-MM-dd')
    return format(start, 'yyyy-MM-dd') === todayStr && format(end, 'yyyy-MM-dd') === todayStr
  }

  const isLive = isTodaySelected(dateRange.startDate, dateRange.endDate)

  const handleSelect = (ranges: RangeKeyDict): void => {
    const selection = ranges.selection
    const startDate = selection.startDate
    const endDate = selection.endDate

    // Update UI range state for react-date-range display
    setRange([{ startDate: startDate || today, endDate: endDate || today, key: 'selection' }])

    // Only commit dateRange state when BOTH start and end dates are picked
    if (startDate && endDate) {
      setDateRange({ startDate, endDate })
    }
  }

  const handleResetToToday = (): void => {
    setRange([{ startDate: today, endDate: today, key: 'selection' }])
    setDateRange({ startDate: today, endDate: today })
    setIsOpen(false)
  }

  useEffect(() => {
    // 1. Guard check: Both startDate and endDate must exist
    if (!location?.lat || !location?.lng || !dateRange.startDate || !dateRange.endDate) return

    const { startDate, endDate } = dateRange

    // 2. Guard check: Prevent requesting when dates are identical (in range mode)
    //    Allow single-day fetch ONLY if the selected date is today
    const startStr = format(startDate, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')
    const todayStr = format(new Date(), 'yyyy-MM-dd')

    const isSingleDay = startStr === endStr
    const isToday = isSingleDay && startStr === todayStr

    if (isSingleDay && !isToday) {
      // User has only clicked the first date of a multi-day range; wait for second click
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setIsHistoricalFallback(false)

    const todayDate = new Date()
    const maxForecastDate = new Date()
    maxForecastDate.setDate(todayDate.getDate() + 15)

    const maxForecastStr = format(maxForecastDate, 'yyyy-MM-dd')

    const isPast = endStr < todayStr
    const isBeyondForecast = endStr > maxForecastStr

    const dailyMetrics = [
      'temperature_2m_max',
      'temperature_2m_min',
      'weathercode',
      'precipitation_probability_max',
      'relative_humidity_2m_mean',
      'windspeed_10m_max'
    ].join(',')

    let url = ''

    if (isBeyondForecast) {
      const pastStart = new Date(startDate)
      pastStart.setFullYear(pastStart.getFullYear() - 1)

      const pastEnd = new Date(endDate)
      pastEnd.setFullYear(pastEnd.getFullYear() - 1)

      const fallbackStartStr = format(pastStart, 'yyyy-MM-dd')
      const fallbackEndStr = format(pastEnd, 'yyyy-MM-dd')

      setIsHistoricalFallback(true)

      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lng}&start_date=${fallbackStartStr}&end_date=${fallbackEndStr}&daily=${dailyMetrics}&timezone=auto`
    } else if (isPast) {
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lng}&start_date=${startStr}&end_date=${endStr}&daily=${dailyMetrics}&timezone=auto`
    } else if (isToday) {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true&daily=${dailyMetrics}&timezone=auto`
    } else {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&start_date=${startStr}&end_date=${endStr}&daily=${dailyMetrics}&timezone=auto`
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

  return {
    today,
    oneYearFromNow,
    isOpen,
    setIsOpen,
    range,
    weatherData,
    loading,
    error,
    isLive,
    isHistoricalFallback,
    handleSelect,
    handleResetToToday,
  }
}

export type UseTripWeatherReturn = ReturnType<typeof useTripWeather>