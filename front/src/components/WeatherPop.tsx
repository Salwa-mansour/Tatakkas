import { useRef,useEffect } from 'react'
import { UseTripWeatherReturn } from '../hooks/useTripWeather'
import { WeatherDatePicker, WeatherSummary, DailyCast } from './TripWeatherComponents'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface WeatherPopProps {
  isOpen: boolean
  onClose: () => void
  weather: UseTripWeatherReturn
}

export default function WeatherPop({ isOpen, onClose, weather }: WeatherPopProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }

      // Cleanup when component unmounts just in case
      return () => {
        document.body.style.overflow = ''
      }
    }, [isOpen])

  // Initialize GSAP Timeline inside useGSAP
  useGSAP(() => {
    if (!overlayRef.current || !contentRef.current) return

    // Create paused timeline
    tlRef.current = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        if (overlayRef.current) overlayRef.current.style.display = 'none'
      }
    })

    // Define simple fade + scale sequence
    tlRef.current
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
        onStart: () => {
          if (overlayRef.current) overlayRef.current.style.display = 'block'
        }
      })
      .fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' },
        '-=0.15'
      )
  }, { scope: overlayRef }) // Scopes selectors and handles cleanup automatically

  // Toggle play/reverse whenever isOpen changes
  useGSAP(() => {
    if (!tlRef.current) return

    if (isOpen) {
      tlRef.current.play()
    } else {
      tlRef.current.reverse()
    }
  }, [isOpen])

  return (
    <div
      className="weather-pop-overlay"
      ref={overlayRef}
      onClick={onClose}
      style={{ opacity: 0, display: 'none' }}
    >
      <div
        className="weather-pop-content"
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <WeatherDatePicker weather={weather} />
        <WeatherSummary weather={weather} />
        <DailyCast weather={weather} />
      </div>
    </div>
  )
}