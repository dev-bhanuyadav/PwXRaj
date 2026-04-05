import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import BatchesPage from './components/BatchesPage'
import CheckoutPage from './components/CheckoutPage'
import BatchDetailsPage from './components/BatchDetailsPage'
import SubjectTopicsPage from './components/SubjectTopicsPage'
import LecturesPage from './components/LecturesPage'
import VideoPlayerPage from './components/VideoPlayerPage'
import UnderConstructionPage from './components/UnderConstructionPage'

// Navbar Component with Light and Dark variants
const Header = ({ scrolled, onNavigate }) => {
  const location = useLocation();
  const isBatchDetailsPage = location.pathname.startsWith('/batch/');
  const isUnderConstructionPage = location.pathname === '/under-construction';
  const isBatchesPage = location.pathname === '/batches';
  const navLinks = [];

  if (isBatchDetailsPage || isUnderConstructionPage) return null;

  // Dark variant for Batches page (Study section)
  if (isBatchesPage || location.pathname.startsWith('/checkout')) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1b212d] h-10 md:h-12 flex items-center border-b border-white/5">
        <div className="w-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
              <img src="https://www.pw.live/version14/assets/img/logo.svg" alt="PW" className="h-[22px] md:h-[26px] invert brightness-0" />
              <span className="text-white font-extrabold text-[14px] md:text-[18px] tracking-tight">Physics Wallah</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="text-white font-bold text-[11px] md:text-[12px] hover:text-[#5A4BDA] transition-colors hidden sm:block">Hi, Naman</span>
              <img src="https://static.pw.live/images/boy_20250107145242.png" alt="Profile" className="w-7 h-7 md:w-7 md:h-7 rounded-full border border-white/20" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Light variant for Landing page
  return (
    <header 
      style={{ top: 0 }}
      className={`fixed left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md h-[60px]' : 'bg-white h-[70px]'} flex items-center justify-center`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <img src="https://www.pw.live/version14/assets/img/logo.svg" alt="Physics Wallah" className="h-9 md:h-10" />
            <span className="text-[#1b212d] font-black text-[18px] md:text-[22px] tracking-tighter">Physics Wallah</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('/batches')} className="pw-button-primary px-6 md:px-8 py-2 text-[13px] md:text-[14px] rounded-lg font-bold">
            Login/Register
          </button>
        </div>
      </div>
    </header>
  )
}

const HomePage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/b786089d-1894-4a34-92bb-89eb9b1280be.webp",
    "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/27ec202b-cffe-4679-9310-480f8f626caf.jpg",
    "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/9331c56f-58cb-429a-9991-be9fb6ad20a4.58"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const categories = [
    { name: "NEET", tags: ["Class 11", "Class 12", "Dropper"], icon: "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/9816db69-099c-4020-935c-b98cc3ab4464.webp" },
    { name: "IIT JEE", tags: ["Class 11", "Class 12", "Dropper"], icon: "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/438cff9f-f45c-4961-9ab3-33a59b88352c.webp" },
    { name: "UPSC", tags: ["IAS", "IPS", "IFS"], icon: "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/ed50a2a8-e5fc-4ce0-bcee-823c32ea49e9.webp" },
    { name: "Pre Foundation", tags: ["Class 6", "Class 7", "Class 8"], icon: "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/ed50a2a8-e5fc-4ce0-bcee-823c32ea49e9.webp" },
    { name: "School Boards", tags: ["CBSE", "ICSE", "State Boards"], icon: "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/002e5e6e-47f1-4b21-89e0-8218ffcce066.webp" },
    { name: "Govt Job Exams", tags: ["SSC", "Banking", "Railways"], icon: "https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/8556a2c4-1fd3-4d16-bdfb-62f4afa21310.webp" }
  ];

  return (
    <main className="w-full">
      {/* Banner Section with NO GAP */}
      <section className="w-full bg-white pt-[70px]">
        <div className="relative overflow-hidden aspect-[21/9] sm:aspect-[3/1] md:aspect-[4/1]">
          <div className="flex transition-transform duration-700 h-full" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {banners.map((url, i) => (
              <img key={i} src={url} alt={`Banner ${i}`} className="w-full h-full object-cover shrink-0" />
            ))}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrentBanner(i)} className={`transition-all rounded-full ${i === currentBanner ? 'bg-[#5A4BDA] w-6 h-1.5' : 'bg-black/20 w-1.5 h-1.5'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section — TRULY CLEAN */}
      <section className="bg-white py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-black text-[#1b212d] leading-tight">
              Bharat's <span className="text-[#5A4BDA]">Trusted & Affordable</span> Educational Platform
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-lg">
              Unlock your potential by signing up with Physics Wallah—The most affordable and high-quality learning solution for every student.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/batches')} className="pw-button-primary text-lg px-8 py-3">
                Get Started
              </button>
              <div className="relative flex-1 max-w-md">
                <input type="text" placeholder="Search for courses, batches, etc." className="w-full h-full pl-4 pr-24 rounded-lg border-2 border-gray-100 outline-none focus:border-[#5A4BDA] transition-all" />
                <button onClick={() => navigate('/batches')} className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#5A4BDA] text-white px-5 py-2 rounded-md font-bold text-sm hover:bg-[#4437B8] transition-all">Search</button>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex justify-center relative">
            {/* Clean Hero Image — No Orbits, No Dots */}
            <div className="relative z-10 scale-110">
              <img src="https://static.pw.live/ua/images/hero-student-w.webp" className="w-full max-w-[550px] h-auto rounded-3xl shadow-2xl" alt="Hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 md:px-8 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-[#1b212d]">Explore Our Top Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <div key={i} className="pw-card flex justify-between items-center group cursor-pointer p-8" onClick={() => navigate('/batches')}>
                <div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-[#5A4BDA] transition-colors">{cat.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map(tag => <span key={tag} className="pw-pill text-xs px-3 py-1">{tag}</span>)}
                  </div>
                </div>
                <img src={cat.icon} alt={cat.name} className="w-20 h-20 object-contain grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">© 2026 Physics Wallah. Built for Bharat.</p>
      </footer>
    </main>
  )
}

function App() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <HeaderHelper scrolled={scrolled} />
      <div className="min-h-screen font-poppins text-[#1b212d]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/batch/:batchId" element={<BatchDetailsPage />} />
          <Route path="/batch/:batchId/subject/:subjectId" element={<SubjectTopicsPage />} />
          <Route path="/batch/:batchId/subject/:subjectId/topic/:topicId" element={<LecturesPage />} />
          <Route path="/batch/:batchId/subject/:subjectId/lecture/:lectureId" element={<VideoPlayerPage />} />
          <Route path="/checkout/:batchId" element={<CheckoutPage />} />
          <Route path="/under-construction" element={<UnderConstructionPage />} />
        </Routes>
      </div>
    </Router>
  )
}

const HeaderHelper = ({ scrolled }) => {
  const navigate = useNavigate();
  return <Header scrolled={scrolled} onNavigate={(path) => navigate(path)} />
}

export default App
