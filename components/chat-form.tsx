"use client";

import { ChatRequestOptions } from "ai";
import { SendHorizonal } from "lucide-react";
import { ChangeEvent, FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { IconButton } from "@radix-ui/themes"
import { ImagePrompt } from "./ImagePrompt";

interface ChatFormProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void;
  isLoading: boolean;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatForm = ({
  input,
  handleInputChange,
  onSubmit,
  isLoading,
  setInput
}: ChatFormProps) => {
  return (
    <form onSubmit={onSubmit} className="border-t border-primary/10 py-4 flex items-center gap-x-2">
      <Input
        disabled={isLoading}
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message, use 'send' keyword can get image reply"
        className="rounded-lg bg-primary/10"
        style={{boxShadow: 'none'}}
      />
      <IconButton disabled={isLoading} variant="ghost"  color="gray" style={{marginLeft: '6px', marginRight: '6px'}}>
        <SendHorizonal className="w-6 h-6" />
      </IconButton>
      <ImagePrompt disabled={isLoading} onSelect={setInput}/>
    </form>
  )
}