// RelatedPosts.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../sanity/sanityClient';
import { urlFor } from '../sanity/sanityClient';
import ProgressiveImage from './ProgressiveImage';

export default function RelatedPosts({ currentSlug, country }) {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!country) return;

    const fetchRelatedPosts = async () => {
      const query = `*[_type == "post" && locationDetails.countryName == $country && slug.current != $currentSlug][0...3] {
        _id,
        title,
        slug,
        publishedAt,
        mainImage {
          asset,
        },
        locationDetails
      }`;
      const params = { country, currentSlug };

      try {
        const data = await client.fetch(query, params);
        setRelatedPosts(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching related posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentSlug, country]);

  if (loading || relatedPosts.length === 0) {
    return null; // Don't render anything if loading or no related posts found
  }

  return (
    <section className="posts-container ">
        <div className="section-heading related">
            <h3> قد يهمك أيضاً  </h3>
        </div>
      
      <div className="related-posts-grid">
        {relatedPosts.map((post) => (
          <article key={post._id} className="item-card">
            {post.mainImage &&
            <figure className="post-img">
                <ProgressiveImage imageObject={post.mainImage} size={'600'} />
             </figure>
             }
            <div className="card-info">
            <h4>
             {post.title}
            </h4>
             {post.locationDetails && (
                  <h6 className="location">
                     📍 {post.locationDetails.cityNameAr ||post.locationDetails.cityName}, {post.locationDetails.countryNameAr ||post.locationDetails.countryName}
                  </h6>
                )}
                <Link
                to={`/post/${post._id}`}
                title="read more"
                className="card-link" >
                </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}