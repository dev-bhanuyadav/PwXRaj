import React from 'react';
import { useNavigate } from 'react-router-dom';

const BatchCard = ({ batch, isOffline = false }) => {
  const navigate = useNavigate();

  const handleCheckout = (e) => {
    e.stopPropagation();
    if (batch && batch.id) {
      navigate(`/batch/${batch.id}`);
    }
  };

  if (isOffline) {
    return (
      <div className="bg-[#1b212d] rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-800 h-full flex flex-col">
        <div className="absolute top-4 left-4 z-10 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          OFFLINE CENTRE
        </div>

        <div className="w-full h-[200px] bg-gray-900 overflow-hidden relative">
          <img
            src="https://static.pw.live/ua/images/vidyapeeth_default.webp"
            alt="Offline Center"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            style={{ width: '100%', height: '100%', display: 'block' }}
            onError={(e) => e.target.src = 'https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/67a369a90af17d7290ede6bf.png'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b212d] to-transparent"></div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wide">Class 12 JEE</div>
            <div className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-[10px] font-semibold border border-white/10">HINGLISH</div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-6">Vidyapeeth</h3>

          <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold text-white">₹5,000</div>
              <div className="text-[10px] text-white/40 font-semibold">For Registration</div>
            </div>
            <button 
              onClick={() => navigate('/batch/offline')}
              className="bg-white text-[#1b212d] px-5 py-2 rounded-lg font-semibold text-[12px] active:scale-95 transition-all"
            >
              Book A Seat
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) return null;

  const discount = Math.round(((batch.off_price - batch.actual_price) / batch.off_price) * 100);

  return (
    <div 
      onClick={handleCheckout}
      className="relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,255,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(90,75,218,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      {/* Glow accent top-right */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: 'radial-gradient(circle, rgba(90,75,218,0.4) 0%, transparent 70%)', transform: 'translate(40%, -40%)' }}
      />

      {/* Top Banner */}
      <div className="relative w-full overflow-hidden aspect-[16/9] bg-gray-100">
        <img 
          src={batch.png_url || batch.pngUrl} 
          alt={batch.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Glassmorphism bottom overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 to-transparent" />
        {/* Discount badge */}
        {discount > 0 && (
          <div 
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-black text-white"
            style={{ background: 'linear-gradient(135deg, #5A4BDA, #7C6FE8)', boxShadow: '0 2px 10px rgba(90,75,218,0.4)' }}
          >
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Class tag */}
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(90,75,218,0.08)', color: '#5A4BDA' }}
          >
            {batch.class_name || 'Batch'}
          </span>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">HINGLISH</span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#1b212d] mb-3 leading-snug line-clamp-2 group-hover:text-[#5A4BDA] transition-colors">
          {batch.name}
        </h3>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          {batch.exam && (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[12px] font-medium truncate">{batch.exam}</span>
            </div>
          )}
          {batch.starts_on && (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[12px] font-medium">Starts: {batch.starts_on}</span>
            </div>
          )}
        </div>

        {/* Price row */}
        <div 
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(90,75,218,0.08)' }}
        >
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] font-black text-[#1b212d]">₹{batch.actual_price}</span>
              {batch.off_price && batch.off_price !== batch.actual_price && (
                <span className="text-[12px] text-gray-400 line-through font-medium">₹{batch.off_price}</span>
              )}
            </div>
          </div>
          <div 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #1b212d 0%, #2d3748 100%)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          >
            View Batch
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
