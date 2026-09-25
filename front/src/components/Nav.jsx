import { useState, useRef,useEffect } from 'react'
import { client } from '../sanity/sanityClient';
import { Link, useLocation } from 'react-router-dom'
import { NavbarSearch } from './NavbarSearch'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { urlFor } from '../utils/urlFor';

function Nav() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
   const [siteData, setSiteData] = useState({});
  
    useEffect(() => {
      const query = `*[_type == "siteSettings"][0]{
        siteName,
        siteLogo,
       
      }`;
  
      client
        .fetch(query)
        .then((data) => {
          if (data?.siteName) {
            const siteLogo = urlFor(data.siteLogo).width(300).url();
            setSiteData({
              siteName: data.siteName,
              siteLogo,
          
            });
          }
        })
        .catch((err) => console.error('Failed to fetch site data:', err));
    }, []);

  // 1. Handle body overflow toggle whenever isOpen changes
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
  useGSAP(
    () => {
      // 1. Create a matchMedia instance scoped to this component
      const mm = gsap.matchMedia()

      // 2. Define the mobile media query
      mm.add('(max-width: 866px)', () => {
        const tl = gsap.timeline({ paused: true })

        tl.to('.nav-container', {
          x: '0%',
          duration: 0.5,
          ease: 'power3.out',
        })
       
          .to(
            '#line-2',
            {
              opacity: 0,
              x: -20,
              duration: 0.2,
            },
            '<',
          )
          .to(
            '#line-1',
            {
              rotate: 45,
              transformOrigin: '50% 50%',
              y: 15,
              duration: 0.3,
            },
            '<',
          )
          .to(
            '#line-3',
            {
              rotate: -45,
              transformOrigin: '50% 50%',
              y: -15,
              duration: 0.3,
            },
            '<',
          )
          .from(
            '.nav-items li',
            {
              opacity: 0,
              y: 30,
              duration: 0.4,
              stagger: 0.1,
              ease: 'back.out(1.7)',
            },
            '-=0.2',
          )

        timelineRef.current = tl

        // Return cleanup for mobile context if needed
        return () => {
          timelineRef.current = null
        }
      })
    },
    { scope: containerRef },
  )

  const toggleMenu = () => {
    // Only execute timeline if it exists (i.e., we are on mobile <= 766px)
    if (!timelineRef.current) return

    if (!isOpen) {
      timelineRef.current.timeScale(1).play()
    } else {
      timelineRef.current.timeScale(2).reverse()
    }
    setIsOpen(!isOpen)
  }

  const handleLinkClick = () => {
    if (isOpen && timelineRef.current) {
      timelineRef.current.timeScale(2).reverse()
      setIsOpen(false)
    }
  }

  return (
    <nav className={`nav `} ref={containerRef}>
      <Link to="/" className="logo" onClick={handleLinkClick}>
        <img src={siteData.siteLogo} alt={siteData.siteName} />
      </Link>

      <button className="toggle-nav" onClick={toggleMenu} aria-label="Toggle Navigation">
        <svg viewBox="0 0 100 100" width="200" height="200" className="humbergur-icon">
          <g stroke="#4790ff" strokeWidth="6" strokeLinecap="round">
            <line x1="25" y1="35" x2="75" y2="35" id="line-1" />
            <line x1="25" y1="50" x2="75" y2="50" id="line-2" />
            <line x1="25" y1="65" x2="75" y2="65" id="line-3" />
          </g>
        </svg>
      </button>

      <div className="nav-container">
        <ul className="nav-items">
          <li>
            <Link to="/posts" onClick={handleLinkClick}>
              discover
            </Link>
          </li>
          <li>
            <a href="/about " onClick={handleLinkClick}>
              about
            </a>
          </li>
          <li>
            <a href="/contact" onClick={handleLinkClick}>
              Contact
            </a>
          </li>
          <li className='search-item'>
            <NavbarSearch hideMobileNav={handleLinkClick}/>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Nav