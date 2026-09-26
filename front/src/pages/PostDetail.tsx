import { useEffect, useState,useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { client } from '../sanity/sanityClient'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faList} from '@fortawesome/free-solid-svg-icons'
import { Post } from './Posts'
import { customPortableTextComponents } from '../components/PortableTextComponents'

import { urlFor } from '../utils/urlFor'
import '../css/postDetail.css'
import { LocationCoords, useTripWeather } from '../hooks/useTripWeather'
import { WeatherDatePicker, WeatherSummary, DailyCast } from '../components/TripWeatherComponents'
import WeatherPop from '../components/WeatherPop'
import { Helmet } from 'react-helmet-async';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import RelatedPosts from '../components/RelatedPosts'
import ProgressiveImage from '../components/ProgressiveImage'

gsap.registerPlugin(ScrollTrigger);

interface Location {
  lng: number
  lat: number
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const weather = useTripWeather(location!);
  const [isPopOpen, setIsPopOpen] = useState<boolean>(false);
   // 1. We change this ref to wrap the overall container holding BOTH the grid items
  const mainWrapperRef = useRef(null); 
  const asideRef = useRef(null);
  const articleContentRef = useRef(null); // Dedicated trigger for text height tracking

useGSAP(() => {
  if (loading || !post) return;

  let mm = gsap.matchMedia();

  mm.add("(min-width: 867px)", () => {
    ScrollTrigger.create({
      trigger: articleContentRef.current, // Triggers based on the article content container
      start: "top top+=20",               // When the text area hits the top of viewport (+20px)
      end: "bottom bottom",               // Until the text area finishes scrolling
      toggleClass: { 
        targets: asideRef.current, 
        className: "is-stuck"             // Adds this class when inside the trigger zone, removes it outside
      },
      // markers: true,                  
    });
  });

  return () => mm.revert(); 
}, { scope: mainWrapperRef, dependencies: [loading, post] });
  useEffect(() => {
    client
      .fetch(
        `*[_type == "post" && _id == $id][0]{ 
          _id, 
          slug, 
          title, 
          body, 
          locationDetails, 
          mainImage, 
          "seo": {
            "metaTitle": coalesce(seo.metaTitle, title),
            "metaDescription": coalesce(seo.metaDescription, pt::text(body)[0...160]),
            "openGraphImage": coalesce(seo.openGraphImage, mainImage)
          } 
        }`,
        { id }
      )
      .then((data: Post) => {
        setPost(data)
        if (data?.locationDetails?.lat && data?.locationDetails?.lng) {
          setLocation(data.locationDetails)
        }
        setLoading(false)
        // 3. Give React one tick to finish rendering the DOM nodes before refreshing positions
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
     
  
  }, [id])

  // Safely compute SEO values directly from the loaded post state
  const seoTitle = post?.seo?.metaTitle || post?.title || "DestCast";
  const seoDescription = post?.seo?.metaDescription;
  const ogImageUrl = post?.seo?.openGraphImage 
    ? urlFor(post.seo.openGraphImage).width(600).url() 
    : undefined;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        {seoDescription && (
          <meta name="description" content={seoDescription} />
        )}

        {/* Open Graph / Social Sharing Meta Tags */}
        <meta property="og:title" content={seoTitle} />
        {seoDescription && <meta property="og:description" content={seoDescription} />}
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      </Helmet>

      <section className="postDetail-container container">
        {loading ? (
          <p className="loading-text">Loading post...</p>
        ) : !post ? (
          <p className="error-text">Post not found.</p>
        ) : (
          <div ref={mainWrapperRef} className="main-wrapper">
            <Link to="/posts" className="back-link" title="Back to All Posts">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="back-caret-icon"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>

            <article className="single-page-content">
              <header className="post-header" role="post header">
                {post.mainImage?.asset && (
                  <figure className="main-img">
                   
                    <ProgressiveImage imageObject={post.mainImage} alt={post?.title} isPrior={true} />
                  {post.mainImage?.imageAttribution && (
                    <figcaption 
                      className="image-attribution"
                      dangerouslySetInnerHTML={{ __html: post.mainImage.imageAttribution }} 
                    />
                  )}
                  </figure>
                )}
                <div className="post-header__data">
                  <h1 className="post-title">{post.title}</h1>
                  {post.locationDetails && (
                    <h6 className="location">
                       📍 {post.locationDetails.cityNameAr ||post.locationDetails.cityName}, {post.locationDetails.countryNameAr ||post.locationDetails.countryName}
                  
                    </h6>
                  )}
                </div>
              </header>

              <div ref={asideRef} className="weather-quiery">
                <div className="weather-inline-wrapper">
                  <div className="weather-summary-wrapper box">
                    <WeatherSummary weather={weather} />
                    <button
                      className="mobile-only-btn"
                      onClick={() => setIsPopOpen(true)}
                    >
                      <FontAwesomeIcon icon={faList} /> Show daily cast
                    </button>
                  </div>
                  <div className="datePicker-wrapper">
                    <WeatherDatePicker weather={weather} />
                  </div>
                  <div className="desktop-daily-cast box">
                    <DailyCast weather={weather} />
                  </div>
                </div>

                <WeatherPop
                  isOpen={isPopOpen}
                  onClose={() => setIsPopOpen(false)}
                  weather={weather}
                />
              </div>

              <div ref={articleContentRef} className="post">
                  <div className='text-container'>
                        {post.body ? (
                          <PortableText
                            value={post.body}
                            components={customPortableTextComponents}
                          />
                        ) : (
                          <p>لا يوجد محتوى</p>
                        )}
                  </div>
              </div>
            </article>
          </div>
        )}
      </section>
      <section>
        <RelatedPosts currentSlug={post?.slug.current} country={post?.locationDetails?.countryName} />
      </section>
    </>
  )
}