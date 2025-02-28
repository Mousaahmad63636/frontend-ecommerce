import React, { useState, useEffect } from 'react';

const DailyTimer = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    // Get tomorrow's date and set it to midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Calculate time difference
    const difference = tomorrow - new Date();
    
    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6">
          {/* Title and subtitle */}
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white/20 rounded-full p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg md:text-xl">Deal of the Day</h3>
              <p className="text-white/80 text-sm">New offers every 24 hours</p>
            </div>
          </div>
          
          {/* Timer */}
          <div className="flex items-center bg-white/10 rounded-lg px-4 py-3">
            <div className="flex flex-col items-center mx-2">
              <span className="text-white font-bold text-xl md:text-2xl">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-white/70 text-xs uppercase tracking-wider">hrs</span>
            </div>
            <span className="text-white text-xl md:text-2xl mx-1">:</span>
            <div className="flex flex-col items-center mx-2">
              <span className="text-white font-bold text-xl md:text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-white/70 text-xs uppercase tracking-wider">min</span>
            </div>
            <span className="text-white text-xl md:text-2xl mx-1">:</span>
            <div className="flex flex-col items-center mx-2">
              <span className="text-white font-bold text-xl md:text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-white/70 text-xs uppercase tracking-wider">sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTimer;