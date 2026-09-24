import  { useState, useEffect, useMemo } from 'react'
import { Country, City, ICountry, ICity } from 'country-state-city'
import { set, unset, FormField, ObjectInputProps } from 'sanity'
import {  Box, Card, Stack, Text } from '@sanity/ui'
import { Autocomplete } from '@sanity/ui/autocomplete'

interface CountryOption {
  value: string // ISO code
  payload: ICountry
}

interface CityOption {
  value: string // City name
  payload: ICity
}

export function LocationSelector(props: ObjectInputProps) {
  const { value, onChange, schemaType, path } = props

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    (value as any)?.countryCode || ''
  )
  const [selectedCityName, setSelectedCityName] = useState<string>(
    (value as any)?.cityName || ''
  )

  const [allCountries] = useState<ICountry[]>(Country.getAllCountries())
  const [cities, setCities] = useState<ICity[]>([])

  // Convert countries to @sanity/ui Autocomplete option format
  const countryOptions: CountryOption[] = useMemo(() => {
    return allCountries.map((c) => ({
      value: c.isoCode,
      payload: c,
    }))
  }, [allCountries])

  // Convert cities to @sanity/ui Autocomplete option format
  const cityOptions: CityOption[] = useMemo(() => {
    return cities.map((c) => ({
      value: c.name,
      payload: c,
    }))
  }, [cities])

  // Populate cities list when country code changes
  useEffect(() => {
    if (selectedCountryCode) {
      setCities(City.getCitiesOfCountry(selectedCountryCode) || [])
    } else {
      setCities([])
    }
  }, [selectedCountryCode])

  // Handle Country Selection
  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountryCode(countryCode)
    setSelectedCityName('') // Reset city on country change
    setCities(City.getCitiesOfCountry(countryCode) || [])
    onChange(unset()) // Clear stored location state until city is chosen
  }

  // Handle City Selection
  const handleSelectCity = (cityName: string) => {
    setSelectedCityName(cityName)
    
    const cityData = cities.find((c) => c.name === cityName)
    const countryData = allCountries.find((c) => c.isoCode === selectedCountryCode)

    if (cityData && countryData) {
      onChange(
        set({
          countryName: countryData.name,
          countryCode: selectedCountryCode,
          cityName: cityData.name,
          lat: parseFloat(cityData.latitude ?? '0'),
          lng: parseFloat(cityData.longitude ?? '0'),
        })
      )
    }
  }

  return (
    <FormField
      title={schemaType.title}
      description={schemaType.description}
      path={path}
    >
      <Stack gap={3} style={{ marginTop: '8px' }}>
        {/* Searchable Country Input */}
        <Box>
          <Text size={1} weight="semibold" style={{ marginBottom: '6px' }}>
            Country
          </Text>
          <Autocomplete
            id="country-search"
            options={countryOptions}
            placeholder="Type country name..."
            value={selectedCountryCode}
            onChange={handleSelectCountry}
            renderOption={(option) => (
              <Card as="button" padding={2}>
                <Text size={1}>{option.payload.name} ({option.payload.isoCode})</Text>
              </Card>
            )}
            filterOption={(query, option) =>
              option.payload.name.toLowerCase().includes(query.toLowerCase())
            }
            renderValue={(value, option) => option?.payload.name || value}
          />
        </Box>

        {/* Searchable City Input */}
        {selectedCountryCode && (
          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '6px' }}>
              City
            </Text>
            <Autocomplete
              id="city-search"
              options={cityOptions}
              placeholder="Type city name..."
              value={selectedCityName}
              onChange={handleSelectCity}
              renderOption={(option) => (
                <Card as="button" padding={2}>
                  <Text size={1}>{option.payload.name}</Text>
                </Card>
              )}
              filterOption={(query, option) =>
                option.payload.name.toLowerCase().includes(query.toLowerCase())
              }
              renderValue={(value) => value}
            />
          </Box>
        )}

        {/* Saved Location Readout */}
        {(value as any)?.lat && (
          <Card padding={3} radius={2} tone="positive">
            <Text size={1}>
              Saved: <strong>{(value as any).cityName}, {(value as any).countryName}</strong> (Lat: {(value as any).lat}, Lng: {(value as any).lng})
            </Text>
          </Card>
        )}
      </Stack>
    </FormField>
  )
}














// import React, { useState, useEffect } from 'react'
// import { Country, City, ICountry, ICity } from 'country-state-city'
// import { set, unset, FormField } from 'sanity'

// export function LocationSelector(props: any) {
//   const { value, onChange, schemaType } = props

//   const [selectedCountryCode, setSelectedCountryCode] = useState<string>('')
//   const [countries] = useState<ICountry[]>(Country.getAllCountries())
//   const [cities, setCities] = useState<ICity[]>([])

//   // On component load, set initial cities if a country code is already stored
//   useEffect(() => {
//     if (value?.countryCode) {
//       setSelectedCountryCode(value.countryCode)
//       setCities(City.getCitiesOfCountry(value.countryCode) || [])
//     }
//   }, [value?.countryCode])

//   const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const code = e.target.value
//     setSelectedCountryCode(code)
    
//     if (code) {
//       const countryCities = City.getCitiesOfCountry(code) || []
//       setCities(countryCities)
//     } else {
//       setCities([])
//       onChange(unset())
//     }
//   }

//   const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const cityName = e.target.value
//     if (!cityName) return

//     const cityData = cities.find((c) => c.name === cityName)
//     const countryData = countries.find((c) => c.isoCode === selectedCountryCode)

//     if (cityData && countryData) {
//      const latVal = parseFloat(cityData.latitude ?? '0')
//       const lngVal = parseFloat(cityData.longitude ?? '0')
//       // Writes object directly to Sanity document state
//       onChange(
//         set({
//           countryName: countryData.name,
//           countryCode: selectedCountryCode,
//           cityName: cityData.name,
//           lat: latVal,
//           lng: lngVal,
//         })
//       )
//     }
//   }

//   return (
//     <FormField
//       title={schemaType.title}
//       description={schemaType.description}
//       path={props.path}
//     >
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
//         {/* Country Dropdown */}
//         <div>
//           <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
//             Country
//           </label>
//           <select
//             value={selectedCountryCode}
//             onChange={handleCountryChange}
//             style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
//           >
//             <option value="">Select a country...</option>
//             {countries.map((c) => (
//               <option key={c.isoCode} value={c.isoCode}>
//                 {c.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* City Dropdown */}
//         {selectedCountryCode && (
//           <div>
//             <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
//               City
//             </label>
//             <select
//               value={value?.cityName || ''}
//               onChange={handleCityChange}
//               style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
//             >
//               <option value="">Select a city...</option>
//               {cities.map((c, index) => (
//                 <option key={`${c.name}-${index}`} value={c.name}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Stored Location Readout */}
//         {value?.lat && (
//           <div style={{ fontSize: '12px', color: '#666', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
//             Saved Coords: {value.cityName}, {value.countryName} ({value.lat}, {value.lng})
//           </div>
//         )}
//       </div>
//     </FormField>
//   )
// }