import { useRef } from 'react'
import gsap from 'gsap'
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'                 
import { Link } from 'react-router-dom'
import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from '../sanity/sanityClient' // Adjust path if needed to match your project

import '../css/features.css'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP)

const builder = createImageUrlBuilder(client)
const urlFor = (source) => builder.image(source)

function Features({data}) {
     const containerRef = useRef()
     const headingRef = useRef(null);

        useGSAP(() => {

          gsap.from(headingRef.current.children, {
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 85%',
            }
          });
        });
        useGSAP(
            () => {
            // Create a GSAP MatchMedia instance
            const mm = gsap.matchMedia();
            gsap.set(".cloudy-bg", { opacity: 0 });
            gsap.set(".rain-path", { yPercent: -30, opacity: 0 });
            gsap.set(".snow-path", { yPercent: -30, opacity: 0 });
            gsap.set(".cloud-path", { xPercent: -30,opacity: 0 });
            // Add conditions for Mobile and Desktop
            mm.add(
                {
                    isDesktop: '(min-width: 868px)',
                    isMobile: '(max-width: 867px)',
                },
                (context) => {
                // Destructure boolean conditions
                const { isDesktop } = context.conditions;

                    if (isDesktop) {
                        desktopAnimations()
                    } else {
                        mobileAnimations()
                    }
                });
            
            },
            { scope: containerRef } // Scopes selector queries automatically
        );
     
    // Define mobile animations inside or access scoped queries via gsap.utils.toArray
const mobileAnimations = () => {
  const allFeatures = gsap.utils.toArray('.feature', containerRef.current);

  // 1. Entrance animations for individual cards on mobile
  allFeatures.forEach((card) => {
    gsap.from(card, {
      y: 60,
      opacity: 0.5,
      scale: 0.5,
      rotate: 15,
      duration: 0.7,
      ease: 'elastic.out(1, 0.75)',
      scrollTrigger: {
        trigger: card,
        start: 'top 95%',
        toggleActions: 'play none none reverse',
        invalidateOnRefresh: true,
      },
    });
  });

  // 2. Set initial setup positions
  gsap.set(".sun-icon-item", {
    opacity: 1,
    motionPath: {
      path: "#linerPath",
      align: "#linerPath",
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 0,
    },
  });

  gsap.set(".cloud-icon-item", {
    opacity: 0,
    motionPath: {
      path: "#linerPath",
      align: "#linerPath",
      alignOrigin: [0.5, 0.5],
      start: 0.2,
      end: 0.2,
    },
  });

  // 3. Single Master Timeline attached to the parent section (.features)
  const masterMobileTl = gsap.timeline({
 scrollTrigger: {
      trigger: containerRef.current,
      start: 'top top+=100',
      end: 'bottom+=200 70%', // 👈 INCREASED distance significantly to slow it down!
      // pin: true,                  // 👈 Pinning keeps the sequence on screen longer
      scrub: 1,                   // 👈 Slightly higher scrub smoothing
      invalidateOnRefresh: true,
    //  markers: true
    },
  });

  masterMobileTl
    // Phase 1: Sun moves down first section (0 -> 0.2)
    .to('.sun-icon-item', {
      motionPath: {
        path: '#linerPath',
        align: '#linerPath',
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 0.2,
        autoRotate: false,
      },
      ease: 'power1.out',
      duration: 2,
    })

    // Phase 2: Cloud appears, Sun transitions to Cloud (0.2 -> 0.45)
    .to('.cloud-icon-item', {
      motionPath: {
        path: '#linerPath',
        align: '#linerPath',
        alignOrigin: [0.5, 0.5],
        start: 0.2,
        end: 0.45,
        autoRotate: false,
      },
      ease: 'power1.out',
      duration: 2,
    })
    .to('.sun-icon-item', {
      motionPath: {
        path: '#linerPath',
        align: '#linerPath',
        alignOrigin: [0.5, 0.5],
        start: 0.2,
        end: 0.45,
        autoRotate: false,
      },
      ease: 'power1.out',
      duration: 2,
    }, '<')
    .to('.cloud-icon-item', { opacity: 1, duration: 0.1 }, '<')
    .to('.cloud-path', { opacity: 1, duration: 0.1 }, '<')
    .to('.cloud-path', { xPercent: 0, duration:1.5 }, '<')
    .to('.sun-icon-item', { opacity: 0, duration: 0.1 })

    // Phase 3: Cloud moves through middle section (0.45 -> 0.65)
    .to('.cloud-icon-item', {
      motionPath: {
        path: '#linerPath',
        align: '#linerPath',
        alignOrigin: [0.5, 0.5],
        start: 0.45,
        end: 0.65,
        autoRotate: false,
      },
      ease: 'power1.out',
      duration: 2,
    })

    // Phase 4: Rain animation triggers (0.65 -> 0.87)
    .to('.cloud-icon-item', {
      motionPath: {
        path: '#linerPath',
        align: '#linerPath',
        alignOrigin: [0.5, 0.5],
        start: 0.65,
        end: 0.87,
        autoRotate: false,
      },
      ease: 'power1.out',
      duration: 2,
    })
    .to('.rain-path', { opacity: 1, duration: 0.1 }, '<')
    .to('.rain-path', { yPercent: 0, duration: 0.8 }, '<')
    .to('.rain-path', { opacity: 0, duration: 0.1 })

    // Phase 5: Snow animation triggers to end of path (0.87 -> 1.0)
    .to('.cloud-icon-item', {
      motionPath: {
        path: '#linerPath',
        align: '#linerPath',
        alignOrigin: [0.5, 0.5],
        start: 0.87,
        end: 1,
        autoRotate: false,
      },
      ease: 'power1.out',
      duration: 2,
    })
    .to('.snow-path', { opacity: 1, duration: 0.1 }, '<')
    .to('.snow-path', { yPercent: 0, duration: 0.8 }, '<')
    .to('.snow-path', { opacity: 0, duration: 0.1 });


    const bgFade = gsap.to('.cloudy-bg',{
  opacity:1,
  scrollTrigger:{
    trigger:allFeatures[2],
    start:'top center',
    scrub:2,
    // markers:true
  }
})


};
    const desktopAnimations = ()=>{
      const allFeatures = gsap.utils.toArray(".features .feature");
   
      // --- Inset Layout Logic ---
      gsap.set(allFeatures[0], { top: "10%", right: "15%", left: "auto" });
      gsap.set(allFeatures[1], { top: "23%", left: "10%", right: "auto" });
      gsap.set(allFeatures[2], { top: "45%", right: "10%", left: "auto" });
      gsap.set(allFeatures[3], { top: "67%", left: "10%", right: "auto" });
      gsap.set(allFeatures[4], { top: "82%", right: "10%", left: "auto" });

      // --- Directional ScrollTrigger Loop ---
      allFeatures.forEach((feature, index) => {
        const directionX = (index % 2 === 0) ? 200 : -200;
        gsap.from(feature, {
          scrollTrigger: {
            trigger: feature,
            start: "top 85%",
          },
          opacity: 0,
          scale: 0.5,
          rotate: 15,
          x: directionX,
          y: 100,
          duration: 1,
          ease: "elastic.out(1, 0.75)"
        });
      });

// --- A. INITIAL COMPONENT POSITIONING ---
gsap.set(".sun-icon-item", {
  opacity: 0,
  motionPath: {
    path: "#weatherPath",
    align: "#weatherPath",
    alignOrigin: [0.5, 0.5],
    start: 0,
    end: 0
  }
});

gsap.set(".cloud-icon-item", {
  opacity: 0,
  motionPath: {
    path: "#weatherPath",
    align: "#weatherPath",
    alignOrigin: [0.5, 0.5],
    start: 0.2,
    end: 0.2
  }
});

// --- B. MAIN MASTER WEATHER TIMELINE (PAUSED) ---
const mainWeatherTl = gsap.timeline({ paused: true });

mainWeatherTl
  // ☀️ 1. SUN PHASE
  .addLabel("sunStart")
  .to(".sun-icon-item", { opacity: 1, duration: 0.05 })
  .to(".sun-icon-item", {
    motionPath: {
      path: "#weatherPath",
      align: "#weatherPath",
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 0.2
    },
    duration: 2,
    ease: "none"
  }, "<")
  .addLabel("sunEnd")

  // ☁️ 🌞 2. CLOUDY SUN PHASE
  .addLabel("cloudySunStart")
  .to([".cloud-icon-item", ".cloud-path"], { opacity: 1, duration: 0.05 })
  .to(".cloud-icon-item", {
    motionPath: {
      path: "#weatherPath",
      align: "#weatherPath",
      alignOrigin: [0.5, 0.5],
      start: 0.2,
      end: 0.47
    },
    // duration: 1,
    ease: "none"
  }, "<")
  .to(".sun-icon-item", {
    motionPath: {
      path: "#weatherPath",
      align: "#weatherPath",
      alignOrigin: [0.5, 0.5],
      start: 0.2,
      end: 0.47
    },
    // duration: 1,
    ease: "none"
  }, "<")
  .to('.cloud-path', { xPercent: -20, duration: 1 }, "<")
  .to('.sun-icon-item', { opacity: 0, duration: 0.05 }) // reset
  .to('.cloud-path', { xPercent: 0, duration: 0.05 })   // reset
  .addLabel("cloudySunEnd")

  // ☁️ 3. CLOUDY PHASE
  .addLabel("cloudyStart")
  .to(".cloud-icon-item", {
    motionPath: {
      path: "#weatherPath",
      align: "#weatherPath",
      alignOrigin: [0.5, 0.5],
      start: 0.47,
      end: 0.75
    },
    // duration: 1,
    ease: "none"
  })
  // .to('.cloudy-bg', { opacity: 1})
  .addLabel("cloudyEnd")

  // 🌧 4. RAINY PHASE
  .addLabel("rainyStart")
  .to(".cloud-icon-item", {
    motionPath: {
      path: "#weatherPath",
      align: "#weatherPath",
      alignOrigin: [0.5, 0.5],
      start: 0.75,
      end: 0.95
    },
    // duration: 1,
    ease: "none"
  })
  .to('.rain-path', { opacity: 1, duration: 0.05 }, "<")
  .to('.rain-path', { yPercent: 0, duration: 1 }, "<")
  .to(".cloud-icon-item",{
    opacity:0
  })
  .addLabel("rainyEnd");


// --- C. SEPARATE SCROLLTRIGGERS (Binding labels to scroll distance) ---

// Helper function to sync a section to timeline labels
function bindScrollToLabels(triggerElem, startLabel, endLabel, config = {}) {
  const startTime = mainWeatherTl.labels[startLabel];
  const endTime = mainWeatherTl.labels[endLabel];

  return gsap.fromTo(mainWeatherTl, 
    { time: startTime },
    {
      time: endTime,
      ease: "power1.out",
      scrollTrigger: {
        trigger: triggerElem,
        start: config.start || "top center+=10",
        end: config.end || "bottom center",
        scrub: config.scrub ?? .5,
        invalidateOnRefresh: true,
        markers: config.markers || false
      }
    }
  );
}
// === note for the time line to workseamlessly on this animation -- check that the start and end for the viewport are the same (Eg: center center
// === check that the next animation start point is after the end point of the previuse one -visually- set low scrub and ease that starts fast end slow or none)
// 1. Sun ScrollTrigger
bindScrollToLabels(allFeatures[0], "sunStart", "sunEnd",{
   end: "bottom+=110 center",
  
});

// 2. Cloudy Sun ScrollTrigger
bindScrollToLabels(allFeatures[1], "cloudySunStart", "cloudySunEnd",{
   end: "bottom+=250 center",
});

// 3. Cloudy ScrollTrigger
bindScrollToLabels(allFeatures[2], "cloudyStart", "cloudyEnd",{
     end: "bottom+=250 center",
});

const bgFade = gsap.to('.cloudy-bg',{
  opacity:1,
  scrollTrigger:{
    trigger:allFeatures[2],
    start:'top center',
    scrub:2,
    // markers:true
  }
})

// 4. Rainy ScrollTrigger
bindScrollToLabels(allFeatures[3], "rainyStart", "rainyEnd", {
 
  end: "bottom+=250 center",
});
          // rainyTl.to('#rain-lottie-container',{
          //   opacity:0,
          //   duration: .5
          // },0);
          //  rainyTl.to('#snow-lottie-container',{
          //   opacity:1,
         
          // });
         
          // rainyTl.to('#snow-lottie-container',{
          //   opacity:0,
         
          // });
      // rainyTl.to('.cloudy-bg', { opacity: 1 }, 0);
      // rainyTl.to('#rain-lottie-container', { opacity: 1, duration: 0.3 }, 0);

      // // ❄️ 3. Snowy Timeline with Lottie Trigger
      // const snowyTl = gsap.timeline({
      //   scrollTrigger: {
      //     trigger: allFeatures[4], // snowy feature card
      //     start: 'top center',
      //     end: 'bottom center',
      //     scrub: 2,
      //     onEnter: () => snowLottieRef.current?.play(),
      //     onEnterBack: () => snowLottieRef.current?.play(),
      //     onLeave: () => snowLottieRef.current?.pause(),
      //     onLeaveBack: () => snowLottieRef.current?.pause(),
      //   },
      // });
        
 }




  return (
    <>
    <section className="features" ref={containerRef} >
          <div className="section-heading" ref={headingRef} >
            <h2>{data?.featuresHeading }</h2>
            <p>{data?.featuresSubheading }</p>
          </div>
     <div className="background">
            <svg width="50" height="1750" viewBox="0 0 50 1750" xmlns="http://www.w3.org/2000/svg" className="line-path">
                <path 
            id="linerPath" 
            d="M 25 50 L 25 1700" 
            stroke="#afaeac" 
            strokeWidth="4" 
            strokeDasharray="12 12" 
            strokeLinecap="round" 
          />
            </svg>
                <svg  viewBox="0 0 1021 1750" fill="none" xmlns="http://www.w3.org/2000/svg" className="curve-path">
                  <path id="weatherPath" d="M869.51 4.98096C869.51 4.98096 92.2848 72.8008 46.5095 431.981C-6.4157 847.264 1011.9 471.855 1015.51 890.481C1019.21 1319.64 1.40592 893.322 5.00955 1322.48C8.60041 1750.12 1015.51 1744.48 1015.51 1744.48" stroke="#afaeac"  strokeWidth="10" strokeDasharray="36 36"></path>
                </svg>

              <div className="path-container sun-icon-item">
                <svg viewBox="0 0 100 100" width="200" height="200" className=" icon-path sun-path">
                  <g strokeLinecap="round" strokeLinejoin="round">
                    {/* Sun Core  */}
                    <circle cx="50" cy="50" r="18" className="sun-body" fill="#FFDE59" stroke="#FF914D" strokeWidth="4" />
                    
              {/* Rays (Now closer to the circle: 22px to 31px radius)  */}
                    <g className="sun-rays" stroke="#FF914D" strokeWidth="4">
                      <line x1="50" y1="19" x2="50" y2="28" /> {/* Top  */}
                      <line x1="50" y1="72" x2="50" y2="81" /> {/* Bottom */}
                      <line x1="19" y1="50" x2="28" y2="50" />  {/*Left */}
                      <line x1="72" y1="50" x2="81" y2="50" /> {/* Right */}
                      <line x1="28" y1="28" x2="34" y2="34" /> {/* Top-Left */}
                      <line x1="66" y1="66" x2="72" y2="72" /> {/* Bottom-Right */}
                      <line x1="28" y1="72" x2="34" y2="66" /> {/* Bottom-Left */}
                      <line x1="66" y1="34" x2="72" y2="28" /> {/* Top-Right */}
                    </g>
                  </g>
                </svg>
              </div>

                
            {/* 1. The Cloud (Follows the motion path)  */}
            <div className="path-container cloud-icon-item">
              <svg viewBox="0 0 100 100" width="200" height="200" className="icon-path cloud-path">
                <path d="M 25,45 A 12,12 0 0,1 25,21 A 16,16 0 0,1 55,13 A 14,14 0 0,1 75,45 Z" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="4"/>
              </svg>

              <svg viewBox="0 0 100 100" width="200" height="200" className="icon-path rain-path">
              
                <g stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round">
                Column 1 (Left) 
                <line x1="26" y1="53" x2="24" y2="58" />
                <line x1="23" y1="65" x2="21" y2="70" />
                <line x1="20" y1="77" x2="18" y2="82" />

                Column 2 
                <line x1="41" y1="53" x2="39" y2="58" />
                <line x1="37" y1="66" x2="35" y2="71" />
                <line x1="33" y1="79" x2="31" y2="84" />

                Column 3 
                <line x1="56" y1="52" x2="54" y2="57" />
                <line x1="52" y1="64" x2="50" y2="69" />
                <line x1="48" y1="76" x2="46" y2="81" />

                Column 4 (Right) 
                <line x1="71" y1="54" x2="69" y2="59" />
                <line x1="67" y1="67" x2="65" y2="72" />
                <line x1="63" y1="80" x2="61" y2="85" />
              </g>
                
              </svg>
              <svg viewBox="0 0 100 100" width="200" height="200" className="icon-path snow-path">
                <g fill="#FFFFFF" stroke="#0284C7" strokeWidth="1">
            
              <circle cx="26" cy="53" r="2.5" />
              <circle cx="23" cy="65" r="2" />
              <circle cx="20" cy="77" r="2.5" />

              <circle cx="41" cy="53" r="2" />
              <circle cx="37" cy="66" r="3" />
              <circle cx="33" cy="79" r="2" />

            
              <circle cx="56" cy="52" r="2.5" />
              <circle cx="52" cy="64" r="2" />
              <circle cx="48" cy="76" r="2.5" />


              <circle cx="71" cy="54" r="2" />
              <circle cx="67" cy="67" r="2.5" />
              <circle cx="63" cy="80" r="2" />
            </g>
          </svg>
            </div>

   
    </div>  {/* background wrapper  */}
<div className='features-container'>
  {/* Feature 1 */}
  <div className="feature sunny-feature">
    <img src={data?.featuresList?.[0]?.image ? urlFor(data.featuresList[0].image).url():""} alt="Feature 1" />
    <div className="feature-content">
      <h2>{data?.featuresList?.[0]?.heading || 'Feature 1'}</h2>
      <p>{data?.featuresList?.[0]?.text || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
    </div>
     <Link
        to={`/post/${data?.featuresList?.[0]?.postId}`}
        title="read more"
        className="card-link"
      ></Link>
  </div>

  {/* Feature 2 */}
  <div className="feature cloud-sun-feature">
    <img src={data?.featuresList?.[1]?.image ? urlFor(data.featuresList[1].image).url() :""} alt="Feature 2" width="300" />
    <div className="feature-content">
      <h2>{data?.featuresList?.[1]?.heading}</h2>
      <p>{data?.featuresList?.[1]?.text }</p>
    </div>
     <Link
        to={`/post/${data?.featuresList?.[1]?.postId}`}
        title="read more"
        className="card-link"
      ></Link>
  </div>

  {/* Feature 3 (Fallback safely if data has fewer items) */}
  <div className="feature cloudy-feature">
    <img src={data?.featuresList?.[2]?.image ? urlFor(data.featuresList[2].image).url() : ''} alt="Feature 3" width="300" />
    <div className="feature-content">
      <h2>{data?.featuresList?.[2]?.heading }</h2>
      <p>{data?.featuresList?.[2]?.text }</p>
    </div>
     <Link
        to={`/post/${data?.featuresList?.[2]?.postId}`}
        title="read more"
        className="card-link"
      ></Link>
  </div>

  {/* Feature 4 */}
  <div className="feature rainy-feature">
    <img src={data?.featuresList?.[3]?.image ? urlFor(data.featuresList[3].image).url() : ''} alt="Feature 4" width="300" />
    <div className="feature-content">
      <h2>{data?.featuresList?.[3]?.heading }</h2>
      <p>{data?.featuresList?.[3]?.text }</p>
    </div>
     <Link
        to={`/post/${data?.featuresList?.[3]?.postId}`}
        title="read more"
        className="card-link"
      ></Link>
  </div>

  {/* Feature 5 */}
  <div className="feature snowy-feature">
    <img src={data?.featuresList?.[4]?.image ? urlFor(data.featuresList[4].image).url() : ''} alt="Feature 5" width="300" />
    <div className="feature-content">
      <h2>{data?.featuresList?.[4]?.heading }</h2>
      <p>{data?.featuresList?.[4]?.text }</p>
    </div>
     <Link
        to={`/post/${data?.featuresList?.[4]?.postId}`}
        title="read more"
        className="card-link"
      ></Link>
  </div>

</div>
      <div className="bg-overlays">
       {/* Gradient Layers  */}
      <div className="bg-gradient sun-bg"></div>
      <div className="bg-gradient cloudy-bg"></div>
     

    </div>
    {/* Features Section Bottom CTA */}
    {data?.featuresCtaText && (
  <div className="features-cta-wrapper">
    <Link to={data?.featuresCtaLink || '/'} className="features-cta-button hero-button">
      {data?.featuresCtaText}
    </Link>
  </div>
)}
</section>
    </>
  )
}

export default Features