import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../../config/config.js';

const ChapterManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_BASE_URL}/api/chapters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapters(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to fetch chapters');
      setLoading(false);
    }
  };

  const filteredChapters = chapters.filter(chapter =>
    chapter.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.chapterRegion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewChapter = (chapterId) => {
    navigate(`/admin/chapters/${chapterId}`);
  };

  const handleDeleteClick = (chapter) => {
    setChapterToDelete(chapter);
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion');
      return;
    }

    try {
      await axios.delete(`${config.API_BASE_URL}/api/chapters/${chapterToDelete._id}`, {
        data: { password: deletePassword }
      });
      
      toast.success('Chapter deleted successfully');
      setShowDeleteModal(false);
      setChapterToDelete(null);
      setDeletePassword('');
      setDeleteError('');
      fetchChapters(); // Refresh the list
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete chapter. Please try again.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Chapter Management</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {/* <button 
              onClick={() => navigate('/admin/chapters/create')}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Chapter</span>
            </button> */}
          </div>
        </div>

        {/* Chapters Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Location
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Members
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Founded Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChapters.map((chapter) => (
                  <tr key={chapter._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{chapter.chapterName}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{chapter.chapterDesc}</div>
                      <div className="mt-1 sm:hidden text-sm text-gray-500">
                        {chapter.chapterCity ? `${chapter.chapterCity}, ${chapter.chapterRegion}` : chapter.chapterRegion}
                      </div>
                      <div className="mt-1 sm:hidden text-sm text-gray-500">
                        Members: {chapter.members?.length || 0}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-500">
                        {chapter.chapterCity ? `${chapter.chapterCity}, ${chapter.chapterRegion}` : chapter.chapterRegion}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-500">{chapter.members?.length || 0}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-500">
                        {new Date(chapter.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewChapter(chapter._id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(chapter)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Chapter</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete {chapterToDelete.chapterName}? This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                {deleteError && (
                  <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setChapterToDelete(null);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ChapterManagement;