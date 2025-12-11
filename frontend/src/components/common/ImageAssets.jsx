import React from 'react';

// Import your images - make sure these exist in src/images/
import cashImage from '../../images/cash.png';
import cardImage from '../../images/card.png';
import esewaImage from '../../images/esewa.png';
import khaltiImage from '../../images/khalti.png';

export const PaymentIcons = {
  Cash: cashImage,
  Card: cardImage,
  Esewa: esewaImage,
  Khalti: khaltiImage,
  Other: cashImage, // fallback to cash
};

export const getPaymentIcon = (method) => {
  return PaymentIcons[method] || PaymentIcons.Cash;
};

export const PaymentIcon = ({ method, className = "w-8 h-8" }) => {
  const iconSrc = getPaymentIcon(method);
  
  return (
    <img 
      src={iconSrc} 
      alt={`${method} payment`}
      className={`${className} object-contain`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';
        e.target.parentElement.innerHTML = `<div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">${method.charAt(0)}</div>`;
      }}
    />
  );
};