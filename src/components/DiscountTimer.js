// src/components/DiscountTimer.js
import React, { useState, useEffect } from 'react';

function DiscountTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      if (!left) {
        clearInterval(timer);
        window.location.reload(); // Refresh to update product price
      }
      setTimeLeft(left);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <div className="discount-timer py-2">
      <div className="d-flex justify-content-center gap-2">
        <div className="timer-item bg-danger text-white p-2 rounded">
          <span className="fs-5">{timeLeft.days.toString().padStart(2, '0')}</span>
          <small className="d-block">Days</small>
        </div>
        <div className="timer-item bg-danger text-white p-2 rounded">
          <span className="fs-5">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <small className="d-block">Hours</small>
        </div>
        <div className="timer-item bg-danger text-white p-2 rounded">
          <span className="fs-5">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <small className="d-block">Minutes</small>
        </div>
        <div className="timer-item bg-danger text-white p-2 rounded">
          <span className="fs-5">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <small className="d-block">Seconds</small>
        </div>
      </div>
    </div>
  );
}

export default DiscountTimer;