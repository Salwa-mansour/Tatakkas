export interface DateRangeSelection {
  startDate: Date
  endDate: Date
  isLiveForecast: boolean
}

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
  }
}