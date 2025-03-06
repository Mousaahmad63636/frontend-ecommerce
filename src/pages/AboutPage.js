import React from 'react';
import { Helmet } from 'react-helmet-async';

function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Helmet>
        <title>About Spotlylb - Your Trendy Shopping Destination</title>
        <meta name="description" content="Learn about Spotlylb - the perfect online shopping destination for trendy products at affordable prices." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">About Spotlylb</h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="/heroww.jpg" 
                alt="Spotlylb Products Showcase" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-4 text-purple-700">Our Story</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Spotly is the perfect online shopping destination for anyone who loves staying on top of trends without breaking the bank.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We offer a wide range of trendy products—from home essentials to gadgets and everything in between—all at affordable prices.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Where trends meet needs, we've got something for everyone.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-headset text-2xl text-blue-500"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">Our team is always available to assist you with any questions or concerns.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-truck text-2xl text-green-500"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">We ensure your orders reach you quickly and in perfect condition.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-smile text-2xl text-yellow-500"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">2000+ Happy Customers</h3>
            <p className="text-gray-600">Join our community of satisfied customers who love our products.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            At Spotlylb, we're committed to bringing you the latest trends and essential products that enhance your everyday life. Our mission is to provide quality items at affordable prices, making trendy shopping accessible to everyone.
          </p>
          <p className="text-gray-700">
            We believe in creating a seamless shopping experience, from browsing our carefully curated selection to delivering your purchases right to your doorstep.
          </p>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Follow Us On Social Media</h3>
          <div className="flex justify-center space-x-6">
            <a 
              href="https://www.instagram.com/spotlylb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700"
            >
              <i className="fab fa-instagram text-3xl"></i>
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61570963155100" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <i className="fab fa-facebook text-3xl"></i>
            </a>
            <a 
              href="https://www.tiktok.com/@spotlylb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700"
            >
              <i className="fab fa-tiktok text-3xl"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;