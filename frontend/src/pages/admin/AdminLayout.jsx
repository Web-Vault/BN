import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const menuItems = [
    {
      section: 'Overview',
      items: [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/platform-report', label: 'Platform Report', icon: '📈' },
      ]
    },
    {
      section: 'User Management',
      items: [
        { path: '/admin/users', label: 'All Users', icon: '👥' },
        // { path: '/admin/user-investments', label: 'User Investments', icon: '💰' },
        // { path: '/admin/user-connections', label: 'User Connections', icon: '🔗' },
        // { path: '/admin/user-businesses', label: 'User Businesses', icon: '🏢' },
        // { path: '/admin/user-referrals', label: 'User Referrals', icon: '↪️' },
        // { path: '/admin/user-transactions', label: 'User Transactions', icon: '💸' },
      ]
    },
    {
      section: 'Chapter Management',
      items: [
        { path: '/admin/chapters', label: 'All Chapters', icon: '📚' },
        // { path: '/admin/chapter-members', label: 'Chapter Members', icon: '👥' },
        // { path: '/admin/chapter-events', label: 'Chapter Events', icon: '📅' },
      ]
    },
    {
      section: 'Community',
      items: [
        { path: '/admin/posts', label: 'Community Place', icon: '📢' },
        { path: '/admin/memberships', label: 'Memberships', icon: '🎖️' },
      ]
    },
    {
      section: 'Moderation',
      items: [
        { path: '/admin/warnings', label: 'Warnings', icon: '⚠️' },
        { path: '/admin/bans', label: 'Bans', icon: '🚫' },
      ]
    },
    {
      section: 'Settings',
      items: [
        { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col h-screen`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-hidden">
          <nav className="h-full overflow-y-auto px-4 py-4 custom-scrollbar">
            {menuItems.map((section) => (
              <div key={section.section} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 p-3 rounded-lg mb-1 ${
                        location.pathname === item.path
                          ? 'bg-gray-700'
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-center text-gray-400 hover:text-white transition-colors duration-200 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <span>⏻</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Admin</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout; 