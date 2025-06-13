import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const ChapterManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Demo data - replace with actual API call
  const chapters = [
    {
      id: 1,
      name: 'React Enthusiasts',
      location: 'Gujarat',
      members: 3,
      status: 'Active',
      foundedDate: '2025-05-20',
      description: 'A group for tech enthusiasts to collaborate on ideas.',
    }
    // Add more demo chapters as needed
  ];

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      // Here you would make an API call to delete the chapter
      console.log('Deleting chapter:', chapterToDelete.id);
      console.log('Admin password:', deletePassword);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setChapterToDelete(null);
      setDeletePassword('');
      setDeleteError('');
    } catch (error) {
      setDeleteError('Failed to delete chapter. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Chapter Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Add Chapter
            </button>
          </div>
        </div>

        {/* Chapters Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Founded Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{chapter.name}</div>
                    <div className="text-sm text-gray-500">{chapter.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{chapter.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{chapter.members}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      chapter.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {chapter.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{chapter.foundedDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewChapter(chapter.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClick(chapter)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Chapter</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete {chapterToDelete.name}? This action cannot be undone.
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
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setChapterToDelete(null);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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