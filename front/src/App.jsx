import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'
import Layout from './components/Layout'
import ScrollToTop from './components/ScollToTop'
import Contact from './pages/Contact'
import StaticPage from './pages/StaticPage'

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Layout rendered as a parent Route element */}
        <Route element={<Layout />}>
        
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/:slug" element={<StaticPage />} />
        </Route>
      </Routes>
    </Router>
  )
}