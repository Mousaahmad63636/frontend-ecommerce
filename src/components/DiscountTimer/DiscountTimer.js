// src/components/DiscountTimer/DiscountTimer.js
import React, { useState, useEffect } from 'react';
import './DiscountTimer.css';

function DiscountTimer({ endDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (!newTimeLeft) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, endDate, onExpire]);

  if (!timeLeft) return null;

  return (
    <div className="discount-timer">
      <div className="timer-block">
        <span className="time">{timeLeft.days}</span>
        <span className="label">Days</span>
      </div>
      <div className="timer-divider">:</div>
      <div className="timer-block">
        <span className="time">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="label">Hours</span>
      </div>
      <div className="timer-divider">:</div>
      <div className="timer-block">
        <span className="time">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="label">Minutes</span>
      </div>
      <div className="timer-divider">:</div>
      <div className="timer-block">
        <span className="time">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="label">Seconds</span>
      </div>
    </div>
  );
}

export default DiscountTimer;