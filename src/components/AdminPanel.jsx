import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('admin_auth') === 'true');
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState({
    totalViews: 0,
    onlineUsers: 1,
    activeTokens: 0
  });

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Raj') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      alert('Wrong Password!');
      setPassword('');
    }
  };

  // Fetch Data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        // Fetch Online Users & View Stats
        const hbRes = await fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: 'admin_console' })
        });
        const hbData = await hbRes.json();

        // Fetch Tokens
        const tokenRes = await fetch('/api/admin/tokens');
        const tokenData = await tokenRes.json();

        // Fetch Batches
        const batchRes = await fetch('https://api.pimaxer.in/batches');
        const batchData = await batchRes.json();

        // Fetch Contexts
        const ctxRes = await fetch('/api/admin/contexts');
        const ctxData = await ctxRes.json();

        setStats({
          onlineUsers: hbData.onlineUsers || 1,
          activeTokens: tokenData.tokens?.filter(t => t.tokenStatus).length || 0,
          totalViews: (tokenData.tokens?.length * 15) + (hbData.onlineUsers * 5) || 0 
        });

        setTokens(tokenData.tokens || []);
        setContexts(ctxData.contexts || []);
        if (batchData.success) setBatches(batchData.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleRefreshTokens = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/tokens/refresh-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully refreshed ${data.refreshedCount} tokens!`);
        const tokenRes = await fetch('/api/admin/tokens');
        const tokenData = await tokenRes.json();
        setTokens(tokenData.tokens || []);
      }
    } catch (err) {
      alert('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1b212d] flex items-center justify-center p-4 font-poppins">
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[32px] space-y-8 animate-in zoom-in duration-300 shadow-2xl">
           <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-[#5A4BDA]/20 rounded-3xl flex items-center justify-center text-[#5A4BDA] mx-auto mb-6 shadow-inner">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Admin Portal</h2>
              <p className="text-gray-400 text-sm font-medium">Restricted Access • System Console</p>
           </div>
           <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Terminal Key" 
                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4.5 text-white outline-none focus:border-[#5A4BDA] focus:bg-white/10 transition-all text-center tracking-[0.3em] font-black"
                autoFocus
              />
              <button 
                type="submit"
                className="w-full bg-[#5A4BDA] text-white py-4.5 rounded-2xl font-bold hover:bg-[#4437B8] transition-all transform active:scale-95 shadow-xl shadow-[#5A4BDA]/20"
              >
                Authenticate
              </button>
           </form>
           <button onClick={() => navigate('/')} className="w-full text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
              Return to Site
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-poppins pt-14 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1b212d] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1b212d] tracking-tight">System Console</h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Version 2.5 • MongoDB Connected</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                 onClick={handleRefreshTokens}
                 disabled={refreshing}
                 className="bg-[#5A4BDA] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#5A4BDA]/20 hover:bg-[#4437B8] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh All Tokens'}
              </button>
              <button 
                onClick={() => { sessionStorage.removeItem('admin_auth'); setIsAuthenticated(false); }}
                className="bg-white border-2 border-gray-100 text-gray-400 p-2.5 rounded-xl hover:text-rose-500 hover:border-rose-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
           </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Online Now', value: stats.onlineUsers, icon: 'zap', color: 'text-rose-500', bg: 'bg-rose-50' },
             { label: 'Active Tokens', value: stats.activeTokens, icon: 'key', color: 'text-[#5A4BDA]', bg: 'bg-[#5A4BDA]/5' },
             { label: 'Catalog Size', value: batches.length, icon: 'box', color: 'text-amber-500', bg: 'bg-amber-50' },
             { label: 'System Views', value: stats.totalViews.toLocaleString(), icon: 'eye', color: 'text-emerald-500', bg: 'bg-emerald-50' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`}>
                   {renderIcon(stat.icon)}
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                   <h3 className="text-xl font-black text-[#1b212d]">{stat.value}</h3>
                </div>
             </div>
           ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 gap-8">
           {['Overview', 'Tokens', 'Captures', 'Management'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#5A4BDA]' : 'text-gray-300'}`}
             >
               {tab}
               {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#5A4BDA] rounded-t-full"></div>}
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {activeTab === 'Overview' && (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center space-y-4">
                 <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 </div>
                 <h2 className="text-xl font-black text-[#1b212d]">Control Center</h2>
                 <p className="text-gray-400 text-sm max-w-sm mx-auto font-medium">All systems operational. Tracking {stats.onlineUsers} users.</p>
              </div>
           )}

           {activeTab === 'Tokens' && (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50">
                          <tr>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscriber</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Activity</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {tokens.length > 0 ? tokens.map(token => (
                             <tr key={token._id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#5A4BDA] flex items-center justify-center font-black text-xs">
                                         {token.ownerName?.[0] || 'U'}
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-[#1b212d]">{token.ownerName}</p>
                                         <p className="text-[10px] text-gray-400 font-medium">{token.phone}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${token.tokenStatus ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                      {token.tokenStatus ? 'Active' : 'Expired'}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   <p className="text-[11px] text-gray-400 font-bold">{new Date(token.lastUpdated).toLocaleTimeString()}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button className="text-[10px] font-black text-[#5A4BDA] hover:underline uppercase tracking-widest">Detail</button>
                                </td>
                             </tr>
                          )) : (
                            <tr><td colSpan="4" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">No tokens captured yet</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {activeTab === 'Captures' && (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#1b212d] uppercase tracking-widest">Captured Token Contexts</h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Captures: {contexts.length}</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50">
                          <tr>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Device / Source</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Raw Data (Context)</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Captured At</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {contexts.length > 0 ? contexts.map(ctx => (
                             <tr key={ctx._id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                      <span className="text-xs font-bold font-mono text-gray-600">{ctx.deviceId?.slice(-8)}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 whitespace-pre-wrap max-w-md">
                                   <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-[10px] font-mono text-gray-500 break-all h-12 overflow-y-auto">
                                      {JSON.stringify(ctx.context, null, 2)}
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <p className="text-[11px] text-gray-400 font-bold">{new Date(ctx.capturedAt).toLocaleString()}</p>
                                </td>
                             </tr>
                          )) : (
                            <tr><td colSpan="3" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">No contexts captured yet</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {activeTab === 'Management' && (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
                 <div className="max-w-md space-y-6">
                    <h2 className="text-lg font-black text-[#1b212d]">Manual Token Injection</h2>
                    <form className="space-y-4" onSubmit={(e) => {
                       e.preventDefault();
                       const formData = new FormData(e.target);
                       const data = Object.fromEntries(formData);
                       fetch('/api/admin/tokens/manual', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data)
                       }).then(() => alert('Success'));
                    }}>
                       <div className="grid grid-cols-2 gap-4">
                          <input name="ownerName" placeholder="Owner Name" className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-[#5A4BDA]" required />
                          <input name="phone" placeholder="Phone" className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-[#5A4BDA]" required />
                       </div>
                       <input name="accessToken" placeholder="Access Token" className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-[#5A4BDA]" required />
                       <input name="refreshToken" placeholder="Refresh Token" className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-[#5A4BDA]" required />
                       <button type="submit" className="w-full bg-[#1b212d] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Inject Token</button>
                    </form>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const renderIcon = (type) => {
  const props = { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5 };
  switch (type) {
    case 'eye': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
    case 'box': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    case 'key': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
    case 'zap': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    default: return null;
  }
};

export default AdminPanel;
