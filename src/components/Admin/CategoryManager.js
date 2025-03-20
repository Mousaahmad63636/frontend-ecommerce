// src/components/Admin/CategoryManager.js
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api'; // Use the configured API client with auth

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Categories:", categories);
    console.log("Category counts:", categoryCounts);
  }, [categories, categoryCounts]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching categories...');
      const response = await api.getCategories();
      console.log("Categories response:", response);
      
      // Check response format
      if (!response || !response.categories) {
        throw new Error('Invalid response format');
      }
      
      setCategories(response.categories);
      setCategoryCounts(response.categoryCounts || {});
      console.log(`Loaded ${response.categories.length} categories successfully`);
      console.log('Category counts:', response.categoryCounts);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
      showNotification('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      showNotification('Category name cannot be empty', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.createCategory(newCategory.trim());
      showNotification('Category created successfully', 'success');
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      showNotification(
        err.response?.data?.message || 'Failed to create category', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category);
    setUpdatedCategoryName(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setUpdatedCategoryName('');
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    if (!updatedCategoryName.trim()) {
      showNotification('Category name cannot be empty', 'error');
      return;
    }
    
    if (updatedCategoryName.trim() === editingCategory) {
      handleCancelEdit();
      return;
    }
    
    setLoading(true);
    
    try {
      await api.updateCategory(editingCategory, updatedCategoryName.trim());
      showNotification('Category updated successfully', 'success');
      handleCancelEdit();
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      showNotification(
        err.response?.data?.message || 'Failed to update category', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    console.log(`Attempting to delete ${category}, count: ${categoryCounts[category] || 0}`);
    
    // Allow deletion if fewer than 2 products
    if ((categoryCounts[category] || 0) >= 2) {
      showNotification(
        `Cannot delete category "${category}" because it is used by ${categoryCounts[category]} products`, 
        'error'
      );
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      await api.deleteCategory(category);
      showNotification('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showNotification(
        err.response?.data?.message || 'Failed to delete category', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMergeCategories = async () => {
    if (categories.length < 2) {
      showNotification('You need at least 2 categories to merge', 'error');
      return;
    }
    
    const sourceCategory = window.prompt('Enter the source category (the one to be merged):');
    if (!sourceCategory || !categories.includes(sourceCategory)) {
      showNotification('Invalid source category', 'error');
      return;
    }
    
    const targetCategory = window.prompt('Enter the target category (the one to keep):');
    if (!targetCategory || !categories.includes(targetCategory) || targetCategory === sourceCategory) {
      showNotification('Invalid target category', 'error');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to merge "${sourceCategory}" into "${targetCategory}"?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      await api.mergeCategories(sourceCategory, targetCategory);
      showNotification(`Successfully merged "${sourceCategory}" into "${targetCategory}"`, 'success');
      fetchCategories();
    } catch (err) {
      console.error('Error merging categories:', err);
      showNotification(
        err.response?.data?.message || 'Failed to merge categories', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading && categories.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading categories...</p>
      </div>
    );
  }

  // Render error state
  if (error && categories.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error loading categories!</strong>
        <p className="block sm:inline"> {error}</p>
        <button 
          onClick={fetchCategories}
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="category-manager space-y-6">
      {/* Create category form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Category</h2>
        
        <form onSubmit={handleCreateCategory} className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter new category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
            disabled={loading || !newCategory.trim()}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Add Category'
            )}
          </button>
        </form>
      </div>

      {/* Categories list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          
          <button
            onClick={handleMergeCategories}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md flex items-center"
            disabled={loading || categories.length < 2}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v6.5a.5.5 0 01-1 0V3a2 2 0 114 0v6.5a.5.5 0 01-1 0V3a1 1 0 00-1-1z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 18a1 1 0 001-1v-6.5a.5.5 0 011 0V17a2 2 0 11-4 0v-6.5a.5.5 0 011 0V17a1 1 0 001 1z" clipRule="evenodd" />
            </svg>
            Merge Categories
          </button>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-gray-600">No categories found. Create your first category above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products Count
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategory === category ? (
                        <form onSubmit={handleUpdateCategory} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={updatedCategoryName}
                            onChange={(e) => setUpdatedCategoryName(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md"
                            title="Save"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded-md"
                            title="Cancel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </form>
                      ) : (
                        <span className="text-gray-900 font-medium">{category}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoryCounts[category] || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCategory !== category && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(category)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Edit"
                            disabled={loading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className={`p-1 ${
                              (categoryCounts[category] || 0) >= 2
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                            title={(categoryCounts[category] || 0) >= 2 ? `Can't delete (used by ${categoryCounts[category]} products)` : "Delete"}
                            disabled={loading || (categoryCounts[category] || 0) >= 2}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Categories with 2 or more products cannot be deleted. You must first remove or change the category of those products.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;