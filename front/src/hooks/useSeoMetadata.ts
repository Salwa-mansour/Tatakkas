import { useState, useEffect } from 'react';
import { client } from '../sanity/sanityClient';

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  openGraphImage?: any;
}

export function useSeoMetadata(slug: string, type: 'page' | 'post' = 'page') {
  const [seoData, setSeoData] = useState<SeoData | null>(null);
  const [seoLoading, setSeoLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;

    setSeoLoading(true);
    // Dynamically query based on whether it's a 'page' or a 'post'
    const query = `*[_type == $type && slug.current == $slug][0]{
      title,
      "seo": seo {
        metaTitle,
        metaDescription,
        openGraphImage
      }
    }`;

    client
      .fetch(query, { slug, type })
      .then((data) => {
        if (data) {
          setSeoData({
            // Fallback to document title if metaTitle isn't explicitly filled out in Sanity
            metaTitle: data.seo?.metaTitle || data.title,
            metaDescription: data.seo?.metaDescription,
            openGraphImage: data.seo?.openGraphImage,
          });
        }
        setSeoLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching SEO metadata:", err);
        setSeoLoading(false);
      });
  }, [slug, type]);

  return { seoData, seoLoading };
}