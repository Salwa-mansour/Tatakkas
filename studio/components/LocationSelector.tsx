import { useState, useEffect, useMemo } from 'react'
import { Country, City, ICountry, ICity } from 'country-state-city'
import { set, FormField, ObjectInputProps } from 'sanity'
import { Box, Card, Stack, Text, TextInput } from '@sanity/ui'
import { Autocomplete } from '@sanity/ui/autocomplete'

interface ExtendedCountry extends ICountry {
  nameAr?: string
}

interface CountryOption {
  value: string 
  payload: ExtendedCountry
}

interface CityOption {
  value: string 
  payload: ICity
}

function normalizeArabic(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[أإآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim()
}

export function LocationSelector(props: ObjectInputProps) {
  const { value, onChange, schemaType, path } = props

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    (value as any)?.countryCode || ''
  )
  const [selectedCityName, setSelectedCityName] = useState<string>(
    (value as any)?.cityName || ''
  )
  const [manualCityNameAr, setManualCityNameAr] = useState<string>(
    (value as any)?.cityNameAr || ''
  )

  const [allCountries, setAllCountries] = useState<ExtendedCountry[]>([])
  const [cities, setCities] = useState<ICity[]>([])

  // 1. Initialize Countries offline using Native Browser DisplayNames
  useEffect(() => {
    try {
      const countryTranslator = new Intl.DisplayNames(['ar'], { type: 'region' })
      const rawCountries = Country.getAllCountries()
      
      const enhancedCountries = rawCountries.map((c) => {
        let nameAr = c.name
        try {
          nameAr = countryTranslator.of(c.isoCode) || c.name
        } catch {
          nameAr = c.name
        }
        return { ...c, nameAr }
      })
      setAllCountries(enhancedCountries)
    } catch {
      setAllCountries(Country.getAllCountries())
    }
  }, [])

  // 2. Load cities offline from local node_modules memory storage
  useEffect(() => {
    if (!selectedCountryCode) {
      setCities([])
      return
    }
    const rawCities = City.getCitiesOfCountry(selectedCountryCode) || []
    setCities(rawCities)
  }, [selectedCountryCode])

  // Conversion logic mappings for autocomplete selectors
  const countryOptions: CountryOption[] = useMemo(() => {
    return allCountries.map((c) => ({
      value: `${c.name} ${c.nameAr || ''} (${c.isoCode})`,
      payload: c,
    }))
  }, [allCountries])

  const cityOptions: CityOption[] = useMemo(() => {
    return cities.map((c) => ({
      value: c.name, 
      payload: c,
    }))
  }, [cities])

  // Handle Country Updates
  const handleSelectCountry = (inputValue: string) => {
    const targetOption = countryOptions.find((o) => o.value === inputValue)
    const countryCode = targetOption ? targetOption.payload.isoCode : ''

    if (countryCode) {
      setSelectedCountryCode(countryCode)
      setSelectedCityName('') 
      setManualCityNameAr('')
      
      const countryData = allCountries.find((c) => c.isoCode === countryCode)
      onChange(
        set({
          countryName: countryData?.name || '',
          countryNameAr: countryData?.nameAr || countryData?.name || '',
          countryCode: countryCode,
          cityName: '',
          cityNameAr: '',
          lat: 0,
          lng: 0,
        })
      )
    }
  }

  // Handle City Selection (Extracting coordinates automatically)
  const handleSelectCity = (inputValue: string) => {
    const targetOption = cityOptions.find((o) => o.value === inputValue)
    const cityName = targetOption ? targetOption.payload.name : ''
    
    if (!cityName) return
    
    setSelectedCityName(cityName)
    const cityData = cities.find((c) => c.name === cityName)
    const countryData = allCountries.find((c) => c.isoCode === selectedCountryCode)

    if (cityData && countryData) {
      onChange(
        set({
          ...value,
          countryName: countryData.name,
          countryNameAr: countryData.nameAr || countryData.name,
          countryCode: selectedCountryCode,
          cityName: cityData.name,
          lat: parseFloat(cityData.latitude ?? '0'),
          lng: parseFloat(cityData.longitude ?? '0'),
        })
      )
    }
  }

  // Handle Manual Arabic Input Changes
  const handleManualCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setManualCityNameAr(inputVal)
    
    onChange(
      set({
        ...value,
        cityNameAr: inputVal // Storing custom Arabic text alongside system records
      })
    )
  }

  const currentCountry = allCountries.find((c) => c.isoCode === selectedCountryCode)
  const currentCity = cities.find((c) => c.name === selectedCityName)

  return (
    <FormField title={schemaType.title} description={schemaType.description} path={path}>
      <Stack gap={3} style={{ marginTop: '8px' }} dir="rtl">
        
        {/* Country Picker */}
        <Box>
          <Text size={1} weight="semibold" style={{ marginBottom: '6px' }}>الدولة (Country)</Text>
          <Autocomplete
            id="country-search"
            options={countryOptions}
            placeholder="ابحث عن الدولة..."
            value={currentCountry ? `${currentCountry.name} ${currentCountry.nameAr || ''} (${currentCountry.isoCode})` : ''}
            onChange={handleSelectCountry}
            renderOption={(option) => (
              <Card as="button" padding={2}>
                <Text size={1}>{option.payload.nameAr} ({option.payload.name})</Text>
              </Card>
            )}
            filterOption={(query, option) => {
              const cleanQuery = normalizeArabic(query)
              return option.payload.name.toLowerCase().includes(cleanQuery) || 
                     normalizeArabic(option.payload.nameAr || '').includes(cleanQuery)
            }}
            renderValue={(val, option) => option?.payload.nameAr || val}
          />
        </Box>

        {/* City Autocomplete (For Technical Coordinates Retrieval) */}
        {selectedCountryCode && (
          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '6px' }}>اختر المدينة من القائمة (Select City for Coordinates)</Text>
            <Autocomplete
              id="city-search"
              options={cityOptions}
              placeholder="اختر المدينة لتحديد خطوط الطول والعرض..."
              value={currentCity ? currentCity.name : ''}
              onChange={handleSelectCity}
              renderOption={(option) => (
                <Card as="button" padding={2}>
                  <Text size={1}>{option.payload.name}</Text>
                </Card>
              )}
              filterOption={(query, option) =>
                option.payload.name.toLowerCase().includes(query.toLowerCase())
              }
              renderValue={(val) => val}
            />
          </Box>
        )}

        {/* New Additional Manual Text Input for Arabic Custom Name */}
        {selectedCityName && (
          <Box>
            <Text size={1} weight="semibold" style={{ marginBottom: '6px' }}>اسم المدينة باللغة العربية (City Name in Arabic)</Text>
            <TextInput
              placeholder="اكتب اسم المدينة باللغة العربية هنا..."
              value={manualCityNameAr}
              onChange={handleManualCityChange}
              style={{ padding: '10px' }}
            />
          </Box>
        )}

        {/* Saved Location Summary Metadata Readout */}
        {(value as any)?.lat && (
          <Card padding={3} radius={2} tone="positive">
            <Text size={1}>
              الموقع المحفوظ: <strong>{(value as any).cityNameAr || (value as any).cityName}، {currentCountry?.nameAr || (value as any).countryNameAr || (value as any).countryName}</strong> 
              <br />
              <span style={{ fontSize: '11px', opacity: 0.8 }}>
                (خط عرض: {(value as any).lat}، خط طول: {(value as any).lng})
              </span>
            </Text>
          </Card>
        )}
      </Stack>
    </FormField>
  )
}
