"use client";
import React, { useState, useEffect } from 'react';
import { SubscriptionButton } from "@/components/subscription-button";
import CountdownBanner from '@/components/countdownbanner';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Plan {
  duration: string;
  discount: string;
  price: number;
  originalPrice: number;
  id: string;
}

const SettingsPage = () => {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [countdownEnd, setCountdownEnd] = useState<number>(Date.now() + 3600000);

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
      localStorage.setItem('isPro', JSON.stringify(data.isPro));

      const storedCountdownEnd = localStorage.getItem('countdownEnd');
      if (storedCountdownEnd) {
        const countdownEnd = parseInt(storedCountdownEnd);
        setCountdownEnd(countdownEnd);
      } else {
        const newCountdownEnd = Date.now() + 3600000; // 1 hour from now
        localStorage.setItem('countdownEnd', newCountdownEnd.toString());
        setCountdownEnd(newCountdownEnd);
      }

      if (data.isPro) {
        const detailsResponse = await fetch('/api/subscription/details');
        const detailsData = await detailsResponse.json();
        setSubscriptionDetails(detailsData);

        const portalResponse = await fetch('/api/subscription/portal', {
          method: 'POST',
        });
        const portalData = await portalResponse.json();
        setPortalUrl(portalData.url);
      }
    };

    const cachedIsPro = localStorage.getItem('isPro');
    if (cachedIsPro !== null) {
      setIsPro(JSON.parse(cachedIsPro));
    } else {
      fetchSubscriptionStatus();
    }
  }, []);

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleOpenPortal = () => {
    if (portalUrl) {
      window.open(portalUrl, '_blank');
    } else {
      alert('Failed to load the Stripe Customer Portal. Please try again later.');
    }
  };

  const handleCountdownFinish = () => {
    const newCountdownEnd = Date.now() + 3600000;
    localStorage.setItem('countdownEnd', newCountdownEnd.toString());
    setCountdownEnd(newCountdownEnd);
  };

  return (
    <div className="h-full p-6 space-y-6 text-black dark:text-white">
      {!isPro && <CountdownBanner countdownEnd={countdownEnd} onCountdownFinish={handleCountdownFinish} />}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-4xl font-semibold text-center mb-6 text-yellow-500">{isPro ? "Welcome, VIP!" : "Choose Your Destiny"}</h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{isPro ? "You're in the exclusive club now. Enjoy the perks!" : "Unlock amazing features and become legendary!"}</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-medium text-pink-600 dark:text-pink-500 mb-4">{isPro ? "Upgrade Your Plan" : "Today Only: Insane Discounts!"}</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Up to 75% off for your first subscription</p>
            <div className="space-y-4">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  className={`flex justify-between items-center border border-gray-300 dark:border-gray-700 p-4 rounded-lg cursor-pointer ${selectedPlan?.id === plan.id ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
                  onClick={() => handlePlanClick(plan)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div>
                    <p className="font-semibold text-black dark:text-white">{plan.duration}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.discount}</p>
                  </div>
                  <p className="font-bold text-lg text-black dark:text-white">${plan.price}/month</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <SubscriptionButton
                isPro={isPro}
                planId={selectedPlan?.id || "1_month"}
                buttonText={isPro ? "Upgrade Plan" : "Pay with Discount"}
              />
              {isPro && (
                <button onClick={handleOpenPortal} className="bg-blue-700 text-white py-3 px-6 rounded shadow-lg transition transform hover:scale-105 font-semibold">
                  Manage Subscription
                </button>
              )}
            </div>
          </div>
          {isPro && (
            <div className="mt-8">
              <h4 className="text-xl font-medium mb-2">Subscription Details</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Current Period End: {new Date(subscriptionDetails?.subscription?.current_period_end * 1000).toLocaleDateString()}</li>
                <li>Status: {subscriptionDetails?.subscription?.status}</li>
              </ul>
            </div>
          )}
          <div className="mt-8">
            <h4 className="text-xl font-medium mb-2">Awesome Benefits</h4>
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
        </motion.div>
      </div>
    </div>
  );
}

export default SettingsPage;
