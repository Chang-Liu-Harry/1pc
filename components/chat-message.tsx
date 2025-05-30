"use client";

import { BeatLoader } from "react-spinners";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import Image from 'next/image';

import { cn } from "@/lib/utils";
import { BotAvatar } from "@/components/bot-avatar"
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export interface ChatMessageProps {
  role: "system" | "user" | "assistant";
  type?: string;
  content?: string;
  isLoading?: boolean;
  src?: string;
}

export const ChatMessage = ({
  role,
  type,
  content,
  isLoading,
  src
}: ChatMessageProps) => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const onCopy = () => {
    if (!content) {
      return;
    }

    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard.",
      duration: 3000,
    })
  }

  const isImageUrl = (url: any) => {
    if (url) {
      return /^https:\/\/.*\.png$/.test(url);
    }
  }
  return (
    <div className={cn(
      "group flex items-start gap-x-3 py-4 w-full",
      role === "user" && "justify-end"
    )}>
      {role !== "user" && src && <BotAvatar src={src} />}
      <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
        {/* TODO: Show images here */}
        {isLoading
          ? <BeatLoader color={theme === "light" ? "black" : "white"} size={5} />
          : (
            isImageUrl(content) ? <img src={content} alt="gen-img" className="max-w-full h-auto" /> : content
          )
        }
      </div>
      {role === "user" && <UserAvatar />}
      {role !== "user" && !isLoading && (
        <Button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 transition"
          size="icon"
          variant="ghost"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
