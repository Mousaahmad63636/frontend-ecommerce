// src/components/ContactSection.js
import React from 'react';

function ContactSection() {
  // Use the same purple color as in other components
  const primaryColor = '#8c52ff';
  
  return (
    <section className="contact-features py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 24/7 Support */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-24 h-24 mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(140, 82, 255, 0.1)' }}
            >
              <svg width="60" height="60" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M120 0C53.8 0 0 53.8 0 120s53.8 120 120 120 120-53.8 120-120S186.2 0 120 0zm0 210c-49.7 0-90-40.3-90-90s40.3-90 90-90 90 40.3 90 90-40.3 90-90 90z" fill={primaryColor} fillOpacity="0.8"/>
                <path d="M120 60c-33.1 0-60 26.9-60 60v30c0 16.5 13.5 30 30 30h60c16.5 0 30-13.5 30-30v-30c0-33.1-26.9-60-60-60zm-30 90V120c0-16.5 13.5-30 30-30s30 13.5 30 30v30H90zm45-15c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" fill={primaryColor}/>
              </svg>
            </div>
            <h3 className="text-4xl font-bold mb-3" style={{ color: '#333' }}>24/7 Support</h3>
            <p className="text-gray-600">Always here to help with your questions</p>
          </div>

          {/* 2000+ Happy Customers */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-24 h-24 mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(140, 82, 255, 0.1)' }}
            >
              <svg width="60" height="60" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M120 0C53.8 0 0 53.8 0 120s53.8 120 120 120 120-53.8 120-120S186.2 0 120 0zm0 210c-49.7 0-90-40.3-90-90s40.3-90 90-90 90 40.3 90 90-40.3 90-90 90z" fill={primaryColor} fillOpacity="0.8"/>
                <path d="M80 100c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15zm80 0c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15zM120 180c33.1 0 60-26.9 60-60h-30c0 16.5-13.5 30-30 30s-30-13.5-30-30H60c0 33.1 26.9 60 60 60z" fill={primaryColor}/>
              </svg>
            </div>
            <h3 className="text-4xl font-bold mb-3" style={{ color: '#333' }}>2000+ Happy</h3>
            <h3 className="text-4xl font-bold mb-3" style={{ color: '#333' }}>Customers</h3>
            <p className="text-gray-600">Join our satisfied customer community</p>
          </div>

          {/* Fast Delivery */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-24 h-24 mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(140, 82, 255, 0.1)' }}
            >
              <svg width="60" height="60" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M210 120h-30v-30h30c-16.5 0-30-13.5-30-30V30h-30v30h-90V30H30v30c0 16.5-13.5 30-30 30h30v30H0v30h30c0 16.5 13.5 30 30 30h120c16.5 0 30-13.5 30-30h30v-30z" fill={primaryColor} fillOpacity="0.2"/>
                <path d="M210 90h-30v30h30v30h-30c0 16.5-13.5 30-30 30h-30v-90h-30v90H60c-16.5 0-30-13.5-30-30H0v-30h30V90H0V60h30c0-16.5 13.5-30 30-30h30v30h30V30h30c16.5 0 30 13.5 30 30h30v30z" fill={primaryColor} fillOpacity="0.3"/>
                <path d="M180 60v30h30V60h-30zm-75 60h30V90h-30v30zm-75-30v30h30V90H30z" fill={primaryColor}/>
                <circle cx="60" cy="180" r="15" fill={primaryColor}/>
                <circle cx="180" cy="180" r="15" fill={primaryColor}/>
                <path d="M60 60h120v60H60V60z" fill={primaryColor}/>
                <path d="M180 120v60h-60v-60h60z" fill={primaryColor} fillOpacity="0.7"/>
              </svg>
            </div>
            <h3 className="text-4xl font-bold mb-3" style={{ color: '#333' }}>Fast Delivery</h3>
            <p className="text-gray-600">Quick and reliable shipping to your door</p>
          </div>
        </div>

        {/* WhatsApp Button Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#333' }}>Have Questions? Contact Us</h2>
          <p className="text-gray-600 mb-6">Our customer service team is ready to assist you</p>
          <a 
            href="https://wa.me/96176919370?text=Hello!%20I'm%20interested%20in%20your%20products."
            target="_blank" 
            rel="noopener noreferrer"
            style={{ backgroundColor: primaryColor }}
            className="inline-flex items-center px-6 py-3 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            <i className="fab fa-whatsapp text-xl mr-2"></i>
            Chat with Us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;