"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProModal } from "@/hooks/use-pro-modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export const ProModal = () => {
  const proModal = useProModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe?planId=1_month");

      window.location.href = response.data.url;
    } catch (error) {
      toast({
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            To Send
            <span className="text-sky-500 mx-1 font-medium">Unlimited</span>
            Messages
            <div><span className="text-sky-500 mx-1 font-medium">Unlimited</span>
            Images</div>
            <div>And Create your own AI GF</div>
            <div>View more plans on tickets page</div>
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="flex justify-between">
          <p className="text-2xl font-medium">
            $12<span className="text-sm font-normal">.99 / mo</span>
          </p>
          <Button onClick={onSubscribe} disabled={loading} variant="premium">
            Subscribe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
