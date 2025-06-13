import React, { useState } from 'react';
import AdminLayout from './AdminLayout';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: false,
    language: 'en',
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleLanguageChange = (e) => {
    setSettings(prev => ({
      ...prev,
      language: e.target.value
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Notification Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications in real-time</p>
                  </div>
                  <button
                    onClick={() => handleToggle('notifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Alerts</h3>
                    <p className="text-sm text-gray-500">Receive email notifications</p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.emailAlerts ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                </div>
                <button
                  onClick={() => handleToggle('darkMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Language Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Language</h2>
              <div>
                <select
                  value={settings.language}
                  onChange={handleLanguageChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings; 