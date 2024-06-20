"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

const AgeVerification = () => {
  const router = useRouter();

  const handleEnter = () => {
    localStorage.setItem("ageVerified", "true");
    router.push("/");
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  useEffect(() => {
    const ageVerified = localStorage.getItem("ageVerified");
    if (ageVerified === "true") {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">This is an adult website</h1>
        <p className="mb-6">
          This website contains age-restricted materials including nudity and
          explicit depictions of sexual activity. By entering, you affirm that
          you are at least 18 years of age or the age of majority in the
          jurisdiction you are accessing the website from and you consent to
          viewing sexually explicit content.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleEnter}
            className="bg-orange-500 text-black font-bold py-2 px-4 rounded"
          >
            I am 18 or older - Enter
          </button>
          <button
            onClick={handleExit}
            className="bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            I am under 18 - Exit
          </button>
        </div>
        <p className="mt-6">
          Our <a href="#" className="text-orange-500 underline">parental controls page</a> explains how you can easily block access to this site.
        </p>
      </div>
    </div>
  );
};

export default AgeVerification;
