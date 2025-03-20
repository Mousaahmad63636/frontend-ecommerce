import React from 'react';
import { Helmet } from 'react-helmet-async';

function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Helmet>
        <title>About Spotlylb - Your Trendy Shopping Destination</title>
        <meta name="description" content="Learn about Spotlylb - the perfect online shopping destination for trendy products at affordable prices." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-3">About Spotlylb</h1>
        <div className="w-24 h-1 bg-purple-600 mx-auto mb-12 rounded-full"></div>
        
        {/* Our Story Section - Enhanced */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-600 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-store text-xl text-purple-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-purple-700">Our Story</h2>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed text-lg">
              Spotly is the perfect online shopping destination for anyone who loves staying on top of trends without breaking the bank.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed text-lg">
              We offer a wide range of trendy products—from home essentials to gadgets and everything in between—all at affordable prices.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg font-medium">
              Where trends meet needs, we've got something for everyone.
            </p>
          </div>
        </div>
        
        {/* Features Grid - Enhanced with animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center transform hover:translate-y-[-8px] transition-transform duration-300">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-5">
              <i className="fas fa-headset text-3xl text-blue-500"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">24/7 Support</h3>
            <p className="text-gray-600">Our team is always available to assist you with any questions or concerns.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center transform hover:translate-y-[-8px] transition-transform duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <i className="fas fa-truck text-3xl text-green-500"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Fast Delivery</h3>
            <p className="text-gray-600">We ensure your orders reach you quickly and in perfect condition.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center transform hover:translate-y-[-8px] transition-transform duration-300">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-5">
              <i className="fas fa-smile text-3xl text-yellow-500"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">2000+ Happy Customers</h3>
            <p className="text-gray-600">Join our community of satisfied customers who love our products.</p>
          </div>
        </div>
        
        {/* Our Mission Section - Enhanced */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-lg p-8 mb-16 text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <i className="fas fa-bullseye mr-3"></i> Our Mission
            </h2>
            <p className="mb-4 leading-relaxed">
              At Spotlylb, we're committed to bringing you the latest trends and essential products that enhance your everyday life. Our mission is to provide quality items at affordable prices, making trendy shopping accessible to everyone.
            </p>
            <p className="leading-relaxed">
              We believe in creating a seamless shopping experience, from browsing our carefully curated selection to delivering your purchases right to your doorstep.
            </p>
          </div>
        </div>
        
        {/* Social Media Section - Enhanced */}
        <div className="text-center bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Connect With Us</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Follow us on social media to stay updated with our latest products, promotions, and trends!
          </p>
          <div className="flex justify-center space-x-8">
            <a 
              href="https://www.instagram.com/spotlylb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 transform hover:scale-110 transition-transform duration-300"
            >
              <i className="fab fa-instagram text-4xl"></i>
              <p className="mt-2 text-sm font-medium">Instagram</p>
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61570963155100" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transform hover:scale-110 transition-transform duration-300"
            >
              <i className="fab fa-facebook text-4xl"></i>
              <p className="mt-2 text-sm font-medium">Facebook</p>
            </a>
            <a 
              href="https://www.tiktok.com/@spotlylb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 transform hover:scale-110 transition-transform duration-300"
            >
              <i className="fab fa-tiktok text-4xl"></i>
              <p className="mt-2 text-sm font-medium">TikTok</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;