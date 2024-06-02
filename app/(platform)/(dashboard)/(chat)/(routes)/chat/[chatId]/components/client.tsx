"use client";

import { useCompletion } from "ai/react";
import { FormEvent, useState } from "react";
import { Mind, Message } from "@prisma/client";
import { useRouter } from "next/navigation";

import { ChatForm } from "@/components/chat-form";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";
import { useProModal } from "@/hooks/use-pro-modal";
interface ChatClientProps {
  mind: Mind & {
    messages: Message[];
    _count: {
      messages: number;
    }
  };
  isPro: boolean;
};

export const ChatClient = ({
  mind,
  isPro
}: ChatClientProps) => {
  const router = useRouter();
  const proModal = useProModal()

  const [messages, setMessages] = useState<ChatMessageProps[]>(mind.messages);
  const {
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    setInput,
  } = useCompletion({
    api: `/api/chat/${mind.id}`,
    onFinish(_prompt, completion) {
      // TODO: ensure a better check flow
      const systemMessage: ChatMessageProps = {
        role: "system",
        type: "text",
        content: completion
      };

      setMessages((current) => [...current, systemMessage]);
      setInput("");

      router.refresh();
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!isPro && messages.length >= 4) {
      proModal.onOpen()
    }
    const userMessage: ChatMessageProps = {
      role: "user",
      // User message type should always be text
      type: "text",
      content: input
    };

    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader
        mind={mind}
        isPro={isPro}
      />
      <ChatMessages
        mind={mind}
        isLoading={isLoading}
        messages={messages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}