import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
// alert('logout');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-6">
            {menuItems.map((section) => (
              <div key={section.section}>
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
        <div className="sticky bottom-0 w-full p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-center text-gray-400 hover:text-white transition-colors duration-200 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <span>⏻</span>
                    <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
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
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 