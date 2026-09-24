import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'                   
import { client } from '../sanity/sanityClient'
import { createImageUrlBuilder } from '@sanity/image-url' 
import '../css/home.css'
import Features from '../components/Features'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Register plugins outside the component
gsap.registerPlugin(ScrollTrigger, useGSAP)

// Initialize using createImageUrlBuilder
const builder = createImageUrlBuilder(client)
const urlFor = (source) => builder.image(source)

export default function Home() {
  const containerRef = useRef()
  const [homeData, setHomeData] = useState(null)
  const [globalSettings, setGlobalSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Multi-document query to pull Home document + Global Settings simultaneously
    const query = `{
      "home": *[_type == "home"][0]{
        ...,
        "featuresList": featuresList[]{
          ...,
          "heading": coalesce(heading, linkedPost->title),
          "text": coalesce(text, linkedPost->excerpt),
          "image": coalesce(image, linkedPost->mainImage),
          "postId": linkedPost->_id
        },
        seo {
          metaTitle,
          metaDescription,
          openGraphImage
        }
      },
      "settings": *[_type == "siteSettings"][0]{
        siteName,
        title,
        seo {
          metaTitle,
          metaDescription,
          openGraphImage
        }
      }
    }`;

    client.fetch(query)
      .then((data) => {
        setHomeData(data.home)
        setGlobalSettings(data.settings)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch home data:', err)
        setLoading(false)
      })
  }, [])

  useGSAP(
    () => {
      // 1. Add body class
      document.body.classList.add('js-enabled')

      // 2. Setup ScrollTrigger Animation
      gsap.to('.sun-glow-wrapper', {
        opacity: 0.2,
        scale: 0.7,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
      
      gsap.from('.hero-content > *', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2,
      });

      // 3. ScrollTrigger: Background Scale (Video Zoom Illusion)
      gsap.to('.hero-image-wrapper', {
        scale: 1.15,               
        duration: 12,              
        ease: 'sine.inOut',        
        force3D: true,             
      })

      // 4. Return cleanup for non-GSAP side effects
      return () => {
        document.body.classList.remove('js-enabled')
      }
    },
    { scope: containerRef }
  )

  const heroImageSrc = homeData?.heroImage 
    ? urlFor(homeData.heroImage).url() 
    : ' '

  // SEO Fallback Hierarchy Calculations
  const seoTitle = 
    homeData?.seo?.metaTitle || 
    homeData?.heroHeading || 
    globalSettings?.seo?.metaTitle || 
    globalSettings?.title || 
    "DestCast";

  const seoDescription = 
    homeData?.seo?.metaDescription || 
    homeData?.heroText || 
    globalSettings?.seo?.metaDescription;

  const ogImageSource = 
    homeData?.seo?.openGraphImage || 
    homeData?.heroImage || 
    globalSettings?.seo?.openGraphImage;

  const ogImageUrl = ogImageSource 
    ? urlFor(ogImageSource).width(1200).height(630).url() 
    : undefined;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        {seoDescription && <meta name="description" content={seoDescription} />}

        {/* Open Graph / Social Sharing Meta Tags */}
        <meta property="og:title" content={seoTitle} />
        {seoDescription && <meta property="og:description" content={seoDescription} />}
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      </Helmet>

      <div ref={containerRef}>
        <section className="hero">
          <div className="hero-image-wrapper">
            <img
              className="hero-image"
              src={heroImageSrc}
              alt="Hero background visual"
            />

            <div className="sun-glow-wrapper">
              <div className="sun-shine"></div>
              <svg viewBox="0 0 100 100" className="sun-icon">
                <g strokeLinecap="round" strokeLinejoin="round">
                  <circle
                    cx="50"
                    cy="50"
                    r="18"
                    className="sun-body"
                    fill="#FFDE59"
                    stroke="#FF914D"
                    strokeWidth="4"
                  />

                  <g className="sun-rays" stroke="#FF914D" strokeWidth="4">
                    <line x1="50" y1="19" x2="50" y2="28" />
                    <line x1="50" y1="72" x2="50" y2="81" />
                    <line x1="19" y1="50" x2="28" y2="50" />
                    <line x1="72" y1="50" x2="81" y2="50" />
                    <line x1="28" y1="28" x2="34" y2="34" />
                    <line x1="66" y1="66" x2="72" y2="72" />
                    <line x1="28" y1="72" x2="34" y2="66" />
                    <line x1="66" y1="34" x2="72" y2="28" />
                  </g>
                </g>
              </svg>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="hero-title">
              {homeData?.heroHeading || 'Adventure'}
            </h1>
            <p>
              {homeData?.heroText || 'Discover the world with us and decide your next intended path'}
            </p>
            <Link 
              className="hero-button"
              to={homeData?.heroCtaLink || '/posts'}
            >
              {homeData?.heroCtaText || 'Start Discovering'}
            </Link>
          </div>
        </section>
      </div>
      <Features data={homeData} />
    </>
  )
}