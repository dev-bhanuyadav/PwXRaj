import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isOnBatches = location.pathname === '/batches' || location.pathname.startsWith('/batch/');

  const sections = [
    {
      title: 'LEARN ONLINE',
      items: [
        {
          name: 'Study',
          path: '/under-construction',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path d="M14.0514 3.73889L15.4576 2.33265C16.0678 1.72245 17.0572 1.72245 17.6674 2.33265C18.2775 2.94284 18.2775 3.93216 17.6674 4.54235L8.81849 13.3912C8.37792 13.8318 7.83453 14.1556 7.23741 14.3335L5 15L5.66648 12.7626C5.84435 12.1655 6.1682 11.6221 6.60877 11.1815L14.0514 3.73889ZM14.0514 3.73889L16.25 5.93749M15 11.6667V15.625C15 16.6605 14.1605 17.5 13.125 17.5H4.375C3.33947 17.5 2.5 16.6605 2.5 15.625V6.87499C2.5 5.83946 3.33947 4.99999 4.375 4.99999H8.33333" stroke="#5a4bda" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        },
        {
          name: 'Batches',
          path: '/batches',
          active: isOnBatches,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path d="M7.5 14.137V15.2145C7.5 15.8775 7.23661 16.5134 6.76777 16.9822L6.25 17.5H13.75L13.2322 16.9822C12.7634 16.5134 12.5 15.8775 12.5 15.2145V14.375M17.5 4.137V12.5C17.5 13.5355 16.6605 14.137 15.625 14.355H4.375C3.33947 14.375 2.5 13.5355 2.5 12.5V4.375M17.5 4.375C17.5 3.33947 16.6605 2.5 15.625 2.5H4.375C3.33947 2.5 2.5 3.33947 2.5 4.375M17.5 4.375V10C17.5 11.0355 16.6605 11.875 15.625 11.875H4.375C3.33947 11.875 2.5 11.0355 2.5 10V4.375" stroke="#5a4bda" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        },
      ]
    }
  ];

  // ─── MOBILE: Bottom Tab Bar ───────────────────────────────────────────────
  const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-stretch h-16 safe-area-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      {sections[0].items.map((item) => (
        <button
          key={item.name}
          onClick={() => navigate(item.path)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors active:bg-gray-50 ${
            item.active
              ? 'text-[#5A4BDA]'
              : 'text-gray-400'
          }`}
        >
          <div className={`transition-all ${item.active ? 'scale-110' : ''}`}>
            {item.icon}
          </div>
          <span className={`text-[11px] font-semibold tracking-tight ${item.active ? 'text-[#5A4BDA]' : 'text-gray-400'}`}>
            {item.name}
          </span>
        </button>
      ))}
    </nav>
  );

  // ─── DESKTOP: Classic Sidebar ─────────────────────────────────────────────
  const DesktopSidebar = () => (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col h-[calc(100vh-48px)] sticky top-12 overflow-y-auto subtle-scrollbar font-poppins shrink-0">
      {sections.map((section, idx) => (
        <div key={idx} className="p-4 border-b border-gray-50 last:border-0">
          <h3
            className="text-[11px] font-bold uppercase tracking-wider mb-6 px-4 mt-6 font-poppins"
            style={{ color: 'var(--static-color-grey-2)' }}
          >
            {section.title}
          </h3>
          <nav className="space-y-4">
            {section.items.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group font-poppins ${
                  item.active
                    ? 'bg-[#5A4BDA]/5 text-[#5A4BDA] font-bold'
                    : 'text-[#3d3d3d] hover:bg-gray-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-[14px]">{item.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
};

export default Sidebar;
