import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { client } from '../sanity/sanityClient';
import { urlFor } from '../utils/urlFor';
import { Helmet } from 'react-helmet-async';
import ProgressiveImage from '../components/ProgressiveImage';

interface PageData {
  title: string;
  headerImage?: any;
  content: any;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: any;
  };
}

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>(); 
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .fetch(
        `
        *[_type == "page" && slug.current == $slug][0]{
        "title": coalesce(seo.metaTitle, title, *[_type == "siteSettings"][0].seo.metaTitle, *[_type == "siteSettings"][0].title),
        "description": coalesce(seo.metaDescription, *[_type == "siteSettings"][0].seo.metaDescription),
        "image": coalesce(seo.openGraphImage, headerImage, *[_type == "siteSettings"][0].seo.openGraphImage),
        "headerImage": headerImage,
        "content": content,
        "pageTitle": title
      }
        `,
        { slug }
      )
      .then((data) => {
        setPageData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  // Safely compute SEO metadata fallback values
  const seoTitle = pageData?.seo?.metaTitle || pageData?.title || "DestCast";
  const seoDescription = pageData?.seo?.metaDescription;
  
  // Use page's specific openGraphImage if available, otherwise fall back to headerImage
  const ogImageSource = pageData?.seo?.openGraphImage || pageData?.headerImage;
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
      <header className="page-header">
          {pageData?.headerImage && pageData?.headerImage.asset && (
            <figure  className="header-img" tab-index="-1">
             
             
              {pageData.headerImage && (
                <>
                  <ProgressiveImage imageObject={pageData?.headerImage} alt={pageData?.title || "Page header"} isPrior={true} />
                  <figcaption 
                    className="image-attribution"
                    dangerouslySetInnerHTML={{ __html: pageData.headerImage.imageAttribution }} 
                  />
                </>
                )}
            </figure>
          )}
        </header>
      <section className="container">
          {loading ? (
              <p className="loading-text">Loading content...</p>
            ) : !pageData ? (
              <p className="error-text">no content.</p>
            ) : (
              <div className="text-container">
                {/* <h1 className="text-4xl font-bold mb-6">{pageData.title}</h1> */}
                {pageData?.content ? (
                  <PortableText value={pageData?.content} />
                ) : (
                  <p>No content added yet.</p>
                )}
              </div>
            )}
      </section>
    </>
  );
}