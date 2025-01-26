// src/services/GuestStorage.js

export const GuestStorage = {
    saveCustomerInfo: (info) => {
        localStorage.setItem('customerInfo', JSON.stringify(info));
    },

    getCustomerInfo: () => {
        const info = localStorage.getItem('customerInfo');
        return info ? JSON.parse(info) : null;
    },

    saveAddress: (address) => {
        const addresses = GuestStorage.getAddresses();
        const updatedAddresses = [...addresses, { ...address, id: Date.now() }];
        localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    },

    getAddresses: () => {
        const addresses = localStorage.getItem('addresses');
        return addresses ? JSON.parse(addresses) : [];
    },

    clearAll: () => {
        // Don't clear cart and wishlist as they should persist
        localStorage.removeItem('customerInfo');
        localStorage.removeItem('addresses');
    }
};