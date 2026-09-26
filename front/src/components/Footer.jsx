import { useState, useEffect } from 'react';
import { client } from '../sanity/sanityClient';
import { Link } from 'react-router-dom';
import { urlFor } from '../utils/urlFor';
import '../css/footer.css'; // Import the new external stylesheet

export default function Footer() {
  const [siteData, setSiteData] = useState({});

  useEffect(() => {
    const query = `*[_type == "siteSettings"][0]{
      siteName,
      siteLogo,
      footerParagraph
    }`;

    client
      .fetch(query)
      .then((data) => {
        if (data?.siteName) {
          const siteLogo = urlFor(data.siteLogo).width(300).url();
          setSiteData({
            siteName: data.siteName,
            siteLogo,
            footerParagraph: data.footerParagraph,
          });
        }
      })
      .catch((err) => console.error('Failed to fetch site data:', err));
  }, []);

  return (
    <footer className="footer">
      {/* Upper Footer */}
      <div className="footer-top-section">
        <div className="footer-brand-column">
          <Link to="/" className="footer-logo-wrapper" title='الرئيسية'>
            <img src={siteData.siteLogo} alt={siteData.siteName} className="footer-logo" />
          </Link>
          <p className="footer-tagline">
            {siteData.footerParagraph}
          </p>
        </div>

        <div className="footer-links-group">
          {/* Navigation Card */}
          <h6 className="footer-heading">روابط ⚡</h6>
          <div className="footer-card-column">
            
            <Link to="/posts" className="footer-link">تطقَّس</Link>
            <Link to="/about" className="footer-link">عنّا</Link>
            <Link to="/contact" className="footer-link">تواصل</Link>
          </div>

          {/* Social Card */}
          {/* <div className="footer-card-column">
            <span className="footer-heading">Hang Out ✌️</span>
            <a href="#" className="footer-link">twitter / x</a>
            <a href="#" className="footer-link">github</a>
            <a href="#" className="footer-link">
              linkedin <span className="footer-badge">NEW</span>
            </a>
          </div> */}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom-section">
        {/* <p className="footer-copyright">
          &copy; {new Date().getFullYear()} {siteData.siteName}.  💙 by <a href="https://salwamansour.netlify.app/" className="footer-author-link">Muttajah</a>.
        </p> */}
      
        <p dir="rtl">
          جميع حقوق الطبع والنشر &copy; {new Date().getFullYear()} محفوظة لـ 
          <a href="#">DestCast</a> & 
          <a href="#">مُتَّجه</a> للتطوير
        </p>
            

        <div className="footer-legal-links">
          <Link to="/privacy-policy" className="footer-link">سياسة الخصوصية</Link>
          <Link to="/terms-of-service" className="footer-link">بنود الخدمة</Link>
        </div>
      </div>
    </footer>
  );
}