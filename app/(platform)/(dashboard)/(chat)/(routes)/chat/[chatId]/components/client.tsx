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
import { MediaList } from "@/components/media-list";

interface ChatClientProps {
  mind: Mind & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
  isPro: boolean;
}

const mapMessagesToChatProps = (messages: Message[]): ChatMessageProps[] => {
  return messages.map((message) => ({
    role: message.role as "user" | "system" | "assistant", // Explicitly cast to expected type
    type: message.type,
    content: message.content,
  }));
};

export const ChatClient = ({ mind, isPro }: ChatClientProps) => {
  const router = useRouter();
  const proModal = useProModal();

  const [messages, setMessages] = useState<ChatMessageProps[]>(
    mapMessagesToChatProps(mind.messages)
  );
  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${mind.id}`,
      onFinish(_prompt, completion) {
        const systemMessage: ChatMessageProps = {
          role: "system",
          type: "text",
          content: completion,
        };

        setMessages((current) => [...current, systemMessage]);
        setInput("");

        router.refresh();
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPro && messages.length >= 4) {
      proModal.onOpen();
      return;
    }

    const userMessage: ChatMessageProps = {
      role: "user",
      type: "text",
      content: input,
    };

    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  };

  return (
    <div className="flex h-full">
      <MediaList />

      <div className="w-8/12 flex flex-col h-full p-4 space-y-2">
        <ChatHeader mind={mind} isPro={isPro} />
        <ChatMessages mind={mind} isLoading={isLoading} messages={messages} />
        <ChatForm
          isLoading={isLoading}
          input={input}
          handleInputChange={handleInputChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
