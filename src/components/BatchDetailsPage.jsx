import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const BatchDetailsPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Description');

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const response = await fetch(`https://api.pimaxer.in/batches/${batchId}/details`);
        const result = await response.json();
        const data = result.success ? result.data : result;
        setBatch(data);
      } catch (error) {
        console.error('Error fetching batch details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetails();
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#5A4BDA] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Batch Details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col pt-24 items-center">
         <button onClick={() => navigate('/batches')} className="mb-8 flex items-center gap-2 text-gray-600 font-medium hover:text-[#1b212d]">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           Back to Batches
         </button>
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-medium text-[#1b212d] mb-2">Batch Not Found</h2>
          <p className="text-gray-500 font-medium">The batch you are looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const tabs = ['Description', 'All Classes'];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-poppins pt-10 md:pt-12">
      <Sidebar />

      <div className="flex-1 flex flex-col h-[calc(100vh-48px)] overflow-y-auto subtle-scrollbar relative">
        {/* ─── MOBILE HEADER: Back + Batch Name ──────────────────────────── */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1b212d] h-12 flex items-center px-3 border-b border-white/10">
          <button
            onClick={() => navigate('/batches')}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 active:bg-white/10 transition-all mr-2 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="text-white font-semibold text-[14px] truncate leading-tight">{batch.name}</span>
        </header>

        {/* ─── DESKTOP HEADER ────────────────────────────────────────────── */}
        <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#1b212d] h-12 items-center border-b border-white/5">
          <div className="w-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="https://www.pw.live/version14/assets/img/logo.svg" alt="PW" className="h-[26px] invert brightness-0" />
              <span className="text-white font-extrabold text-[18px] tracking-tight">Physics Wallah</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-white font-medium text-[12px]">Hi, Naman</span>
              <img src="https://static.pw.live/images/boy_20250107145242.png" alt="Profile" className="w-7 h-7 rounded-full border border-white/20 bg-gray-800" />
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="w-full">
          {/* Desktop-only: Back bar */}
          <div className="hidden md:block bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-12 flex items-center">
              <button 
                onClick={() => navigate('/batches')}
                className="flex items-center gap-2 text-gray-700 font-medium text-[13px] hover:text-[#1b212d] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Batches
              </button>
            </div>
          </div>

          {/* Desktop-only: Batch name banner */}
          <div 
            className="hidden md:flex w-full bg-white py-6 shadow-sm relative overflow-hidden flex-col justify-center border-b border-gray-100"
            style={{ 
              backgroundImage: `url('https://static.pw.live/react-batches/assets/svg/descriptionHeader.svg')`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="px-6 max-w-[1400px]">
              <h1 className="text-white text-[28px] font-bold leading-tight tracking-tight">
                {batch.name}
              </h1>
            </div>
          </div>

          {/* Tabs Row — spacing gap for mobile */}
          <div className="bg-white border-b border-gray-200 mt-3 md:mt-2 md:sticky md:top-12 z-30 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
              <div className="flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                   <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3.5 md:py-3 text-[14px] font-semibold md:font-medium transition-all relative border-b-2 whitespace-nowrap ${activeTab === tab ? 'text-[#5A4BDA] border-[#5A4BDA]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-6 flex flex-col gap-6 md:gap-8 pb-32 md:pb-24">
            <div className="w-full">
              {activeTab === 'Description' && (
                <div className="flex flex-col gap-6">
                  {/* This Batch Includes Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                    <h2 className="text-[20px] md:text-[24px] font-bold text-[#1b212d] mb-6">This Batch Includes</h2>
                    
                    <div className="space-y-5">
                      <style dangerouslySetInnerHTML={{ __html: `
                        .batch-includes-list { display: flex; flex-direction: column; gap: 16px; }
                        .batch-item { display: flex; align-items: flex-start; gap: 14px; }
                        .batch-item-icon { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                        .batch-item-icon img { width: 100%; height: 100%; object-fit: contain; }
                        .batch-item-content { display: flex; flex-direction: column; gap: 1px; padding-top: 2px; }
                        .batch-item-label { font-size: 14px; font-weight: 400; color: #4B5563; }
                        .batch-item-value { font-size: 14px; font-weight: 600; color: #111827; }
                        .batch-item-single { font-size: 14px; font-weight: 500; color: #374151; line-height: 1.4; padding-top: 4px; }
                        .scrollbar-hide::-webkit-scrollbar { display: none; }
                        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                        
                        .golden-plate {
                          background: linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
                          background-size: 200% auto;
                          color: #4B3200;
                          box-shadow: 0 4px 15px rgba(187, 137, 30, 0.3);
                          border: 1px solid rgba(255, 230, 0, 0.3);
                          animation: shine 3s linear infinite;
                        }
                        @keyframes shine {
                          to { background-position: 200% center; }
                        }
                      `}} />
                      
                      <div className="batch-includes-list" dangerouslySetInnerHTML={{ __html: (batch.shortDescription || "")
                        .replace(/description-meta-container/g, 'batch-includes-list')
                        .replace(/child-container/g, 'batch-item')
                        .replace(/icon/g, 'batch-item-icon')
                        .replace(/text-container/g, 'batch-item-content')
                        .replace(/sub-text/g, 'batch-item-label')
                        .replace(/main-text/g, 'batch-item-value')
                        .replace(/text/g, 'batch-item-single')
                      }} />
                    </div>
                  </div>

                  {/* Know Your Teachers Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                    <h2 className="text-[20px] md:text-[24px] font-bold text-[#1b212d] mb-6">Know Your Teachers</h2>
                    <div className="relative group">
                      <div 
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                        onWheel={(e) => {
                          if (e.deltaY !== 0) {
                            e.preventDefault();
                            e.currentTarget.scrollLeft += e.deltaY;
                          }
                        }}
                      >
                        {[...new Map((batch.subjects || []).flatMap(s => s.teacherIds || []).map(t => [t._id, t])).values()].map((teacher, idx) => (
                          <div key={teacher._id || idx} className="min-w-[190px] md:min-w-[210px] flex-shrink-0 bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group/card relative mb-2">
                            <div className="h-[200px] md:h-[220px] rounded-xl overflow-hidden mb-6 bg-white relative">
                              <img 
                                src={`${teacher.imageId?.baseUrl}${teacher.imageId?.key}`} 
                                alt={teacher.firstName}
                                className="w-full h-full object-contain object-bottom"
                              />
                              {/* Golden Name Box */}
                              <div className="absolute bottom-[35px] left-1/2 -translate-x-1/2 golden-plate px-5 py-2 rounded-lg whitespace-nowrap z-20 min-w-[130px] text-center shadow-lg transform group-hover/card:scale-110 transition-all duration-300">
                                <span className="text-[14px] md:text-[16px] font-black tracking-widest text-[#4A3B00] uppercase shadow-sm">{teacher.firstName}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2 px-1">
                               <div>
                                 <h4 className="text-[14px] font-bold text-[#2D333F] mb-0.5 line-clamp-1">{teacher.subject || 'Subject'}</h4>
                                 <p className="text-[12px] font-semibold text-gray-400">Exp: {teacher.experience}</p>
                               </div>
                               <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'All Classes' && (
                <div className="flex flex-col gap-4">
                  {/* Subjects List: 1-col list on mobile, grid on md+ */}
                  <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(batch.subjects || []).map((subject, i) => (
                      <div 
                        key={subject._id || i}
                        onClick={() => navigate(`/batch/${batchId}/subject/${subject.slug || subject._id}`)}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#5A4BDA]/20 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#F0F2FF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden p-2">
                             {subject.imageId ? (
                               <img 
                                 src={`${subject.imageId.baseUrl}${subject.imageId.key}`} 
                                 alt={subject.subject} 
                                 className="w-full h-full object-contain"
                               />
                             ) : (
                                <img 
                                  src="https://www.pw.live/version14/assets/img/logo.svg" 
                                  className="w-8 h-8 object-contain" 
                                  alt="PW Logo" 
                                />
                             )}
                          </div>
                          <div>
                            <h4 className="text-[16px] font-bold text-[#1b212d] group-hover:text-[#5A4BDA] transition-colors leading-tight">
                              {subject.subject}
                            </h4>
                            <p className="text-[13px] font-medium text-gray-400 mt-1">
                              {subject.lectureCount || 2} Chapters
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <svg className="w-5 h-5 text-gray-300 group-hover:text-[#5A4BDA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailsPage;
