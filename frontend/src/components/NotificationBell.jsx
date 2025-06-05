import { useState, useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ isScrolled }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.API_BASE_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Handle the new response structure
      if (response.data && response.data.notifications) {
        // Only show unread notifications in the bell dropdown
        const unreadNotifications = response.data.notifications.filter(n => !n.read);
        setNotifications(unreadNotifications);
        setUnreadCount(response.data.unreadCount);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the notification from the list since it's now read
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Handle navigation based on notification type and link
      const notification = notifications.find(n => n._id === notificationId);
      if (notification) {
        if (notification.link) {
          navigate(notification.link);
        } else {
          // Fallback navigation based on type
          switch (notification.type) {
            case 'activity_pending_verification':
              navigate('/activity/pending-verifications');
              break;
            case 'activity_verified':
            case 'activity_rejected':
              navigate('/activity');
              break;
            case 'investment_created':
            case 'investment_funded':
            case 'investment_completed':
              navigate('/investments');
              break;
            case 'withdrawal_requested':
            case 'withdrawal_approved':
            case 'withdrawal_rejected':
              navigate('/withdrawals');
              break;
            default:
              navigate('/profile');
          }
        }
      }
      
      setShowDropdown(false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.API_BASE_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear all notifications from the list since they're all read now
      setNotifications([]);
      setUnreadCount(0);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError("Failed to mark all notifications as read");
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 focus:outline-none transition-colors duration-300 ${
          isScrolled 
            ? 'text-black hover:text-blue-600' 
            : 'text-white hover:text-blue-400'
        }`}
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className={`absolute ${isMobile ? 'fixed inset-0 bg-black/80 backdrop-blur-md' : 'right-0 top-full mt-2 w-80 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20'} z-50`}>
          {isMobile && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-white hover:text-blue-400 transition-colors duration-300"
                  >
                    <FiBell className="text-xl" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-400">
                    Loading notifications...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-400">
                    {error}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="p-4 border-b border-white/20 hover:bg-white/10 cursor-pointer transition-colors duration-200 bg-white/10"
                      onClick={() => markAsRead(notification._id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <img
                            src={notification.sender?.userImage || "/default-avatar.png"}
                            alt={notification.sender?.userName || "User"}
                            className="w-10 h-10 rounded-full border-2 border-blue-400/50"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 border-t border-white/20">
                  <button
                    onClick={markAllAsRead}
                    className="w-full py-2 text-sm text-white bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors duration-300"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}

          {!isMobile && (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading notifications...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">
                    {error}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="p-4 border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors duration-200 bg-blue-50"
                      onClick={() => markAsRead(notification._id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <img
                            src={notification.sender?.userImage || "/default-avatar.png"}
                            alt={notification.sender?.userName || "User"}
                            className="w-10 h-10 rounded-full border-2 border-blue-100"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 