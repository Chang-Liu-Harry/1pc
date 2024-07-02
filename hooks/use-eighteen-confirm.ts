import { EIGHTEEN_CONFIRM } from "@/lib/constants";
import { useState, useEffect, useCallback } from "react";

export const useEighteenConfirm = () => {
  const [isConfirmed, setIsConfirmed] = useState(true);

  useEffect(() => {
    const isEighteen = localStorage.getItem(EIGHTEEN_CONFIRM);
    if (isEighteen !== 'true') {
      setIsConfirmed(false);
    }
  }, []);

  const onConfirm = useCallback(() => {
    setIsConfirmed(true);
    localStorage.setItem(EIGHTEEN_CONFIRM, "true");
  }, []);

  return { isConfirmed, onConfirm };
};
