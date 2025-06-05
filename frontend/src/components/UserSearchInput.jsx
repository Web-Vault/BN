import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiX } from 'react-icons/fi';

const UserSearchInput = ({ onUserSelect, selectedUser, setSelectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setError('');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${config.API_BASE_URL}/api/users/search?query=${searchTerm}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching users:', error);
        setError('Error searching users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.userName);
    setShowSuggestions(false);
    setError('');
    onUserSelect(user);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value) {
      setSelectedUser(null);
      onUserSelect(null);
    }
  };

  const clearSelection = () => {
    setSearchTerm('');
    setSelectedUser(null);
    onUserSelect(null);
    setError('');
  };

  return (
    <div className="relative" ref={suggestionsRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search user by name..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
        />
        {selectedUser && (
          <button
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center space-x-3"
            >
              <img
                src={user.userImage || "/default-avatar.png"}
                alt={user.userName}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && searchTerm.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">No users found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default UserSearchInput; 