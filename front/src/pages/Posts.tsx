import { useEffect, useState } from 'react';
import { Link,useSearchParams } from 'react-router-dom';
import { client } from '../sanity/sanityClient';
import { urlFor } from '../utils/urlFor';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { Helmet } from 'react-helmet-async';

export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt:string,
  mainImage: any;
  body: any;
  locationDetails?: {
    countryName: string;
    countryNameAr:string;
    cityName: string;
    cityNameAr:string;
    lat: number;
    lng: number;
  };
  seo: any;
}

export interface PageMetaData {
  title: string;
  headerImage: any;
  content: any;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: any;
  };
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { pageMetaData, metaDataLoading } = usePageMetadata('posts');
  
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

    
  // 1. Initialize state with the URL query parameter if present
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);

  // Optional: Keep state synced if the URL changes while already on the page
  useEffect(() => {
    const queryParam = searchParams.get('search') || '';
    setSearchTerm(queryParam);
    setDebouncedSearchTerm(queryParam);
  }, [searchParams]);
  useEffect(() => {
    // GROQ Query to fetch post details + custom location object
    client
client
      .fetch(`*[_type == "post"] | order(_createdAt desc){ 
        _id, 
        title, 
        slug,
        excerpt,
        mainImage {
          asset,
          hotspot,
          crop,
          imageAttribution
        },
        body[] {
          ...,
          _type == "image" => {
            asset,
            hotspot,
            crop,
            imageAttribution
          },
          _type == "imageWithAttribution" => {
            asset,
            hotspot,
            crop,
            imageAttribution
          }
        },
        locationDetails 
      }`)
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 2. Debounce effect: Wait 400ms after user stops typing before updating debouncedSearchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // 400ms delay

    return () => clearTimeout(timer); // Clear timer if user types again before 400ms passes
  }, [searchTerm]);

  // 3. Filter using debouncedSearchTerm instead of raw input value
  const filteredPosts = posts.filter((post) => {
    const query = debouncedSearchTerm.toLowerCase().trim();
    if (!query) return true;

    const titleMatch = post.title?.toLowerCase().includes(query);
    const cityMatch = post.locationDetails?.cityName?.toLowerCase().includes(query);
    const countryMatch = post.locationDetails?.countryName?.toLowerCase().includes(query);

    return titleMatch || cityMatch || countryMatch;
  });

  // Safe SEO metadata extraction from the hook data
  const seoTitle = pageMetaData?.seo?.metaTitle || pageMetaData?.title || 'Travel Posts';
  const seoDescription = pageMetaData?.seo?.metaDescription;
  
  const ogImageSource = pageMetaData?.seo?.openGraphImage || pageMetaData?.headerImage.asset;
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
        <figure className="header-img" tabIndex={-1}>
          {pageMetaData?.headerImage && pageMetaData?.headerImage.asset && (
            <img
              src={urlFor(pageMetaData?.headerImage?.asset).width(1200).height(600).url()}
              alt={pageMetaData.title || 'Posts Header'}
            />
            
          )}
          <figcaption 
            className="image-attribution"
            dangerouslySetInnerHTML={{ __html: pageMetaData?.headerImage?.imageAttribution }} 
          />
                
        </figure>
        <form className="search-post" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Search by title, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </header>

      <section className="posts-container container">
        {loading ? (
          <p className="loading-text">Loading travel stories...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article key={post._id} className="item-card">
              <figure className="post-img">
                {post.mainImage && post.mainImage.asset && (
                  <img
                    src={urlFor(post.mainImage).width(800).height(600).url()}
                    alt={post.title}
                  />
                )}
              </figure>
              <div className="card-info">
                {post.locationDetails && (
                  <h6 className="location" style={{outline:'1px solid'}}>
                    📍 {post.locationDetails.cityNameAr ||post.locationDetails.cityName}, {post.locationDetails.countryNameAr ||post.locationDetails.countryName}
                  </h6>
                )}
                <h3 className="post-title">{post.title}</h3>
                <p className="post-desc">{post.excerpt}</p>
                <Link
                  to={`/post/${post._id}`}
                  title="read more"
                  className="card-link"
                ></Link>
              </div>
            </article>
          ))
        ) : (
          <p className="no-results">No stories found matching "{debouncedSearchTerm}"</p>
        )}
      </section>
    </>
  );
}