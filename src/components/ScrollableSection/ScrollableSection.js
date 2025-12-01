// components/ScrollableSection/ScrollableSection.js
import React, { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ScrollableSection = ({ title, children }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = window.innerWidth >= 768 ? 600 : 300;
      const newScrollPosition = container.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative px-4 md:px-6 py-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      
      <div className="relative group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
            bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg
            opacity-0 group-hover:opacity-100 transition-opacity
            hover:bg-white disabled:opacity-0"
          disabled={scrollContainerRef.current?.scrollLeft === 0}
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
            bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg
            opacity-0 group-hover:opacity-100 transition-opacity
            hover:bg-white"
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default ScrollableSection;