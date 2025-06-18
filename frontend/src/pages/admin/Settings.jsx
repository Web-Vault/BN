import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import config from "../../config/config.js";
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    notifications: true,
    emailAlerts: false,
    darkMode: false,
    language: "en",

    // Website Settings
    maintenanceMode: false,
    allowUserRegistration: true,
    enableComments: true,
    maxUploadSize: "5",

    // Admin Settings
    twoFactorAuth: false,
    // sessionTimeout: '30',
    showAnalytics: true,
    autoBackup: true,

    // Security Settings
    // passwordExpiry: '90',
    loginAttempts: "5",
    ipRestriction: false,
    // sslEnforcement: true
  });

  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllAdmins, setShowAllAdmins] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    userName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch current admin data
        const currentAdminRes = await axios.get(
          `${config.API_BASE_URL}/api/admin/current`,
          { headers }
        );
        setCurrentAdmin(currentAdminRes.data);

        // Fetch all admins
        const allAdminsRes = await axios.get(
          `${config.API_BASE_URL}/api/admin/all`,
          { headers }
        );
        setAllAdmins(allAdminsRes.data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.response?.data?.message || "Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(
          `${config.API_BASE_URL}/api/settings`,
          { headers }
        );
        setSettings(response.data);
      } catch (err) {
        setSettingsError(
          err.response?.data?.message || "Failed to fetch settings"
        );
        toast.error('Failed to load settings');
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (setting) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const newValue = !settings[setting];
      await axios.patch(
        `${config.API_BASE_URL}/api/settings/${setting}`,
        { value: newValue },
        { headers }
      );

      setSettings((prev) => ({
        ...prev,
        [setting]: newValue,
      }));
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || "Failed to update setting"
      );
    }
  };

  const handleSelectChange = async (setting, value) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${config.API_BASE_URL}/api/settings/${setting}`,
        { value },
        { headers }
      );

      setSettings((prev) => ({
        ...prev,
        [setting]: value,
      }));
    } catch (err) {
      setSettingsError(
        err.response?.data?.message || "Failed to update setting"
      );
    }
  };

  const handleNumberChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(false);

    // Validate passwords match if changing password
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      setEditError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setEditError('Authentication token not found');
        return;
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Only send fields that have values
      const updateData = {
        userName: editForm.userName
      };

      // Only include password fields if new password is provided
      if (editForm.newPassword) {
        updateData.currentPassword = editForm.currentPassword;
        updateData.newPassword = editForm.newPassword;
      }

      // console.log('Sending update data:', updateData); // Debug log

      const response = await axios.put(
        `${config.API_BASE_URL}/api/admin/profile`,
        updateData,
        { headers }
      );

      setCurrentAdmin(response.data);
      setEditSuccess(true);
      setIsEditing(false);
      setEditForm({
        userName: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      // console.error('Profile update error:', err.response?.data || err);
      setEditError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const startEditing = () => {
    setEditForm({
      userName: currentAdmin.userName,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(true);
    setEditError(null);
    setEditSuccess(false);
  };

  // Get visible admins based on showAllAdmins state
  const visibleAdmins = showAllAdmins ? allAdmins : allAdmins.slice(0, 3);

  const handleSettingChange = (setting, value) => {
    setCurrentSetting({ name: setting, value });
    setShowConfirmModal(true);
  };

  const confirmSettingChange = async () => {
    try {
      const { name, value } = currentSetting;
      
      await axios.patch(`${config.API_BASE_URL}/api/settings/${name}`, 
        { value },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

    setSettings(prev => ({
      ...prev,
        [name]: value
      }));

      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setShowConfirmModal(false);
      setCurrentSetting(null);
    }
  };

  const getSettingImpact = (setting) => {
    const impacts = {
      maintenanceMode: {
        title: 'Maintenance Mode',
        adminImpact: 'Admin panel will remain accessible',
        userImpact: 'Regular users will see a maintenance page and cannot access the website'
      },
      allowUserRegistration: {
        title: 'User Registration',
        adminImpact: 'No impact on admin functionality',
        userImpact: 'New users will not be able to register on the website'
      },
      enableComments: {
        title: 'Comments',
        adminImpact: 'No impact on admin functionality',
        userImpact: 'Users will not be able to comment on posts and discussions'
      },
      maxUploadSize: {
        title: 'Upload Size',
        adminImpact: 'Applies to all file uploads across the platform',
        userImpact: 'Users will be limited to the selected file size for uploads'
      }
    };
    return impacts[setting] || { title: setting, adminImpact: '', userImpact: '' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        {settingsError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {settingsError}
          </div>
        )}

        {/* Admin Information Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Admin Information
              </h2>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading admin information...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Admin Info */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-medium text-gray-900">
                        Current Admin
                      </h3>
                      {!isEditing && (
                        <button
                          onClick={startEditing}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleEditSubmit} className="space-y-6">
                        {editError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            {editError}
                          </div>
                        )}
                        {editSuccess && (
                          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                            Profile updated successfully!
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <input
                            type="text"
                            value={editForm.userName}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                userName: e.target.value,
                              }))
                            }
                            className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            New Password (optional)
                          </label>
                          <input
                            type="password"
                            value={editForm.newPassword}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                          />
                        </div>

                        {editForm.newPassword && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={editForm.confirmPassword}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                              required
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={editForm.currentPassword}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      currentAdmin && (
                        <div className="grid xs:grid-cols-1 md:grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-sm font-medium">
                              {currentAdmin.userName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium">
                              {currentAdmin.userEmail}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Member Since
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(
                                currentAdmin.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Last Updated
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(
                                currentAdmin.updatedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* All Admins List */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                      All Administrators
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Member Since
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {visibleAdmins.map((admin) => (
                            <tr key={admin._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {admin.userName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {admin.userEmail}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(admin.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    admin.isAccountVerified
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {admin.isAccountVerified
                                    ? "Verified"
                                    : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Show More Button */}
                    {allAdmins.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setShowAllAdmins(!showAllAdmins)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {showAllAdmins
                            ? "Show Less"
                            : `Show More (${allAdmins.length - 3} more)`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-8">
            {settingsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading settings...
                </p>
              </div>
            ) : (
              <>
                {/* Notification Settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Notification Settings
                  </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Push Notifications
                        </h3>
                        <p className="text-sm text-gray-500">
                          Receive notifications in real-time
                        </p>
                  </div>
                  <button
                        onClick={() => handleToggle("notifications")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.notifications ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.notifications
                              ? "translate-x-6"
                              : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Email Alerts
                        </h3>
                        <p className="text-sm text-gray-500">
                          Receive email notifications
                        </p>
                  </div>
                  <button
                        onClick={() => handleToggle("emailAlerts")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.emailAlerts ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.emailAlerts
                              ? "translate-x-6"
                              : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

                {/* Website Settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Website Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Maintenance Mode
                        </h3>
                        <p className="text-sm text-gray-500">
                          Put website in maintenance mode
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange("maintenanceMode", !settings.maintenanceMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.maintenanceMode
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.maintenanceMode
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          User Registration
                        </h3>
                        <p className="text-sm text-gray-500">
                          Allow new user registrations
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange("allowUserRegistration", !settings.allowUserRegistration)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.allowUserRegistration
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.allowUserRegistration
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Comments System
                        </h3>
                        <p className="text-sm text-gray-500">
                          Enable comments on posts
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingChange("enableComments", !settings.enableComments)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.enableComments
                            ? "bg-blue-600"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.enableComments
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900">
                        Maximum Upload Size (MB)
                      </label>
                      <select
                        value={settings.maxUploadSize}
                        onChange={(e) =>
                          handleSettingChange("maxUploadSize", e.target.value)
                        }
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="5">5 MB</option>
                        <option value="10">10 MB</option>
                        <option value="20">20 MB</option>
                        <option value="50">50 MB</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Admin Settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Admin Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-500">
                          Enable 2FA for admin accounts
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle("twoFactorAuth")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.twoFactorAuth ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.twoFactorAuth
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-900">Session Timeout (minutes)</label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSelectChange('sessionTimeout', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div> */}

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Show Analytics
                        </h3>
                        <p className="text-sm text-gray-500">
                          Display analytics dashboard
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle("showAnalytics")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.showAnalytics ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.showAnalytics
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Auto Backup
                        </h3>
                        <p className="text-sm text-gray-500">
                          Enable automatic system backups
                        </p>
                </div>
                <button
                        onClick={() => handleToggle("autoBackup")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.autoBackup ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.autoBackup
                              ? "translate-x-6"
                              : "translate-x-1"
                    }`}
                  />
                </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-900">Password Expiry (days)</label>
                      <select
                        value={settings.passwordExpiry}
                        onChange={(e) => handleSelectChange('passwordExpiry', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                      </select>
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-900">
                        Maximum Login Attempts
                      </label>
                      <select
                        value={settings.loginAttempts}
                        onChange={(e) =>
                          handleSelectChange("loginAttempts", e.target.value)
                        }
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="3">3 attempts</option>
                        <option value="5">5 attempts</option>
                        <option value="10">10 attempts</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          IP Restriction
                        </h3>
                        <p className="text-sm text-gray-500">
                          Restrict admin access to specific IPs
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle("ipRestriction")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.ipRestriction ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.ipRestriction
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">SSL Enforcement</h3>
                        <p className="text-sm text-gray-500">Force HTTPS connections</p>
                      </div>
                      <button
                        onClick={() => handleToggle('sslEnforcement')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.sslEnforcement ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.sslEnforcement ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div> */}
              </div>
            </div>

                {/* Appearance Settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Appearance
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
            <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Dark Mode
                        </h3>
                        <p className="text-sm text-gray-500">
                          Switch between light and dark theme
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle("darkMode")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settings.darkMode ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.darkMode
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

              <div>
                      <label className="block text-sm font-medium text-gray-900">
                        Language
                      </label>
                <select
                  value={settings.language}
                        onChange={(e) =>
                          handleSelectChange("language", e.target.value)
                        }
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
              </>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && currentSetting && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Setting Change
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {getSettingImpact(currentSetting.name).title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    New value: {currentSetting.value.toString()}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <h5 className="font-medium text-blue-900">Impact on Admin Panel:</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    {getSettingImpact(currentSetting.name).adminImpact}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-md">
                  <h5 className="font-medium text-yellow-900">Impact on User Website:</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    {getSettingImpact(currentSetting.name).userImpact}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setCurrentSetting(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSettingChange}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings; 
