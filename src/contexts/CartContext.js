// src/contexts/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNotification } from '../components/Notification/NotificationProvider';
import { openSideCart } from '../utils/cartUtils';
const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const { showNotification } = useNotification();

    // Persist cart to localStorage
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Check for sold out items in cart
    useEffect(() => {
        const soldOutItems = cartItems.filter(item => item.soldOut);
        if (soldOutItems.length > 0) {
            soldOutItems.forEach(item => {
                showNotification(`${item.name} is no longer available and has been removed from your cart`, 'warning');
            });
            setCartItems(prevItems => prevItems.filter(item => !item.soldOut));
        }
    }, [cartItems, showNotification]);

    // Fixed and unified addToCart function
    const addToCart = (product, quantity = 1, selectedColor = '', selectedSize = '') => {

        // Create a unique identifier for this product + options combination
        const itemId = `${product._id}${selectedColor ? `-${selectedColor}` : ''}${selectedSize ? `-${selectedSize}` : ''}`;
        
        setCartItems(prevItems => {
            // Find if this exact combination already exists in cart
            const existingItemIndex = prevItems.findIndex(item => {
                // Handle different possible cart item structures
                const itemProductId = item.product?._id || item._id;
                
                return (
                    itemProductId === product._id &&
                    item.selectedColor === selectedColor &&
                    item.selectedSize === selectedSize
                );
            });

            if (existingItemIndex !== -1) {
                // Item exists, update quantity
                const newQuantity = prevItems[existingItemIndex].quantity + quantity;

                // Check if exceeds limit
                if (newQuantity > 10) {
                    showNotification('Maximum quantity limit reached for this item', 'warning');
                    return prevItems;
                }

                return prevItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                // Item doesn't exist, add new
                // Using standardized structure with product as reference + separate selected options
                return [...prevItems, {
                    _id: product._id,            // Store product ID directly for easy access
                    product: product,            // Reference to full product
                    name: product.name,          // Store name directly for easy display
                    price: product.price,        // Store price directly for calculations
                    images: product.images,      // Store images directly for display
                    quantity: quantity,
                    selectedColor: selectedColor,
                    selectedSize: selectedSize,
                    itemId: itemId               // Store unique identifier for variants
                }];
            }
            openSideCart();
        });

        const colorInfo = selectedColor ? ` (${selectedColor})` : '';
        const sizeInfo = selectedSize ? ` (Size: ${selectedSize})` : '';
        showNotification(`${quantity} ${product.name}${colorInfo}${sizeInfo} added to cart`, 'success');
    };

    const removeFromCart = (itemIdentifier) => {
        setCartItems(prevItems => {
            const filteredItems = prevItems.filter(item => {
                // Check if we're using the composite itemId or just the product._id
                if (item.itemId) {
                    return item.itemId !== itemIdentifier;
                } else {
                    const itemId = item.product?._id || item._id;
                    return itemId !== itemIdentifier;
                }
            });

            // If we found and removed an item, show notification
            if (filteredItems.length < prevItems.length) {
                const removedItem = prevItems.find(item => {
                    if (item.itemId) {
                        return item.itemId === itemIdentifier;
                    } else {
                        const itemId = item.product?._id || item._id;
                        return itemId === itemIdentifier;
                    }
                });

                if (removedItem) {
                    const colorInfo = removedItem.selectedColor ? ` (${removedItem.selectedColor})` : '';
                    const sizeInfo = removedItem.selectedSize ? ` (Size: ${removedItem.selectedSize})` : '';
                    const itemName = removedItem.name || removedItem.product?.name || 'Item';
                    showNotification(`${itemName}${colorInfo}${sizeInfo} removed from cart`, 'success');
                }
            }

            return filteredItems;
        });
    };

    const updateQuantity = (itemIdentifier, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemIdentifier);
            return;
        }

        if (quantity > 10) { // Example limit of 10 items
            showNotification('Maximum quantity limit reached', 'warning');
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item => {
                // Check if we're using the composite itemId or just the product._id
                const itemId = item.itemId || item.product?._id || item._id;
                if (itemId === itemIdentifier) {
                    return { ...item, quantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
        showNotification('Cart cleared', 'success');
    };

    // src/contexts/CartContext.js (continued)
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.discountPrice || item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const isInCart = (productId) => {
        return cartItems.some(item => {
            const itemProductId = item.product?._id || item._id;
            return itemProductId === productId;
        });
    };

    const updateProductInCart = (itemId, updates) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                const currentItemId = item.itemId || item.product?._id || item._id;
                if (currentItemId === itemId) {
                    return { ...item, ...updates };
                }
                return item;
            })
        );
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartItemsCount,
            isInCart,
            updateProductInCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;