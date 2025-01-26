// src/components/ContactSection.js
import React from 'react';

function ContactSection() {
  const phoneNumber = '96173873187';
  const message = encodeURIComponent('Hello! I have a question about your products.');

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <section className="contact-section py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <h2 className="mb-4">Contact Us</h2>
            <p className="mb-4">Have questions? We're here to help!</p>
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Get in Touch</h5>
                <p className="card-text">
                  Contact us through WhatsApp for quick responses and better assistance.
                </p>
                <button 
                  className="btn btn-success btn-lg"
                  onClick={handleWhatsAppClick}
                >
                  <i className="fab fa-whatsapp me-2"></i>
                  Chat with Us on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;