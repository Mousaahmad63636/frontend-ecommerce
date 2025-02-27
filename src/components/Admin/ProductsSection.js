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
            
            // Append all form data
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            
            if (formData.images && formData.images.length > 0) {
                Array.from(formData.images).forEach(image => {
                    formDataToSend.append('images', image);
                });
            }

            if (editingId) {
                formDataToSend.append('keepExisting', formData.keepExisting);
                await api.updateProduct(editingId, formDataToSend);
                showNotification('Product updated successfully', 'success');
            } else {
                await api.addProduct(formDataToSend);
                showNotification('Product added successfully', 'success');
            }

            clearForm();
            fetchProducts();
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
            fetchProducts();
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
            images: [],
            keepExisting: true
        });
        setImagePreviews((product.images || []).map(getImageUrl));
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

    return (
        <div className="w-full">
            {/* Filters Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-md border-gray-300 pl-10 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

                    <div className="w-full md:w-64">
                        <div className="flex rounded-md shadow-sm">
                            <select
                                className="block w-full rounded-l-md border-r-0 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                            >
                                <option value="date">Date Created</option>
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="category">Category</option>
                            </select>
                            <button
                                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {sortOrder === 'asc' ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products
                    {searchTerm && ` matching "${searchTerm}"`}
                    {filterCategory !== 'all' && ` in ${filterCategory}`}
                </div>
            </div>

            {/* Add/Edit Product Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            ></textarea>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                    onClick={() => setShowCategoryModal(true)}
                                    className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 hover:bg-gray-100 sm:text-sm"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images (Max 5)</label>
                            <input
                                type="file"
                                id="images"
                                name="images"
                                onChange={handleInputChange}
                                accept="image/*"
                                multiple
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                required={!editingId}
                            />
                        </div>

                        <div className="col-span-2">
                            {imagePreviews.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {editingId && (
                            <div className="col-span-2">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="keepExisting"
                                            name="keepExisting"
                                            type="checkbox"
                                            checked={formData.keepExisting}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                keepExisting: e.target.checked
                                            }))}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="keepExisting" className="font-medium text-gray-700">Keep existing images</label>
                                        <p className="text-gray-500">If you upload new images, you can choose to keep or replace the existing ones.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-start space-x-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {editingId ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                editingId ? 'Update Product' : 'Add Product'
                            )}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={clearForm}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Product List</h3>
                </div>
                <div className="overflow-x-auto">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Products Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || filterCategory !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by adding your first product.'}
                            </p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-sm object-cover"
                                                        src={product.images && product.images.length > 0 
                                                            ? getImageUrl(product.images[0]) 
                                                            : 'https://placehold.co/60@3x.png'}
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            e.target.src = 'https://placehold.co/60@3x.png';
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                                            {product.originalPrice && (
                                                <div className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.soldOut ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {product.soldOut ? 'Sold Out' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleToggleSoldOut(product._id, product.soldOut)}
                                                    className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${product.soldOut ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'}`}
                                                >
                                                    {product.soldOut ? 'Mark In Stock' : 'Mark Sold Out'}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Category Modal - Fixed positioning with proper z-index */}
            {showCategoryModal && (
                <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    
                    {/* Modal panel */}
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Add New Category</h3>
                                            <div className="mt-4">
                                                <form onSubmit={handleAddCategory}>
                                                    <div className="mb-4">
                                                        <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">Category Name</label>
                                                        <input
                                                            type="text"
                                                            id="newCategory"
                                                            value={newCategory}
                                                            onChange={(e) => setNewCategory(e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Enter category name"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                        <button
                                                            type="submit"
                                                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                                                        >
                                                            Add Category
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                            onClick={() => setShowCategoryModal(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductsSection;