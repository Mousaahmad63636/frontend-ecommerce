// src/components/Admin/CategoryManager.js
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [originalCategoryName, setOriginalCategoryName] = useState(null);
  const [productsCountByCategory, setProductsCountByCategory] = useState({});
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedCategories = await api.getCategories();
      setCategories(fetchedCategories);
      
      // Get products count for each category
      const productsData = await api.getProducts();
      const countMap = {};
      
      // Count products in each category (both primary and in categories array)
      fetchedCategories.forEach(category => {
        countMap[category] = productsData.filter(product => {
          if (product.category === category) return true;
          if (Array.isArray(product.categories) && product.categories.includes(category)) return true;
          return false;
        }).length;
      });
      
      setProductsCountByCategory(countMap);
      console.log('Received categories:', categories); // Add this line
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      showNotification('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    try {
      if (!newCategory.trim()) {
        showNotification('Category name cannot be empty', 'error');
        return;
      }
      
      if (categories.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
        showNotification('Category already exists', 'error');
        return;
      }
      
      setLoading(true);
      await api.createCategory(newCategory.trim());
      showNotification('Category created successfully', 'success');
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      showNotification(err.message || 'Failed to create category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setOriginalCategoryName(category);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setOriginalCategoryName(null);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingCategory.trim()) {
        showNotification('Category name cannot be empty', 'error');
        return;
      }
      
      if (editingCategory.trim() === originalCategoryName) {
        cancelEditing();
        return;
      }
      
      if (categories.some(cat => 
        cat.toLowerCase() === editingCategory.trim().toLowerCase() && 
        cat !== originalCategoryName)) {
        showNotification('Category already exists', 'error');
        return;
      }
      
      setLoading(true);
      await api.updateCategory(originalCategoryName, editingCategory.trim());
      showNotification('Category updated successfully', 'success');
      cancelEditing();
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      showNotification(err.message || 'Failed to update category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      if (!window.confirm(`Are you sure you want to delete "${category}"? This will remove the category from all products.`)) {
        return;
      }
      
      setLoading(true);
      await api.deleteCategory(category);
      showNotification('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showNotification(err.message || 'Failed to delete category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeCategoriesClick = () => {
    if (categories.length < 2) {
      showNotification('You need at least 2 categories to merge', 'error');
      return;
    }
    
    // Create a modal for merging categories
    const sourceCategory = window.prompt('Enter the source category to merge from:');
    if (!sourceCategory) return;
    
    if (!categories.includes(sourceCategory)) {
      showNotification(`Category "${sourceCategory}" does not exist`, 'error');
      return;
    }
    
    const targetCategory = window.prompt('Enter the target category to merge into:');
    if (!targetCategory) return;
    
    if (!categories.includes(targetCategory)) {
      showNotification(`Category "${targetCategory}" does not exist`, 'error');
      return;
    }
    
    if (sourceCategory === targetCategory) {
      showNotification('Source and target categories cannot be the same', 'error');
      return;
    }
    
    handleMergeCategories(sourceCategory, targetCategory);
  };

  const handleMergeCategories = async (sourceCategory, targetCategory) => {
    try {
      if (!window.confirm(`Are you sure you want to merge "${sourceCategory}" into "${targetCategory}"? This will update all products.`)) {
        return;
      }
      
      setLoading(true);
      await api.mergeCategories(sourceCategory, targetCategory);
      showNotification(`Categories merged: "${sourceCategory}" into "${targetCategory}"`, 'success');
      fetchCategories();
    } catch (err) {
      console.error('Error merging categories:', err);
      showNotification(err.message || 'Failed to merge categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading && categories.length === 0) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading categories...</span>
        </div>
        <p className="mt-2">Loading categories...</p>
      </div>
    );
  }

  // Render error state
  if (error && categories.length === 0) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
        <hr />
        <button 
          className="btn btn-outline-danger" 
          onClick={fetchCategories}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="category-manager">
      {/* Create Category Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h4 className="mb-0">Add New Category</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateCategory}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fas fa-plus me-1"></i>
                )}
                Add Category
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Categories</h4>
          <button
            className="btn btn-outline-secondary"
            onClick={handleMergeCategoriesClick}
            disabled={categories.length < 2}
          >
            <i className="fas fa-object-group me-1"></i>
            Merge Categories
          </button>
        </div>
        <div className="card-body">
          {categories.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
              <p className="lead">No categories found</p>
              <p className="text-muted">Create your first category to organize your products</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category}>
                      <td>
                        {editingCategory === category ? (
                          <form onSubmit={handleUpdateCategory} className="d-flex">
                            <input
                              type="text"
                              className="form-control"
                              value={editingCategory}
                              onChange={(e) => setEditingCategory(e.target.value)}
                              autoFocus
                              required
                            />
                            <button
                              type="submit"
                              className="btn btn-sm btn-success ms-2"
                              disabled={loading}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary ms-1"
                              onClick={cancelEditing}
                              disabled={loading}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </form>
                        ) : (
                          category
                        )}
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {productsCountByCategory[category] || 0} 
                          {productsCountByCategory[category] === 1 ? ' product' : ' products'}
                        </span>
                      </td>
                      <td>
                        {editingCategory !== category && (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => startEditing(category)}
                              disabled={loading}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteCategory(category)}
                              disabled={loading || productsCountByCategory[category] > 0}
                              title={productsCountByCategory[category] > 0 ? 
                                'Cannot delete category with products' : 
                                'Delete category'}
                            >
                              <i className="fas fa-trash-alt"></i>
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
        </div>
        <div className="card-footer bg-white text-muted">
          <small>
            <i className="fas fa-info-circle me-1"></i>
            Categories with associated products cannot be deleted directly. 
            Remove products or change their category first.
          </small>
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;