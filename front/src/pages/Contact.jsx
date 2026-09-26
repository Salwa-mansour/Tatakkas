import { useState } from 'react';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { urlFor } from '../utils/urlFor';
import { Helmet } from 'react-helmet-async';
import ProgressiveImage from '../components/ProgressiveImage';

export default function Contact() {
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [loading, setLoading] = useState(false);
  const { pageMetaData, metaDataLoading } = usePageMetadata('contact');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY,
          ...data,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
        formElement.reset();
      } else {
        setStatus({ type: 'error', message: result.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Safe SEO metadata fallbacks
  const seoTitle = pageMetaData?.seo?.metaTitle || pageMetaData?.title || 'Contact Us';
  const seoDescription = pageMetaData?.seo?.metaDescription || pageMetaData?.description || 'Contact Us';
  
  const ogImageSource = pageMetaData?.seo?.openGraphImage || pageMetaData?.headerImage;
  const ogImageUrl = ogImageSource 
    ? urlFor(ogImageSource).width(600).url() 
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
          <header className="page-header">
          <figure className="header-img" tabIndex={-1}>
            {pageMetaData?.headerImage && pageMetaData?.headerImage.asset && (        
              <ProgressiveImage imageObject={pageMetaData?.headerImage} isPrior={true} alt='page header' />
            )}
            <figcaption 
              className="image-attribution"
              dangerouslySetInnerHTML={{ __html: pageMetaData?.headerImage?.imageAttribution }} 
            />
          </figure>
        </header>

       <section className="container">
          <div className="text-container">
              <div className="section-heading" >
                <h2> {pageMetaData?.title || 'Get in Touch'}</h2>
                <p> {pageMetaData?.description ||
                 'Have a question or want to collaborate? Send a message directly to our inbox.'} </p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                {/* Hidden Honeypot Spam Protection */}
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                <div className="form-group">
                  {/* <label htmlFor="name">Your Name</label> */}
                  <input type="text" id="name" name="name" required placeholder="Your Name" />
                </div>

                <div className="form-group">
                  {/* <label htmlFor="email">Your Email</label> */}
                  <input type="email" id="email" name="email" required placeholder="Your Email" />
                </div>

                <div className="form-group">
                  {/* <label htmlFor="message">Message</label> */}
                  <textarea id="message" name="message" rows="5" required placeholder="Write your message here..."></textarea>
                </div>

                <button type="submit" className="hero-button" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>

                {status && (
                  <p className={`form-status ${status.type}`} style={{ color: '#333' }}>
                    {status.message}
                  </p>
                )}
              </form>
         </div>
      </section>
    </>
  );
}