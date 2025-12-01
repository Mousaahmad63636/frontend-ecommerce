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
          <div className="p-5 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-medium mb-3 text-purple-800">Customer Support</h3>
            <p className="mb-3 text-gray-700">
              For live customer support, simply click the WhatsApp button at the bottom of the page.
            </p>
            <p className="mb-3 text-gray-700">
              Our Customer Service Team is committed to prioritizing your needs.
            </p>
            <p className="text-gray-700">
              If you have any questions or feedback, feel free to contact SPOTLY support, and we'll ensure you're completely satisfied.
            </p>
            <div className="mt-6 flex justify-center">
              <a 
                href="https://wa.me/96176919370" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-green-500 text-white py-3 px-8 rounded-full hover:bg-green-600 transition-colors shadow-md"
              >
                <i className="fab fa-whatsapp mr-2 text-xl"></i>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <ContactSection />
    </div>
  );
}

export default ContactPage;