"use client"
import React, { useState, useEffect } from 'react';
import { SubscriptionButton } from "@/components/subscription-button";
import CountdownBanner from '@/components/countdownbanner';

interface Plan {
  duration: string;
  discount: string;
  price: number;
  originalPrice: number;
  id: string; // Add id property
}

const SettingsPage = () => {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const plans: Plan[] = [
    { id: "12_month", duration: '12 months', discount: '75% off', price: 5.99, originalPrice: 25.99 },
    { id: "3_month", duration: '3 months', discount: '60% off', price: 9.99, originalPrice: 25.99 },
    { id: "1_month", duration: '1 month', discount: '50% off', price: 12.99, originalPrice: 25.99 },
  ];

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      setIsPro(data.isPro);
    };
    fetchSubscriptionStatus();
  }, []);

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  return (
    <div className="h-full p-4 space-y-4 text-black dark:text-white">
      <CountdownBanner />
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-medium text-center mb-6">Choose your Plan</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">100% anonymous. You can cancel anytime.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h4 className="text-lg font-medium text-pink-600 dark:text-pink-500 mb-4">Get Exclusive Discount Only Today!</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Up to 75% off for first subscription</p>
          
          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`flex justify-between items-center border border-gray-300 dark:border-gray-700 p-4 rounded-lg cursor-pointer ${selectedPlan?.id === plan.id ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
                onClick={() => handlePlanClick(plan)}
              >
                <div>
                  <p className="font-semibold text-black dark:text-white">{plan.duration}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{plan.discount}</p>
                </div>
                <p className="font-bold text-lg text-black dark:text-white">${plan.price}/month</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center space-x-4">
            {selectedPlan && (
              <SubscriptionButton
                isPro={isPro}
                planId={selectedPlan.id}
                buttonText={`Pay with Credit / Debit Card`}
              />
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-2">Premium Benefits</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Create your own AI Girlfriend(s)</li>
            <li>Unlimited text messages</li>
            <li>Get 100 FREE tokens / month</li>
            <li>Remove image blur</li>
            <li>Generate images</li>
            <li>Make AI phone calls</li>
            <li>Listen to voice messages</li>
            <li>Fast response time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
