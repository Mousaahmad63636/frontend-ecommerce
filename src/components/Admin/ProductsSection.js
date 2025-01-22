import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';
import { getImageUrl } from '../../utils/imageUtils';

function ProductsSection() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const { showNotification } = useNotification();
    const [newCategory, setNewCategory] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        images: []
    });

    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
            const uniqueCategories = [...new Set(data.map(product => product.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            showNotification('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filterAndSortProducts = useCallback(() => {
        let result = [...products];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower)
            );
        }

        if (filterCategory !== 'all') {
            result = result.filter(product => product.category === filterCategory);
        }

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'price':
                    comparison = parseFloat(a.price) - parseFloat(b.price);
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'date':
                default:
                    comparison = new Date(b.createdAt) - new Date(a.createdAt);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredProducts(result);
    }, [products, searchTerm, filterCategory, sortField, sortOrder]);

    useEffect(() => {
        filterAndSortProducts();
    }, [filterAndSortProducts]);

    const handleInputChange = (e) => {
        const { name, type, files, value } = e.target;

        if (type === 'file') {
            const fileArray = Array.from(files);

            if (fileArray.length > 5) {
                showNotification('Maximum 5 images allowed', 'error');
                return;
            }

            setFormData(prev => ({
                ...prev,
                images: fileArray
            }));

            const previewUrls = fileArray.map(file => URL.createObjectURL(file));
            setImagePreviews(previewUrls);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            showNotification('Please enter a category name', 'error');
            return;
        }

        if (categories.includes(newCategory.trim())) {
            showNotification('Category already exists', 'error');
            return;
        }

        try {
            const updatedCategories = [...categories, newCategory.trim()];
            setCategories(updatedCategories);
            setNewCategory('');
            setShowCategoryModal(false);
            showNotification('Category added successfully', 'success');
        } catch (error) {
            showNotification('Error adding category', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const formDataToSend = new FormData();

            // Append the basic product data
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);

            // Append each image
            Array.from(formData.images).forEach(image => {
                formDataToSend.append('images', image);
            });

            if (editingId) {
                formDataToSend.append('keepExisting', formData.keepExisting);
                await api.updateProduct(editingId, formDataToSend);
                showNotification('Product updated successfully', 'success');
            } else {
                await api.addProduct(formDataToSend);
                showNotification('Product added successfully', 'success');
            }

            clearForm();
            fetchProducts(); // Changed from fetchPromoCodes to fetchProducts
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error saving product';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };
    const handleToggleSoldOut = async (productId, currentSoldOutStatus) => {
        try {
            await api.toggleProductSoldOut(productId, !currentSoldOutStatus);
            showNotification(
                `Product marked as ${!currentSoldOutStatus ? 'sold out' : 'in stock'}`,
                'success'
            );
            fetchProducts(); // Refresh the product list
        } catch (error) {
            console.error('Error toggling sold out status:', error);
            showNotification('Error updating product status', 'error');
        }
    };
    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            images: []
        });
        setImagePreviews(product.images.map(getImageUrl));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.deleteProduct(id);
                showNotification('Product deleted successfully!', 'success');
                fetchProducts();
            } catch (error) {
                showNotification('Error deleting product', 'error');
            }
        }
    };

    const clearForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            images: []
        });
        setImagePreviews([]);
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: Array.from(prev.images).filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    if (loading && !products.length) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-5">
                            <div className="input-group">
                                <label className="input-group-text">Sort by</label>
                                <select
                                    className="form-select"
                                    value={sortField}
                                    onChange={(e) => setSortField(e.target.value)}
                                >
                                    <option value="date">Date Created</option>
                                    <option value="name">Name</option>
                                    <option value="price">Price</option>
                                    <option value="category">Category</option>
                                </select>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortOrder === 'asc' ? (
                                        <i className="fas fa-sort-amount-up-alt"></i>
                                    ) : (
                                        <i className="fas fa-sort-amount-down"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3">
                        <small className="text-muted">
                            Showing {filteredProducts.length} of {products.length} products
                            {searchTerm && ` matching "${searchTerm}"`}
                            {filterCategory !== 'all' && ` in ${filterCategory}`}
                        </small>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Product Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="3"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Category</label>
                            <div className="input-group">
                                <select
                                    className="form-select"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select category...</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => setShowCategoryModal(true)}
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Product Images (Max 5)</label>
                            <input
                                type="file"
                                className="form-control"
                                name="images"
                                onChange={handleInputChange}
                                accept="image/*"
                                multiple
                                required={!editingId}
                            />
                            {imagePreviews.length > 0 && (
                                <div className="mt-2 d-flex gap-2 flex-wrap">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="position-relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="img-thumbnail"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {editingId && (
                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="keepExisting"
                                    name="keepExisting"
                                    checked={formData.keepExisting}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        keepExisting: e.target.checked
                                    }))}
                                />
                                <label className="form-check-label" htmlFor="keepExisting">
                                    Keep existing images
                                </label>
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        {editingId ? 'Updating...' : 'Adding...'}
                                    </>
                                ) : (
                                    editingId ? 'Update Product' : 'Add Product'
                                )}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Product List</h3>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <i className="fas fa-box fa-3x text-muted mb-3"></i>
                                            <h5>No Products Found</h5>
                                            <p className="text-muted">
                                                {searchTerm || filterCategory !== 'all'
                                                    ? 'Try adjusting your filters'
                                                    : 'No products have been added yet'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(product => (
                                        <tr key={product._id}>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    {product.images?.map((image, index) => (
                                                        <img
                                                            key={index}
                                                            src={getImageUrl(image)}
                                                            alt={`${product.name} ${index + 1}`}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            className="rounded"
                                                            onError={(e) => {
                                                                e.target.src = 'https://placehold.co/60@3x.png';
                                                              }}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.category}</td>
                                            <td>${product.price.toFixed(2)}</td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className={`btn ${product.soldOut ? 'btn-success' : 'btn-warning'}`}
                                                        onClick={() => handleToggleSoldOut(product._id, product.soldOut)}
                                                    >
                                                        {product.soldOut ? 'Mark In Stock' : 'Mark Sold Out'}
                                                    </button>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(product._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showCategoryModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
                    <div className="modal" style={{ display: 'block', zIndex: 1050 }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Category</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowCategoryModal(false)}
                                    ></button>
                                </div>
                                <form onSubmit={handleAddCategory}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Category Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                placeholder="Enter category name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowCategoryModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Add Category
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default ProductsSection;