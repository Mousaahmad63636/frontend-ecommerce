import React, { useState, useEffect } from 'react';

function Footer() {
  const [showScroll, setShowScroll] = useState(false);
  
  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };
  
  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);
  
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h5 className="text-xl font-semibold mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/spotlylb?igsh=Zng3NWhlc3c5ejRh&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="text-white hover:text-pink-500 transition-colors"
              >
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61570963155100&mibextid=LQQJ4d" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="text-white hover:text-blue-500 transition-colors"
              >
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a 
                href="https://www.tiktok.com/@spotlylb?_t=ZS-8uMGOEL8oOi&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on TikTok"
                className="text-white hover:text-gray-400 transition-colors"
              >
                <i className="fab fa-tiktok text-2xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h5 className="text-xl font-semibold mb-4">Contact Us</h5>
            <div className="space-y-2">
              <p className="flex items-center">
                <i className="fas fa-phone mr-2"></i>
                +961 76 91 93 70
              </p>
              <p className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>
                Lebanon
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} Spotlylb. All rights reserved.
          </p>
          <p className="text-center text-gray-500 text-sm mt-2">
            Website created by <a 
              href="https://www.instagram.com/tss_lb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              TSS_LB
            </a>
          </p>
        </div>
      </div>
      
      {showScroll && (
        <button 
          onClick={scrollTop}
          className="fixed bottom-8 right-8 bg-primary-600 text-white w-10 h-10 rounded-full
            flex items-center justify-center shadow-lg hover:bg-primary-700
            transition-colors duration-200"
          role="button"
          aria-label="Scroll to top"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </footer>
  );
}

export default Footer;