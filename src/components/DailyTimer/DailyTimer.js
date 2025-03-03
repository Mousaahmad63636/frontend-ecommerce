import React, { useState, useEffect } from 'react';

const DailyTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 17,
    minutes: 37,
    seconds: 46
  });

  useEffect(() => {
    // Set the countdown to match the exact time from the image initially
    // In a real app, you might calculate this from an end date
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds -= 1;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes -= 1;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours -= 1;
            } else {
              hours = 23;
              if (days > 0) {
                days -= 1;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full my-6 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-center text-lg md:text-xl font-semibold mb-4">Limited Time Offer</h2>
        
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
            {/* Days */}
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-5xl font-bold" style={{ color: '#8c52ff' }}>
                {String(timeLeft.days).padStart(1, '0')}
              </span>
              <span className="text-xs md:text-sm text-gray-600 mt-1">Days</span>
            </div>
            
            {/* Separator */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl md:text-5xl font-bold" style={{ color: '#ff6b6b' }}>:</span>
              <span className="text-xs md:text-sm text-transparent mt-1">.</span>
            </div>
            
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-5xl font-bold" style={{ color: '#8c52ff' }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-xs md:text-sm text-gray-600 mt-1">Hours</span>
            </div>
            
            {/* Separator */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl md:text-5xl font-bold" style={{ color: '#ff6b6b' }}>:</span>
              <span className="text-xs md:text-sm text-transparent mt-1">.</span>
            </div>
            
            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-5xl font-bold" style={{ color: '#8c52ff' }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-xs md:text-sm text-gray-600 mt-1">Minutes</span>
            </div>
            
            {/* Separator */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl md:text-5xl font-bold" style={{ color: '#ff6b6b' }}>:</span>
              <span className="text-xs md:text-sm text-transparent mt-1">.</span>
            </div>
            
            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-5xl font-bold" style={{ color: '#8c52ff' }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs md:text-sm text-gray-600 mt-1">Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTimer;