import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const SubjectTopicsPage = () => {
  const { batchId, subjectId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [resolvedSubjectSlug, setResolvedSubjectSlug] = useState(subjectId);
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState(parseInt(localStorage.getItem('user_xp') || '0'));

  useEffect(() => {
    const handleXPUpdate = () => {
      setUserXP(parseInt(localStorage.getItem('user_xp') || '0'));
    };
    window.addEventListener('xpUpdate', handleXPUpdate);
    return () => window.removeEventListener('xpUpdate', handleXPUpdate);
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        let resolvedId = subjectId;
        let subjectSlug = subjectId;

        const isBsonId = /^[a-f0-9]{24}$/i.test(subjectId);
        
        const batchRes = await fetch(`https://api.pimaxer.in/batches/${batchId}/details`);
        const batchData = await batchRes.json();
        const subjects = batchData?.data?.subjects || batchData?.data?.batch?.subjects || [];
        
        const found = subjects.find(s => s._id === subjectId || s.slug === subjectId);
        if (found) {
          resolvedId = found._id;
          subjectSlug = found.slug || found._id;
          setResolvedSubjectSlug(subjectSlug);
          setSubjectName(found.subject);
        }

        const topicsRes = await fetch(`https://api.pimaxer.in/batches/${batchId}/subjects/${resolvedId}/topics`);
        const topicsData = await topicsRes.json();
        if (topicsData.success) {
          setTopics(topicsData.data);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [batchId, subjectId]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-poppins pt-12">
      <Sidebar />

      <div className="flex-1 flex flex-col h-[calc(100vh-48px)] overflow-y-auto subtle-scrollbar relative">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white h-12 flex items-center px-4 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-gray-700 active:bg-gray-100 transition-all shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-[#1b212d] font-bold text-[16px] md:text-[18px] truncate flex-1">{subjectName}</h1>
            
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

        <div className="w-full max-w-[1400px] mx-auto px-4 py-8 pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#5A4BDA] border-t-transparent"></div>
              <p className="text-gray-400 font-medium text-sm">Loading Topics...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {topics.map((topic) => (
                <div 
                  key={topic._id}
                  onClick={() => navigate(`/batch/${batchId}/subject/${resolvedSubjectSlug}/topic/${topic._id}`)}
                  className="bg-white rounded-2xl border border-gray-50 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex flex-col gap-1 flex-1 pr-4">
                    <h3 className="text-[17px] font-bold text-[#1b212d] group-hover:text-[#5A4BDA] transition-colors leading-tight">
                      {topic.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[12px] md:text-[13px] font-medium text-gray-400">
                      {topic.videos > 0 && <span>{topic.videos} Videos</span>}
                      {topic.videos > 0 && (topic.exercises > 0 || topic.notes > 0) && <span className="text-gray-200">|</span>}
                      {topic.exercises > 0 && <span>{topic.exercises} Exercises</span>}
                      {topic.exercises > 0 && topic.notes > 0 && <span className="text-gray-200">|</span>}
                      {topic.notes > 0 && <span>{topic.notes} Notes</span>}
                      {topic.videos === 0 && topic.exercises === 0 && topic.notes === 0 && <span>All Videos | All Exercises | All Notes</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent group-hover:bg-[#F0F2FF] transition-all">
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-[#5A4BDA] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:hidden fixed bottom-24 right-6 z-40 transform hover:scale-110 active:scale-95 transition-all cursor-pointer group">
          <div className="relative w-14 h-14 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-50 flex items-center justify-center overflow-hidden">
             <img 
               src="https://static.pw.live/images/boy_20250107145242.png" 
               alt="Support" 
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectTopicsPage;
