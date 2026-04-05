import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [randomId, setRandomId] = useState('');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleGetOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return alert('Enter a valid 10-digit number');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/get-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setRandomId(data.randomId);
        setStep(2);
        setResendTimer(30);
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return alert('Enter 6-digit OTP');
    if (!name.trim()) return alert('Please enter your name');
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, randomId, ownerName: name })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pw_user_name', name);
        localStorage.setItem('pw_auth_token', data.data.access_token);
        navigate('/batches');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (err) {
      alert('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-poppins">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 md:p-10 space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
             <div className="flex justify-center mb-6">
                <img src="https://www.pw.live/version14/assets/img/logo.svg" alt="PW Logo" className="h-12" />
             </div>
             <h1 className="text-2xl font-black text-[#1b212d]">Welcome to PW</h1>
             <p className="text-gray-400 text-sm font-medium">Log in to continue your learning journey</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleGetOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+91</span>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter Mobile Number" 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-[#5A4BDA] focus:bg-white transition-all"
                    autoFocus
                  />
                </div>
              </div>
              <button 
                disabled={phone.length !== 10 || loading}
                type="submit"
                className="w-full pw-button-primary py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name" 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#5A4BDA] focus:bg-white transition-all"
                  />
               </div>
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Verify OTP</label>
                    <button 
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleGetOtp}
                      className="text-[11px] font-black text-[#5A4BDA] uppercase tracking-widest disabled:text-gray-300"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP" 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-center tracking-[0.5em] outline-none focus:border-[#5A4BDA] focus:bg-white transition-all"
                    autoFocus
                  />
               </div>
               <button 
                disabled={otp.length !== 6 || !name.trim() || loading}
                type="submit"
                className="w-full pw-button-primary py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Verify & Log In'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-center text-gray-400 text-[11px] font-bold uppercase tracking-widest py-2"
              >
                Change Number
              </button>
            </form>
          )}

          <div className="text-center">
             <p className="text-[10px] text-gray-300 font-medium leading-relaxed">
               By continuing, you agree to PW's <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
