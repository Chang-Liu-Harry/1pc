"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import { Mind } from "@prisma/client";

import { ChatMessage, ChatMessageProps } from "@/components/chat-message";

interface ChatMessagesProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
  mind: Mind,
}

export const ChatMessages = ({
  messages = [],
  isLoading,
  mind,
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);

  const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        isLoading={fakeLoading}
        src={mind.src}
        role="system"
        type="text"
        content={`Hello, I am ${mind.name}, ${mind.description}`}
      />
      {messages.map((message, i) => (
        <ChatMessage
          key={`${message.content}${i}`}
          src={mind.src}
          content={message.content}
          role={message.role}
          type={message.type}
        />
      ))}
      {isLoading && (
        <ChatMessage
          src={mind.src}
          role="system"
          isLoading
        />
      )}
      <div ref={scrollRef} />
    </div>
  );
};
