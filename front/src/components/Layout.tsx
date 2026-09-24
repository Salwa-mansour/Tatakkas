import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { client } from '../sanity/sanityClient';
import { createImageUrlBuilder } from '@sanity/image-url';
import Nav from './Nav';
import Footer from './Footer';

const builder = createImageUrlBuilder(client);
const urlFor = (source: any) => builder.image(source);

export default function Layout() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch only the favicon from the siteSettings document
    const query = `*[_type == "siteSettings"][0]{
      favicon
    }`;

    client
      .fetch(query)
      .then((data) => {
        if (data?.favicon) {
          const url = urlFor(data.favicon).width(32).height(32).url();
          setFaviconUrl(url);
        }
      })
      .catch((err) => console.error('Failed to fetch favicon:', err));
  }, []);

  return (
    <>
      <Helmet>
        {faviconUrl && <link rel="icon" type="image/x-icon" href={faviconUrl} />}
      </Helmet>

      <Nav />
      <Outlet />
      <Footer />
    </>
  );
}