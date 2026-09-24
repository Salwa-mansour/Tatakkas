import { useState, useEffect } from 'react';
import { client } from '../sanity/sanityClient';

export function usePageMetadata(slug: string) {
  const [pageMetaData, setPageMetaData] = useState<any | null>(null);
  const [metaDataLoading, setMetaDataLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;

    setMetaDataLoading(true);

    // Multi-document query fetching both the page and global siteSettings, 
    // then mapping out the fallback hierarchy using coalesce()
    const query = `{
      "page": *[_type == "page" && slug.current == $slug][0]{
        title,
        description,
        headerImage,
        content,
        seo
      },
      "settings": *[_type == "siteSettings"][0]{
        title,
        seo
      }
    }`;

    client
      .fetch(query, { slug })
      .then((res) => {
        const page = res?.page;
        const settings = res?.settings;

        if (!page) {
          setPageMetaData(null);
          setMetaDataLoading(false);
          return;
        }

        // Construct processed object with robust fallbacks
        const processedData = {
          ...page,
          seo: {
            metaTitle: coalesce(
              page.seo?.metaTitle, 
              page.title, 
              settings?.seo?.metaTitle, 
              settings?.title
            ),
            metaDescription: coalesce(
              page.seo?.metaDescription, 
              settings?.seo?.metaDescription
            ),
            openGraphImage: coalesce(
              page.seo?.openGraphImage, 
              page.headerImage, 
              settings?.seo?.openGraphImage
            )
          }
        };

        setPageMetaData(processedData);
        setMetaDataLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching page metadata:", err);
        setMetaDataLoading(false);
      });
  }, [slug]);

  return { pageMetaData, metaDataLoading };
}

// Helper utility function mimicking GROQ's coalesce in JavaScript/TypeScript
function coalesce(...args: any[]) {
  return args.find(val => val !== undefined && val !== null && val !== '');
}