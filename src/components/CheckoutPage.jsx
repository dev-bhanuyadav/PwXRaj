import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Fetch batch details if needed, or get from location state.
    // For now, we'll fetch from the api to show real data.
    fetch('https://api.pimaxer.in/batches')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const found = data.data.find(b => b.id.toString() === batchId);
          setBatch(found);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching batch:', err);
        setLoading(false);
      });
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A4BDA]"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Batch Not Found</h2>
        <button 
          onClick={() => navigate('/batches')}
          className="bg-[#5A4BDA] text-white px-8 py-3 rounded-md font-bold"
        >
          Back to Batches
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-20 pb-12 px-4 md:px-8 font-poppins">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#5A4BDA] text-white flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-[12px] font-bold text-[#5A4BDA]">Order Summary</span>
            </div>
            <div className="w-16 h-[2px] bg-gray-200 mb-6"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-[12px] font-bold text-gray-400">Payment</span>
            </div>
            <div className="w-16 h-[2px] bg-gray-200 mb-6"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-[12px] font-bold text-gray-400">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-black text-[#1b212d] mb-6">Order Summary</h2>
              
              <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-full md:w-40 aspect-video rounded-lg overflow-hidden shrink-0 shadow-sm">
                  <img 
                    src={batch.png_url || batch.pngUrl} 
                    alt={batch.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="text-[11px] font-black text-[#5A4BDA] uppercase tracking-wider mb-1">{batch.exam}</div>
                    <h3 className="text-lg font-bold text-[#1b212d] leading-snug">{batch.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-500 font-bold text-sm">Quantity: 1</span>
                    <span className="text-lg font-black text-[#1b212d]">₹{batch.actual_price}</span>
                  </div>
                </div>
              </div>

              {/* Promo Section */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <label className="block text-[13px] font-black text-gray-500 uppercase tracking-wider mb-3">Apply Coupon</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    className="flex-1 h-12 px-4 rounded-lg border border-gray-200 outline-none focus:border-[#5A4BDA] font-medium text-sm bg-[#fafafa]"
                  />
                  <button className="px-6 h-12 bg-white border border-[#5A4BDA] text-[#5A4BDA] rounded-lg font-bold text-[13px] hover:bg-[#5A4BDA]/5 transition-all">
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="flex items-center gap-4 p-5 bg-[#5A4BDA]/5 rounded-2xl border border-[#5A4BDA]/10">
              <div className="w-10 h-10 rounded-full bg-[#5A4BDA] text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-bold text-[#1b212d]/80 leading-relaxed">
                Facing issues with payment? Reach out to our 24/7 support at <span className="text-[#5A4BDA]">support@pw.live</span>
              </p>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[#1b212d] rounded-2xl p-6 text-white shadow-xl shadow-[#1b212d]/10 sticky top-24">
              <h2 className="text-lg font-black mb-6 opacity-60 uppercase tracking-widest text-[14px]">Bill Details</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-sm font-bold">Batch Amount</span>
                  <span className="text-sm font-black line-through">₹{batch.off_price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold opacity-70">Discount Price</span>
                  <span className="text-sm font-black text-green-400">-₹{batch.off_price - batch.actual_price}</span>
                </div>
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-sm font-bold">GST (18%)</span>
                  <span className="text-sm font-black">₹0 (Inclusive)</span>
                </div>
                <div className="h-[1px] bg-white/10 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black">Total Amount</span>
                  <span className="text-2xl font-black">₹{batch.actual_price}</span>
                </div>
              </div>

              <button 
                className="w-full bg-[#5A4BDA] hover:bg-[#4437B8] text-white h-14 rounded-xl font-black text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                onClick={() => alert('Proceeding to Payment...')}
              >
                <span>Proceed to Pay</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
