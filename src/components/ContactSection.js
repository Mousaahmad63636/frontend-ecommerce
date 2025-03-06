// src/components/ContactSection.js
import React from 'react';

function ContactSection() {
  // Use the same purple color as in other components, but softer
  const primaryColor = '#8c52ff';
  const softerPrimaryColor = 'rgba(140, 82, 255, 0.8)';
  
  return (
    <section className="contact-features py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Changed grid layout: 2 columns on mobile, 4 columns on medium screens and up */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* 24/7 Support */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-5 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'rgba(140, 82, 255, 0.08)' }}
            >
              <svg width="40" height="40" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M120 0C53.8 0 0 53.8 0 120s53.8 120 120 120 120-53.8 120-120S186.2 0 120 0zm0 210c-49.7 0-90-40.3-90-90s40.3-90 90-90 90 40.3 90 90-40.3 90-90 90z" fill={softerPrimaryColor} fillOpacity="0.8"/>
                <path d="M120 60c-33.1 0-60 26.9-60 60v30c0 16.5 13.5 30 30 30h60c16.5 0 30-13.5 30-30v-30c0-33.1-26.9-60-60-60zm-30 90V120c0-16.5 13.5-30 30-30s30 13.5 30 30v30H90zm45-15c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" fill={softerPrimaryColor}/>
              </svg>
            </div>
            <h3 className="text-xl md:text-3xl font-semibold" style={{ color: '#3a3a3a' }}>24/7 Support</h3>
          </div>

          {/* 2000+ Happy Customers */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-5 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'rgba(140, 82, 255, 0.08)' }}
            >
              <svg width="40" height="40" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M120 0C53.8 0 0 53.8 0 120s53.8 120 120 120 120-53.8 120-120S186.2 0 120 0zm0 210c-49.7 0-90-40.3-90-90s40.3-90 90-90 90 40.3 90 90-40.3 90-90 90z" fill={softerPrimaryColor} fillOpacity="0.8"/>
                <path d="M80 100c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15zm80 0c8.3 0 15-6.7 15-15s-6.7-15-15-15-15 6.7-15 15 6.7 15 15 15zM120 180c33.1 0 60-26.9 60-60h-30c0 16.5-13.5 30-30 30s-30-13.5-30-30H60c0 33.1 26.9 60 60 60z" fill={softerPrimaryColor}/>
              </svg>
            </div>
            {/* Adjusted to fit better on smaller screens */}
            <h3 className="text-xl md:text-3xl font-semibold" style={{ color: '#3a3a3a' }}>2000+ Happy</h3>
            <h3 className="text-xl md:text-3xl font-semibold" style={{ color: '#3a3a3a' }}>Customers</h3>
          </div>

          {/* Premium Quality */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-5 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'rgba(140, 82, 255, 0.08)' }}
            >
              <svg width="40" height="40" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="120" r="120" fill={softerPrimaryColor} fillOpacity="0.8"/>
                <path d="M180 100L120 160L60 100L80 80L120 120L160 80L180 100Z" fill="white"/>
                <circle cx="120" cy="120" r="60" stroke="white" strokeWidth="10" fill="transparent"/>
              </svg>
            </div>
            <h3 className="text-xl md:text-3xl font-semibold" style={{ color: '#3a3a3a' }}>Premium Quality</h3>
          </div>

          {/* Cash On Delivery */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-5 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'rgba(140, 82, 255, 0.08)' }}
            >
              <svg width="40" height="40" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="120" r="120" fill={softerPrimaryColor} fillOpacity="0.8"/>
                <rect x="60" y="80" width="120" height="80" rx="10" stroke="white" strokeWidth="10" fill="transparent"/>
                <path d="M120 80V160" stroke="white" strokeWidth="6"/>
                <path d="M90 100H150" stroke="white" strokeWidth="6"/>
                <path d="M90 120H150" stroke="white" strokeWidth="6"/>
                <path d="M90 140H150" stroke="white" strokeWidth="6"/>
                <circle cx="120" cy="120" r="20" fill="white"/>
                <path d="M115 120H125M120 115V125" stroke={softerPrimaryColor} strokeWidth="4"/>
              </svg>
            </div>
            <h3 className="text-xl md:text-3xl font-semibold" style={{ color: '#3a3a3a' }}>Cash On Delivery</h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;