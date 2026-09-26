import React, { useState } from 'react';
import { urlFor } from '../utils/urlFor';

function ProgressiveImage({ imageObject, alt="image",size="1200", isPrior = false,classNames="" }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // If no image from Sanity, use your fallback
  if (!imageObject?.asset) {
    return <img src={'https://placehold.co/600x400'} alt={alt} />;
  }

  const lowResUrl = urlFor(imageObject).width(50).blur(20).url();
  const highResUrl = urlFor(imageObject).width(size).url();

  return (
    <>
      {/* Low-res blurred background placeholder */}
      <img
        src={lowResUrl}
        aria-hidden="true"
        alt=""
        className={classNames}
        style={{
      
          filter: 'blur(1px)',
            position: 'absolute',
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Main high-res image */}
      <img
        src={highResUrl}
        alt={alt}
        className={classNames}
        onLoad={() => setIsLoaded(true)}
        // Correct conditional props approach for JSX
        loading={isPrior ? "eager" : "lazy"}
        fetchPriority={isPrior ? "high" : "auto"}
        style={{
        
         
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </>
  );
}

export default ProgressiveImage;