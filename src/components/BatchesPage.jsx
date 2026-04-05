import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BatchCard from './BatchCard';

const BatchesPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    // Show WhatsApp popup after 2 seconds
    const timer = setTimeout(() => {
      setShowWhatsApp(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('https://api.pimaxer.in/batches')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBatches(data.data);
          // Tracking Real Page Hits (CountAPI)
          fetch('https://api.countapi.xyz/hit/physicswallah-sub/batches_views').catch(() => {});
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching batches:', err);
        setLoading(false);
      });
  }, []);

  const filteredBatches = batches.filter(batch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      batch.name?.toLowerCase().includes(searchLower) ||
      batch.exam?.toLowerCase().includes(searchLower) ||
      batch.class_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex min-h-screen bg-white font-poppins pt-10 md:pt-12">
      <Sidebar />

      <div className="flex-1 flex flex-col h-[calc(100vh-48px)] overflow-hidden font-poppins">
        {/* Sub-Header Section (White Bar) */}
        <div className="bg-white px-4 md:px-10 py-3 border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-lg md:text-2xl font-semibold text-[#1b212d] tracking-tight font-poppins">Batches</h1>

            <div className="relative w-full sm:max-w-lg group">
              <input
                type="text"
                placeholder="Search for prayas"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-11 pr-6 border transition-all font-poppins text-[14px] outline-none placeholder:text-gray-300"
                style={{
                  borderRadius: '5px',
                  borderColor: '#CDD1D8',
                  backgroundColor: '#fff'
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5A4BDA] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Area */}
        <main className="flex-1 p-3 md:p-6 overflow-y-auto bg-[#f8f9fa] subtle-scrollbar">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-[350px] md:h-[450px] border border-gray-100" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pb-24 md:pb-20">
                {filteredBatches.map(batch => (
                  <BatchCard key={batch.id} batch={batch} />
                ))}

                {filteredBatches.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <div className="text-gray-400 font-bold text-lg mb-2">
                      {searchTerm ? `No results found for "${searchTerm}"` : 'No active batches found'}
                    </div>
                    <p className="text-gray-500 text-sm">Please try a different search term or check back later.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* WhatsApp Channel Popup */}
      <WhatsAppPopup show={showWhatsApp} onClose={() => setShowWhatsApp(false)} />
    </div>
  );
};

const WhatsAppPopup = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[24px] w-full max-w-[320px] overflow-hidden shadow-2xl scale-in-center animate-in zoom-in duration-300 relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-400"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col">
          {/* Header Image/Pattern */}
          <div className="h-20 bg-[#25D366] flex items-center justify-center relative overflow-hidden">
             <div className="bg-white p-2.5 rounded-2xl shadow-md border border-[#25D366]/20">
              <svg className="w-8 h-8 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-[#1b212d]">WhatsApp Channel</h3>
              <p className="text-gray-500 font-medium text-xs leading-relaxed">
                Stay updated with the latest batch announcements and notes directly on your phone!
              </p>
            </div>

            <div className="flex flex-col w-full gap-2">
              <a 
                href="https://www.whatsapp.com/channel/0029VbAvDSX0QeahEg4kkE3U"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm hover:bg-[#20bd5a] transition-all transform hover:-translate-y-0.5 active:scale-[0.98] shadow-sm"
              >
                Join Now Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              <button 
                onClick={onClose}
                className="text-gray-400 font-bold text-[10px] tracking-widest uppercase hover:text-gray-600 transition-colors py-1"
              >
                Maybe Later
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              12,400+ Joined
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchesPage;
