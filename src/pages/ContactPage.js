import React from 'react';
import ContactSection from '../components/ContactSection';
import { Helmet } from 'react-helmet-async';

function ContactPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Helmet>
        <title>Contact Us - Spotlylb</title>
        <meta name="description" content="Get in touch with our team at Spotlylb. We're here to help with all your questions and needs." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Contact Us</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Get In Touch</h2>
          
          <div className="flex flex-col md:flex-row mb-6">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-4">
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <i className="fas fa-phone-alt mr-3 text-purple-600"></i>
                  <a href="tel:+96176919370" className="hover:text-purple-600">+961 76 919 370</a>
                </li>
                <li className="flex items-center">
                  <i className="fab fa-whatsapp mr-3 text-green-500"></i>
                  <a 
                    href="https://wa.me/96176919370" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-green-500"
                  >
                    WhatsApp
                  </a>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-3 text-red-500"></i>
                  <span>Lebanon</span>
                </li>
              </ul>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Follow Us</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/spotlylb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700"
                >
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61570963155100" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <i className="fab fa-facebook text-2xl"></i>
                </a>
                <a 
                  href="https://www.tiktok.com/@spotlylb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black hover:text-gray-700"
                >
                  <i className="fab fa-tiktok text-2xl"></i>
                </a>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h3 className="text-lg font-medium mb-2">Send us a message</h3>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your email"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your message"
                ></textarea>
              </div>
              
              <button
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                onClick={() => alert('Message functionality would be implemented here!')}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ContactSection />
    </div>
  );
}

export default ContactPage;