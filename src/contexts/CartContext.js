// src/contexts/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNotification } from '../components/Notification/NotificationProvider';

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

    const addToCart = (product, quantity = 1) => {
        if (product.soldOut) {
            showNotification('This product is sold out', 'error');
            return;
        }

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === product._id);
            
            if (existingItem) {
                // Check if new total quantity would exceed any limit
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > 10) { // Example limit of 10 items
                    showNotification('Maximum quantity limit reached for this item', 'warning');
                    return prevItems;
                }

                return prevItems.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }
            
            return [...prevItems, { ...product, quantity }];
        });

        showNotification(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart`, 'success');
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            const itemToRemove = prevItems.find(item => item._id === productId);
            if (itemToRemove) {
                showNotification(`${itemToRemove.name} removed from cart`, 'success');
                return prevItems.filter(item => item._id !== productId);
            }
            return prevItems;
        });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        if (quantity > 10) { // Example limit of 10 items
            showNotification('Maximum quantity limit reached', 'warning');
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
        showNotification('Cart cleared', 'success');
    };

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
        return cartItems.some(item => item._id === productId);
    };

    const updateProductInCart = (productId, updates) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === productId
                    ? { ...item, ...updates }
                    : item
            )
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