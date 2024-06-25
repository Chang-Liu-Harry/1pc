import { EIGHTEEN_CONFIRM } from "@/lib/constants";
import { useState, useEffect } from "react";

export const useEighteenConfirm = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const isEighteen = localStorage.getItem(EIGHTEEN_CONFIRM);
    if (isEighteen) {
      setIsConfirmed(true);
    }
  }, []);

  const onConfirm = () => {
    setIsConfirmed(true);
    localStorage.setItem(EIGHTEEN_CONFIRM, "true");
  };

  return { isConfirmed, onConfirm };
};
