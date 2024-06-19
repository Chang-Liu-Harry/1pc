"use client";

import { useState, useEffect } from 'react';

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const CountdownBanner = () => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date("2024-07-01") - +new Date();
    let timeLeft: TimeLeft = {};
    
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof TimeLeft]) {
      return;
    }
    timerComponents.push(
      <span key={interval} className="font-bold text-pink-600 dark:text-pink-500">
        {timeLeft[interval as keyof TimeLeft]} {interval}{" "}
      </span>
    );
  });

  return (
    <div className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-center p-2">
      <span>Up to 75% Off Ends in: {timerComponents.length ? timerComponents : <span>Time's up!</span>}</span>
    </div>
  );
};

export default CountdownBanner;
