import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const TimerDisplay = () => {
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchTimer();
  }, []);

  const fetchTimer = async () => {
    try {
      const response = await api.getTimer();
      if (response) {
        setTimer(response);
      }
    } catch (error) {
      console.error('Error fetching timer:', error);
    }
  };

  useEffect(() => {
    if (!timer) return;

    const calculateTimeLeft = () => {
      const difference = new Date(timer.endDate) - new Date();
      if (difference <= 0) {
        setTimer(null);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      if (!timeLeft) {
        clearInterval(interval);
      }
      setTimeLeft(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (!timer || !timeLeft) return null;

  return (
    <div className="d-inline-flex align-items-center ms-3 bg-danger text-white rounded-pill px-3 py-2">
      <span className="me-2">{timer.title}</span>
      <div className="d-flex gap-2">
        <div className="text-center">
          <span className="fw-bold">{String(timeLeft.days).padStart(2, '0')}</span>
          <small className="d-block">days</small>
        </div>
        <div className="text-center">
          <span className="fw-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <small className="d-block">hrs</small>
        </div>
        <div className="text-center">
          <span className="fw-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <small className="d-block">min</small>
        </div>
        <div className="text-center">
          <span className="fw-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <small className="d-block">sec</small>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;