import { PortableTextComponents } from '@portabletext/react'
import { urlFor } from '../utils/urlFor'

export const customPortableTextComponents: PortableTextComponents = {
  types: {
    // Handle both standard Sanity image block and custom image types
    image: ({ value }) => {
      if (!value?.asset) return null;

      return (
        <figure className="portable-text-image-container">
          <img
            src={urlFor(value).width(800).fit('max').auto('format').url()}
            alt={value.alt || 'Post image'}
            loading="lazy"
          />
          {value.imageAttribution && (
            <figcaption 
              className="image-attribution"
              dangerouslySetInnerHTML={{ __html: value.imageAttribution }}
            />
          )}
        </figure>
      );
    },
    // If your schema registers body images specifically as 'imageWithAttribution'
    imageWithAttribution: ({ value }) => {
      if (!value?.asset) return null;

      return (
        <figure className="portable-text-image-container">
          <img
            src={urlFor(value).width(800).fit('max').auto('format').url()}
            alt={value.alt || 'Post image'}
            loading="lazy"
          />
          {value.imageAttribution && (
            <figcaption 
              className="image-attribution"
              dangerouslySetInnerHTML={{ __html: value.imageAttribution }}
            />
          )}
        </figure>
      );
    },
  },
};