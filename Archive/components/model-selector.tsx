import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function ModelSelector() {

  return (

    <Select>
      <SelectTrigger className="w-[130px] mx-1 bg-gray-200 dark:bg-zinc-700">
        <SelectValue placeholder="GPT 4.0" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="premium">GPT 4.0</SelectItem>
        <SelectItem value="normal">Llama</SelectItem>
      </SelectContent>
    </Select>
  )
}