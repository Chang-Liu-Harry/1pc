import axios from "axios";
import { useState } from "react";
import { Sparkles } from "lucide-react"; // Ensure Sparkles is imported
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const SubscriptionButton = ({
  isPro = false,
  planId,
  buttonText,
}: {
  isPro: boolean;
  planId: string;
  buttonText: string;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`/api/stripe?planId=${planId}`);

      window.location.href = response.data.url;
    } catch (error) {
      toast({
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isPro ? "default" : "premium"}
      disabled={loading}
      onClick={onClick}
    >
      {buttonText}
      {!isPro && <Sparkles className="w-4 h-4 ml-2 fill-white" />}
    </Button>
  );
};
