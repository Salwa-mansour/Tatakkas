import React, { useEffect, useRef } from 'react'
import { DateRange } from 'react-date-range'
import { format ,parseISO,isValid } from 'date-fns'
import { UseTripWeatherReturn, getWeatherDetails, calculateDailySummary } from '../hooks/useTripWeather'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

interface SubComponentProps {
  weather: UseTripWeatherReturn
}

export function WeatherDatePicker({ weather }: SubComponentProps) {
  const startDateStr = format(weather.range[0].startDate, 'MMM dd')
  const endDateStr = format(weather.range[0].endDate, 'MMM dd')
  const isSingleDay = startDateStr === endDateStr
  // Check if a valid, distinct range is selected
  const hasRangeSet = startDateStr && endDateStr && !isSingleDay

  const handleDateSelect = (ranges: any) => {
    weather.handleSelect(ranges)
    const selection = ranges.selection || Object.values(ranges)[0]

    if (selection) {
      const { startDate, endDate } = selection
      if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
        weather.setIsOpen(false)
      }
    }
  }

  const handleClosePopover = () => {
    weather.setIsOpen(false)
  }

  return (
    <div className="weather-box ">
      {/* Input Trigger */}
      <div
        className="date-text box"
        id="date-toggler"
        onClick={() => weather.setIsOpen(!weather.isOpen)}
        role="button"
        tabIndex={0}
      >
        <span className="inputText">
          {hasRangeSet
            ? `${startDateStr} - ${endDateStr}`
            : 'Search the weather in specific period'}
        </span>

        <div role="icon" className="search-icon">
          <svg viewBox="5 0 100 100" width="230" height="200" className="icon-path cloud-search-path">
            <g strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M 22,68 A 18,18 0 0,1 22,32 A 24,24 0 0,1 67,20 A 21,21 0 0,1 88,68 Z"
                fill="#BAE6FD"
                stroke="#38BDF8"
                strokeWidth="4"
              />
              <g stroke="#0284C7" strokeWidth="4">
                <circle cx="68" cy="64" r="13" fill="#FFFFFF" />
                <line x1="77" y1="73" x2="90" y2="86" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Calendar Popover with Backdrop Overlay */}
      {weather.isOpen && (
        <div className="date-popover-wrapper">
          {/* 1. Backdrop Overlay (Clicking closes calendar) */}
         

          {/* 2. Calendar Content */}
          <div className="date-popover">
             <div
                className="mobile-overlay"
                onClick={handleClosePopover}
                role="button"
                aria-label="Close date picker"
                tabIndex={-1}
              />
            <DateRange
              ranges={weather.range}
              onChange={handleDateSelect}
              showDateDisplay={false}
              showMonthAndYearPickers={true}
              months={1}
              direction="vertical"
              preventSnapRefocus={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// 2. Weather Overview Summary (Current Reading or Aggregate Summary)
export function WeatherSummary({ weather }: SubComponentProps) {
  if (weather.loading) return <p className="weather-message">Fetching weather data...</p>
  if (weather.error) return <p className="weather-message error">Error: {weather.error}</p>
  if (!weather.weatherData) return null

  const { weatherData } = weather

  // Determine metrics based on current vs aggregate daily mode
  let mainIcon: React.ReactNode = null
  let tempHigh: number = 0
  let tempLow: number | null = null
  let precip: number = 0
  let humidity: number = 0
  let windSpeed: number = 0

  if (weatherData.current_weather) {
    const code = weatherData.current_weather.weathercode
    mainIcon = getWeatherDetails(code).icon
    tempHigh = Math.round(weatherData.current_weather.temperature)
    tempLow = weatherData.daily?.temperature_2m_min?.[0] 
      ? Math.round(weatherData.daily.temperature_2m_min[0]) 
      : null
    precip = weatherData.daily?.precipitation_probability_max?.[0] ?? 0
    humidity = weatherData.daily?.relative_humidity_2m_mean?.[0] ?? 0
    windSpeed = Math.round(
      weatherData.current_weather.windspeed ?? weatherData.daily?.windspeed_10m_max?.[0] ?? 0
    )
  } else if (weatherData.daily) {
    const summary = calculateDailySummary(weatherData.daily)
    if (!summary) return null

    mainIcon = summary.dominantWeather.icon
    tempHigh = Math.round(summary.avgMaxTemp)
    tempLow = Math.round(summary.avgMinTemp)

    const daily = weatherData.daily
    precip = daily.precipitation_probability_max
      ? Math.round(daily.precipitation_probability_max.reduce((a, b) => a + b, 0) / daily.precipitation_probability_max.length)
      : 0
    humidity = daily.relative_humidity_2m_mean
      ? Math.round(daily.relative_humidity_2m_mean.reduce((a, b) => a + b, 0) / daily.relative_humidity_2m_mean.length)
      : 0
    windSpeed = daily.windspeed_10m_max
      ? Math.round(daily.windspeed_10m_max.reduce((a, b) => a + b, 0) / daily.windspeed_10m_max.length)
      : 0
  }

  return (
    <div className="weather-card" title='Weather Overview'>
      {/* Top Row: Main Illustration on Left, Temperatures on Right */}
      <div className="weather-main-row">
        <div className="weather-hero-icon">
          {mainIcon}
        </div>

        <div className="weather-temp-display">
          <span className="temp-main">{tempHigh}°</span>
          {tempLow !== null && (
            <>
              <span className="temp-divider">/</span>
              <span className="temp-sub">{tempLow}°</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row: 3 Metrics */}
      <ul className="weather-metrics-grid">
        <li className="metric-item">
          <span className="metric-icon">🌧️</span>
          <span className="metric-value">{precip}%</span>
          <span className="metric-label">Precipitation</span>
        </li>

        <li className="metric-item">
          <span className="metric-icon">💧</span>
          <span className="metric-value">{humidity}%</span>
          <span className="metric-label">Humidity</span>
        </li>

        <li className="metric-item">
          <span className="metric-icon">💨</span>
          <span className="metric-value">{windSpeed}km/h</span>
          <span className="metric-label">Wind Speed</span>
        </li>
      </ul>
    </div>
  )
}

// 3. Daily Forecast List
export function DailyCast({ weather }: SubComponentProps) {
  if (!weather.weatherData?.daily) return null

  const { daily } = weather.weatherData

  return (
    <ul className="daily-cast-list">
      {daily.time.map((dateStr: string, index: number) => {
        const code = daily.weathercode?.[index] ?? -1
        const weatherDetails = getWeatherDetails(code)

        // Parse raw date string and format as Month and Day (e.g., "Sep 11")
        const parsedDate = parseISO(dateStr)
        const formattedDate = isValid(parsedDate) ? format(parsedDate, 'MMM d') : dateStr

        const tempMax = Math.round(daily.temperature_2m_max[index])
        const tempMin = Math.round(daily.temperature_2m_min[index])

        return (
          <li key={dateStr} className="daily-cast-row">
            <span className="daily-day">{formattedDate}</span>

            <div className="daily-state">
             <span className="daily-icon"> {weatherDetails.icon}</span>
               <span className="daily-label">{weatherDetails.label}</span>

            </div>

           
            <span className="daily-temp daily-temp-high">
              {tempMax >= 0 ? `+${tempMax}` : tempMax}°
            </span>

            <span className="daily-temp daily-temp-low">
              {tempMin >= 0 ? `+${tempMin}` : tempMin}°
            </span>
          </li>
        )
      })}
    </ul>
  )
}


