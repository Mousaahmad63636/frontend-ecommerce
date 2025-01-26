// src/components/BlackFridayBanner/BlackFridayBanner.js
import React from 'react';
import DiscountTimer from '../DiscountTimer/DiscountTimer';
import './BlackFridayBanner.css';

function BlackFridayBanner({ endDate, discount }) {
  const handleExpire = () => {
    // You can implement what happens when the timer expires
    console.log('Black Friday sale has ended');
  };

  return (
    <div className="black-friday-banner">
      <div className="banner-content">
        <h2>Black Friday Sale!</h2>
        <p className="discount-text">{discount}% OFF Everything</p>
        <DiscountTimer endDate={endDate} onExpire={handleExpire} />
        <p className="hurry-text">Hurry up! Limited time offer</p>
      </div>
    </div>
  );
}

export default BlackFridayBanner;