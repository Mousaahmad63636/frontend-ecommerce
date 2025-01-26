// src/components/Admin/AdminPage.js
import React, { useState } from 'react';
import ProductsSection from '../components/Admin/ProductsSection';
import DiscountsSection from '../components/Admin/DiscountsSection';
import PromoCodesSection from '../components/Admin/PromoCodesSection';
import TimerManager from '../components/Admin/TimerManager';
import OrderManagement from '../components/OrderManagement';
import SettingsSection from '../components/Admin/SettingsSection'; // Add this import
import HeroSection from '../components/Admin/HeroSection';
import { useNotification } from '../components/Notification/NotificationProvider';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('products');
    const { showNotification } = useNotification();

    const tabs = [
        { id: 'products', name: 'Products', icon: 'fa-box' },
        { id: 'discounts', name: 'Discounts', icon: 'fa-percent' },
        { id: 'promoCodes', name: 'Promo Codes', icon: 'fa-tags' },
        { id: 'orders', name: 'Orders', icon: 'fa-shopping-cart' },
        { id: 'settings', name: 'Settings', icon: 'fa-cog' },
        { id: 'timer', name: 'Timer', icon: 'fa-clock' },
        { id: 'hero', name: 'Hero Section', icon: 'fa-image' } // Add this line
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
            return <HeroSection />; // Add this line
          default:
            return <ProductsSection />;
        }
      };

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                {/* Sidebar Navigation */}
                <div className="col-md-2">
                    <div className="list-group">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`list-group-item list-group-item-action ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`fas ${tab.icon} me-2`}></i>
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-md-10">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h3 className="mb-0">
                                <i className={`fas ${tabs.find(t => t.id === activeTab)?.icon} me-2`}></i>
                                {tabs.find(t => t.id === activeTab)?.name} Management
                            </h3>
                        </div>
                        <div className="card-body">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-4 text-center text-muted">
                <small>Admin Dashboard &copy; {new Date().getFullYear()}</small>
            </footer>
        </div>
    );
}

export default AdminPage;