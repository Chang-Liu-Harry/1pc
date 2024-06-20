"use client";

import { useState, useEffect } from 'react';

interface TimeLeft {
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

interface CountdownBannerProps {
  countdownEnd: number;
  onCountdownFinish: () => void;
}

const CountdownBanner = ({ countdownEnd, onCountdownFinish }: CountdownBannerProps) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = countdownEnd - Date.now();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        milliseconds: Math.floor((difference % 1000) / 10) // Convert to 1/100th of a second
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(() => {
        const newDifference = countdownEnd - Date.now();

        if (newDifference <= 0) {
          clearInterval(timer);
          onCountdownFinish();
          return calculateTimeLeft(); // Reset to 1 hour
        }

        return {
          minutes: Math.floor((newDifference / 1000 / 60) % 60),
          seconds: Math.floor((newDifference / 1000) % 60),
          milliseconds: Math.floor((newDifference % 1000) / 10)
        };
      });
    }, 10); // Update every 10 milliseconds

    return () => clearInterval(timer);
  }, [countdownEnd, onCountdownFinish]);

  if (!mounted) {
    return null; // Don't render anything on the server
  }

  return (
    <div className="flex justify-center py-4">
      <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-lg shadow-lg w-3/4 max-w-4xl">
        <div className="flex items-center space-x-2">
          <span className="bg-pink-600 p-1 rounded-full">🎉</span>
          <span className="uppercase text-sm font-bold">First Subscription</span>
        </div>
        <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          Up to 75% Off
        </span>
        <div className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold">
          <div className="flex flex-col items-center mx-1">
            <span className="text-xl w-8 text-center">{timeLeft.minutes?.toString().padStart(2, '0')}</span>
            <span className="text-xs">Min</span>
          </div>
          <span className="text-xl">:</span>
          <div className="flex flex-col items-center mx-1">
            <span className="text-xl w-8 text-center">{timeLeft.seconds?.toString().padStart(2, '0')}</span>
            <span className="text-xs">Sec</span>
          </div>
          <span className="text-xl">:</span>
          <div className="flex flex-col items-center mx-1">
            <span className="text-xl w-8 text-center">{timeLeft.milliseconds?.toString().padStart(2, '0')}</span>
            <span className="text-xs">Ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownBanner;
