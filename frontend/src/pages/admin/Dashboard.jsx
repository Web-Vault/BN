import React from 'react';
import AdminLayout from './AdminLayout';

const Dashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,234', change: '+12%' },
    { label: 'Active Members', value: '890', change: '+5%' },
    { label: 'Total Revenue', value: '$45,678', change: '+8%' },
    { label: 'Pending Requests', value: '23', change: '-2%' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <span className={`ml-2 text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      User {item} performed an action
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 