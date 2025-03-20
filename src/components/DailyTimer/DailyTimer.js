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
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
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
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Added "Offer Ends In" heading */}
      <h3 className="text-center font-medium text-lg mb-3 text-gray-700">Offers Ends In</h3>
      
      <div className="flex justify-center items-end">
        {/* Days */}
        <div className="flex flex-col items-center mx-3">
          <div className="text-black font-bold text-4xl md:text-5xl mb-2">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <span className="text-gray-700 text-sm font-medium">Days</span>
        </div>

        {/* Separator */}
        <div className="text-red-500 text-4xl md:text-5xl mb-2 mx-1">:</div>

        {/* Hours */}
        <div className="flex flex-col items-center mx-3">
          <div className="text-black font-bold text-4xl md:text-5xl mb-2">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <span className="text-gray-700 text-sm font-medium">Hours</span>
        </div>

        {/* Separator */}
        <div className="text-red-500 text-4xl md:text-5xl mb-2 mx-1">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center mx-3">
          <div className="text-black font-bold text-4xl md:text-5xl mb-2">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <span className="text-gray-700 text-sm font-medium">Minutes</span>
        </div>

        {/* Separator */}
        <div className="text-red-500 text-4xl md:text-5xl mb-2 mx-1">:</div>

        {/* Seconds */}
        <div className="flex flex-col items-center mx-3">
          <div className="text-black font-bold text-4xl md:text-5xl mb-2">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <span className="text-gray-700 text-sm font-medium">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default DailyTimer;