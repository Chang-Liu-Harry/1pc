"use client"; // Add this line

import React, { useState } from 'react';

const NoticeBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-500 text-white p-4 text-center relative flex items-center justify-between m-0">
      <p className="m-0">
        Tips: Using <strong>**your wish here**</strong> in your messages will be interpreted by the AI as events that have already happened. You know what I mean? 😉
      </p>
      <button 
        className="absolute right-4 text-white bg-transparent border-none text-2xl font-bold"
        onClick={() => setIsVisible(false)}
      >
        &times;
      </button>
    </div>
  );
}

export default NoticeBar;
