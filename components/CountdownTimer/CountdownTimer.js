// src/components/CountdownTimer/CountdownTimer.js
import React, { useState, useEffect } from 'react';

function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center mb-4">
      <h5>↓ CHRISTMAS SALE ENDS IN ↓</h5>
      <div className="d-flex justify-content-center gap-3">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center">
            <div className="bg-danger text-white p-2 rounded">
              <h3 className="mb-0">{String(value).padStart(2, '0')}</h3>
            </div>
            <small className="text-uppercase">{unit}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CountdownTimer;