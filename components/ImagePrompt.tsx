import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Image as ImageIcon } from "lucide-react";
import { Tooltip, IconButton } from "@radix-ui/themes";

interface ImagePromptProps {
  disabled: boolean;
  onSelect: (val: string) => void;
}

export const ImagePrompt = ({ disabled, onSelect }: ImagePromptProps) => {
  return (
    <Select disabled={disabled} onValueChange={onSelect}>
      <SelectTrigger className="w-[40px] whitespace-nowrap bg-transparent !ring-offset-0 focus:ring-0 !p-0 border-0 mr-[14px]">
        <Tooltip content="Select a prompt">
          <IconButton asChild variant="ghost" color="gray">
            <ImageIcon />
          </IconButton>
        </Tooltip>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="send your face image">send your face image</SelectItem>
      </SelectContent>
    </Select>
  );
};
