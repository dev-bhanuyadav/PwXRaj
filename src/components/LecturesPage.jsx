import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const LecturesPage = () => {
  const { batchId, subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('Lectures');
  const [resolvedSubjectIdForNav, setResolvedSubjectIdForNav] = useState(subjectId);
  const [userXP, setUserXP] = useState(parseInt(localStorage.getItem('user_xp') || '0'));

  const tabs = ['Lectures', 'Notes', 'DPP', 'DPP PDF', 'DPP VIDEOS'];

  useEffect(() => {
    const handleXPUpdate = () => {
      setUserXP(parseInt(localStorage.getItem('user_xp') || '0'));
    };
    window.addEventListener('xpUpdate', handleXPUpdate);
    return () => window.removeEventListener('xpUpdate', handleXPUpdate);
  }, []);

  const fetchContents = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      let resolvedSubjectId = subjectId;
      let subjectSlug = subjectId;

      const isBsonId = /^[a-f0-9]{24}$/i.test(subjectId);
      try {
        const batchRes = await fetch(`https://api.pimaxer.in/batches/${batchId}/details`);
        const batchData = await batchRes.json();
        const subjects = batchData?.data?.subjects || batchData?.data?.batch?.subjects || [];

        if (subjects.length > 0) {
          let found = subjects.find(s => s.slug === subjectId);
          if (!found && isBsonId) found = subjects.find(s => s._id === subjectId);
          
          if (!found) {
            const parts = subjectId.split('-');
            const suffix = parts[parts.length - 1];
            if (suffix && suffix.length >= 4) found = subjects.find(s => s._id?.endsWith(suffix));
          }

          if (found) {
            resolvedSubjectId = found._id;
            subjectSlug = found.slug || found._id;
          }
        }
      } catch (e) { console.warn('Slug resolve error:', e); }
      setResolvedSubjectIdForNav(subjectSlug);

      if (!append) {
        const topicsRes = await fetch(`https://api.pimaxer.in/batches/${batchId}/subjects/${resolvedSubjectId}/topics`);
        const topicsData = await topicsRes.json();
        if (topicsData.success) {
          const topic = topicsData.data.find(t => t._id === topicId);
          if (topic) setTopicName(topic.name);
        }
      }

      const res = await fetch(`https://api.pimaxer.in/batches/${batchId}/subjects/${resolvedSubjectId}/contents?page=${pageNum}&contentType=videos&tag=${topicId}`);
      const data = await res.json();
      if (data.success) {
        if (append) {
          setContents(prev => [...prev, ...data.data]);
        } else {
          setContents(data.data);
        }
        // If data length is less than 20 (assuming limit is 20 based on user's "limit" hint), set hasMore to false
        if (data.data.length < 10) { // Using 10 as a safe bet for PW API pagination
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      if (!append) setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchContents(1, false);
  }, [batchId, subjectId, topicId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchContents(nextPage, true);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-poppins pt-12">
      <Sidebar />

      <div className="flex-1 flex flex-col h-[calc(100vh-48px)] overflow-y-auto subtle-scrollbar relative">
        {/* MOBILE HEADER (WHITE) */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white h-12 flex items-center px-4 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-gray-700 active:bg-gray-100 transition-all shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-[#1b212d] font-bold text-[16px] truncate flex-1">{topicName || 'Lectures'}</h1>
            
            <div 
              onClick={() => navigate('/under-construction')}
              className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1 rounded-full shadow-sm cursor-pointer active:scale-95 transition-all"
            >
               <div className="w-5 h-5 flex items-center justify-center bg-[#F0F2FF] rounded-md overflow-hidden">
                 <img src="https://www.pw.live/version14/assets/img/logo.svg" alt="PW" className="w-3.5 h-3.5" />
               </div>
               <span className="text-[13px] font-bold text-[#1b212d]">XP</span>
               <span className="text-[14px] font-extrabold text-[#5A4BDA]">{userXP}</span>
            </div>
          </div>
        </header>

        <div className="w-full max-w-[1400px] mx-auto px-4 py-6 md:py-8 pb-32">
          {/* TABS */}
          <div className="flex items-center gap-6 md:gap-4 mb-6 overflow-x-auto no-scrollbar scrollbar-hide border-b border-gray-100 md:border-none md:bg-[#F1F5FE] md:p-1.5 md:rounded-xl md:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Lectures') setActiveTab(tab);
                  else navigate('/under-construction');
                }}
                className={`relative py-3 md:py-2.5 px-1 md:px-6 text-[14px] font-bold md:font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'text-[#5A4BDA] md:bg-white md:shadow-sm md:rounded-lg' : 'text-gray-400 md:text-gray-500 hover:text-gray-600'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5A4BDA] rounded-t-full md:hidden"></div>}
                {tab !== 'Lectures' && <svg className="w-3.5 h-3.5 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#5A4BDA] border-t-transparent"></div>
              <p className="text-gray-400 font-medium text-sm">Loading Lectures...</p>
            </div>
          ) : contents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
               <div className="w-24 h-24 mb-6 opacity-20">
                 <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full text-[#5A4BDA]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.084.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.084.477-4.5 1.253" /></svg>
               </div>
               <h3 className="text-xl font-bold text-[#1b212d] mb-2 uppercase tracking-tight">No Lecture Available</h3>
               <p className="text-gray-400 text-sm font-medium">Resources for this topic will be updated soon. Stay tuned!</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-2">
                {contents.map((lecture) => (
                  <div 
                    key={lecture._id}
                    onClick={() => navigate(`/batch/${batchId}/subject/${resolvedSubjectIdForNav}/lecture/${lecture._id}`)}
                    className="bg-white rounded-xl md:rounded-lg border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-row md:flex-col p-3 md:p-4 gap-4 md:gap-3 group"
                  >
                    <div className="relative w-[120px] md:w-full shrink-0 aspect-[16/9] md:aspect-video rounded-lg overflow-hidden bg-gray-50 border border-gray-50">
                      <img src={lecture.videoDetails?.image || "https://static.pw.live/images/boy_20250107145242.png"} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute right-2 bottom-2 md:right-3 md:bottom-3">
                        <img src="https://static.pw.live/react-batches/assets/study/blue-play-icon.svg" alt="Play" className="w-8 h-8 md:w-10 md:h-10 shadow-lg" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                      <div className="relative">
                        <h3 className="text-[14px] md:text-[15px] font-bold text-[#1b212d] line-clamp-2 leading-tight pr-4 group-hover:text-[#5A4BDA] transition-colors">{lecture.topic}</h3>
                        <div className="absolute top-0 right-[-4px] p-1 opacity-0 md:hidden"></div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] md:text-[12px] font-medium text-gray-400">
                          <span>{lecture.videoDetails?.duration || '00:00:00'}</span>
                          <span className="text-gray-200">•</span>
                          <span>{formatDate(lecture.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12 mb-8">
                  <button 
                    onClick={loadMore}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white border border-[#5A4BDA] text-[#5A4BDA] font-bold text-[14px] hover:bg-[#5A4BDA] hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    Load More
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              )}
            </>
          )}  </div>

        <div className="md:hidden fixed bottom-24 right-6 z-40 transform hover:scale-110 active:scale-95 transition-all cursor-pointer">
          <div className="w-14 h-14 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-50 flex items-center justify-center overflow-hidden">
             <img src="https://static.pw.live/images/boy_20250107145242.png" alt="Support" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturesPage;
