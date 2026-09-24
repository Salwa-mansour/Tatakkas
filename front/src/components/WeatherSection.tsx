// import { useState } from 'react'
// import DateRangePicker, { DateRangeSelection } from './DateRangePicker'
// import { format } from 'date-fns'

// export  function WeatherSection() {
//   const [selectedRange, setSelectedRange] = useState<DateRangeSelection>({
//     startDate: new Date(),
//     endDate: new Date(),
//     isLiveForecast: true,
//   })

//   const handleDateChange = (selection: DateRangeSelection) => {
//     setSelectedRange(selection)
//     // Next step: Call Open-Meteo here using selection.startDate and selection.endDate
//   }

//   return (
//     <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
//       <h3>Select Trip Range</h3>
//       <DateRangePicker onRangeChange={handleDateChange} />

//       <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#475569' }}>
//         <p><strong>Start Date:</strong> {format(selectedRange.startDate, 'yyyy-MM-dd')}</p>
//         <p><strong>End Date:</strong> {format(selectedRange.endDate, 'yyyy-MM-dd')}</p>
//         <p><strong>Mode:</strong> {selectedRange.isLiveForecast ? 'Live Forecast (Today)' : 'Historical Archive Range'}</p>
//       </div>
//     </div>
//   )
// }