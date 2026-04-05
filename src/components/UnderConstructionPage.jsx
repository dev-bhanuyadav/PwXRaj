import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnderConstructionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-12 font-poppins">
      
      {/* Content wrapper */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1b212d] tracking-tight">
            This page is <span className="text-[#5A4BDA]">Under construction</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-semibold uppercase tracking-wider">
            Coming Soon • Physics Wallah
          </p>
        </div>

        {/* Video container — Rectangular and Clean */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 bg-[#F8F9FA]">
          <video
            src="https://res.cloudinary.com/dm50qybtk/video/upload/v1774441797/Animate_thing_for_202603251752_iqukxw.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 px-10 py-4 rounded-xl bg-[#1b212d] hover:bg-[#2d3544] text-white font-bold text-[15px] transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </button>

      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-8 flex items-center gap-2 opacity-30 grayscale pointer-events-none">
        <img src="https://www.pw.live/version14/assets/img/logo.svg" alt="PW" className="h-5" />
        <span className="font-bold text-sm tracking-tight text-[#1b212d]">Physics Wallah</span>
      </div>

    </div>
  );
};

export default UnderConstructionPage;
