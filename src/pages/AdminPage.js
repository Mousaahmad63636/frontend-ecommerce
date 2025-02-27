// src/components/Admin/AdminPage.js
import React, { useState } from 'react';
import ProductsSection from './ProductsSection';
import DiscountsSection from './DiscountsSection';
import PromoCodesSection from './PromoCodesSection';
import TimerManager from './TimerManager';
import OrderManagement from '../OrderManagement';
import SettingsSection from './SettingsSection';
import HeroSection from './HeroSection';
import { useNotification } from '../Notification/NotificationProvider';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('products');
    const { showNotification } = useNotification();

    const tabs = [
        { id: 'products', name: 'Products', icon: 'fa-box' },
        { id: 'discounts', name: 'Discounts', icon: 'fa-percent' },
        { id: 'promoCodes', name: 'Promo Codes', icon: 'fa-tags' },
        { id: 'orders', name: 'Orders', icon: 'fa-shopping-cart' },
        { id: 'settings', name: 'Settings', icon: 'fa-cog' },
        { id: 'timer', name: 'Sales Timer', icon: 'fa-clock' },
        { id: 'hero', name: 'Hero Section', icon: 'fa-image' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <ProductsSection />;
            case 'discounts':
                return <DiscountsSection />;
            case 'promoCodes':
                return <PromoCodesSection />;
            case 'orders':
                return <OrderManagement />;
            case 'settings':
                return <SettingsSection />;
            case 'timer':
                return <TimerManager />;
            case 'hero':
                return <HeroSection />;
            default:
                return <ProductsSection />;
        }
    };

    return (
        <div className="container-fluid" style={{ paddingTop: '80px' }}>
            <div className="row">
                {/* Fixed Sidebar */}
                <div className="col-md-2 position-fixed start-0 h-100 bg-light border-end" 
                     style={{ width: '250px', top: '80px', overflowY: 'auto' }}>
                    <div className="list-group list-group-flush">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`list-group-item list-group-item-action d-flex align-items-center 
                                    ${activeTab === tab.id ? 'active bg-primary text-white' : 'bg-light'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`fas ${tab.icon} me-3 fs-5`}></i>
                                <span className="fs-6">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-10 offset-md-2 p-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h3 className="mb-0 d-flex align-items-center">
                                <i className={`fas ${tabs.find(t => t.id === activeTab)?.icon} me-3 fs-4`}></i>
                                {tabs.find(t => t.id === activeTab)?.name} Management
                            </h3>
                        </div>
                        <div className="card-body p-4">
                            {renderContent()}
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-4 text-center text-muted small">
                        <p className="mb-0">Admin Dashboard &copy; {new Date().getFullYear()}</p>
                        <p className="text-muted">Version 1.0.0</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;