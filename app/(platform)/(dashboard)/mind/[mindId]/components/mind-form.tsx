"use client";

import { nanoid } from 'nanoid';
import { decode } from 'base64-arraybuffer';
import { createClient } from '@supabase/supabase-js';
import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { Eye } from "lucide-react";
import { Category, Mind } from "@prisma/client";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { useState } from "react";

const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.
`;

const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`;

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  instructions: z.string().min(50, { message: "Instructions require at least 50 characters." }),
  seed: z.string().min(0, { message: "Conversation Example needed" }),
  src: z.string().min(1, { message: "Image is required." }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  //optional parts
  styleTag: z.string().optional(),
  characterTag: z.string().optional(),
  customPrompt: z.string().optional(),
  medias: z.array(z.string()).optional(),
});

interface MindFormProps {
  categories: Category[];
  initialData: Mind | null;
}

const LoadingSpinner = () => (
  <div className="animate-spin inline-block w-8 h-8 border-4 border-t-4 border-gray-200 rounded-full border-t-blue-500" role="status">
    <span className="sr-only">Loading...</span>
  </div>
);

export const MindForm = ({ categories, initialData }: MindFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      instructions: "",
      seed: "",
      src: "",
      categoryId: undefined,
      //expandable optional parts
      styleTag: "",
      characterTag: "",
      customPrompt: "", 
      medias: [],
    },
  });
  const generateImage = async (prompt: string, styleTag: string, characterTag: string, customPrompt: string) => {
    // console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    // console.log('Supabase Secret:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET);
    const supabase = createClient(`${process.env.NEXT_PUBLIC_SUPABASE_URL}`, `${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET}`)
    console.log('current prompt inside generateImage func', prompt)
  
    const characterMap: Record<string, string> = {
      nami: "<lora:nami:0.5>",
      robin_fashion: "<lora:opfashion:0.9>",
      hancock: "<lora:fantasyStyle:0.8>",
      yamato:"<lora:yamatochan:1>"
    };
  
    const styleMap: Record<string, string> = {
      anime: "falkons_nami",
      anime_fashion: "drbob",
      fantasy: "ponydiffusion",
    };
  
    const negativePromptMap: Record<string, string> = {
      anime: "paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, glans,",
      anime_fashion: "easynegative, incomplete clothes, bad hand,By bad artist,easynegative,negative_hand, pointy ears, elf ears, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)),((grayscale:2)), skin spots, acnes, skin blemishes, age spot, glans, lowres, bad anatomy, bad hands, text, error, (missing fingers:2),extra digit, fewer digits, cropped, worstquality, low quality, normal quality,jpegartifacts,signature, watermark, username,blurry,bad feet,cropped,poorly drawn hands,poorly drawn face,mutation,deformed, extra limbs,extra arms,extra legs,malformed limbs,fused fingers,too many fingers,long neck,cross-eyed,mutated hands,polar lowres,bad body,bad proportions,gross proportions,text,error,missing fingers,missing arms,missing legs,",
      fantasy: "bad art, poorly drawn, blurry, text, error, deformed, disfigured, worst quality, low quality,",
    };
  
    const loraPromptMap: Record<string, string> = {
      nami: "nami, one piece, 1girl, bangle, bangs, bare shoulders, belt, bikini, bikini top only, blue sky, caribbean worlds background, ship handrail, pirate ship, bracelet, breasts, brown eyes, bubble, cleavage, cloud, cowboy shot, day, denim, earrings, floating hair, green belt, green bikini, groin, jeans, jewelry, large breasts, log pose, long hair, looking at viewer, navel, orange hair, pants, shoulder tattoo, sidelocks, sky, smile, solo, standing, stomach, swimsuit, tattoo on shoulder, ((masterpiece)), topless, nipples, nice hands, perfect hands",
      robin_fashion: "score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up, thick lines, anime, masterpiece, egghd, 1girl, solo, long hair, breasts, looking at viewer, smile, large breasts, black hair, thighhighs, long sleeves, navel, cleavage, sitting, underwear, collarbone, panties, jacket, sidelocks, open clothes, sky, midriff, cloud, hand up, stomach, grin, arm up, blue sky, lips, black jacket, crop top, groin, black panties, eyelashes, no bra, highleg, suspenders, cropped legs, zipper, arm at side, high collar, highleg panties, hair slicked back, collared jacket, nico robin BREAK source_anime",
      fantasy: "bad art, poorly drawn, blurry, text, error, deformed, disfigured, worst quality, low quality,",
      yamato:"an illustration in the art-style of<lora:opsaga:0.5>,( wanostyle),1 girl,mature female,(best quality:1),(highly detailed:1),(1girl,solo:1.3),(tall female:1.5),28years old,shiny skin,shiny hair,breasts,yamato \(one piece\),(multicolored hair:1),horns,hair ornament,(smile:1.3),yamatowanpi,fit, full body,  wide windows, living room, sideboob"
    };
    const lorapromptdefault = "best quality, ultra high res, (photorealistic:1.4), 1girl, off-shoulder white shirt, black tight skirt, black choker, (faded ash gray messy bun:1), faded ash gray hair, (large breasts:1), looking at viewer, closeup, selfie, slightly blonde hair, pretty,"
    const loraprompt = loraPromptMap[characterTag] || lorapromptdefault
    const negapromptdefault = "paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, glans,"
    const negaprompt = negativePromptMap[styleTag] || negapromptdefault;
    const lora = characterMap[characterTag] || "";
    const checkpoint = styleMap[styleTag] || "falkons_nami";
//const negaprompt = "paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, glans,"
    const payload = {
      api_name: "txt2img",
      prompt: loraprompt + lora +", "+ customPrompt + ", " + prompt,
      negative_prompt: negaprompt,
      override_settings: {
        sd_model_checkpoint: checkpoint,
      },
      steps: 28,
      sampler_index: "DPM++ 2M",
      scheduler: "Karras",
      cfg_scale: 8,
      width: 512,
      height: 762,
    }
    const payload2 = {
      api_name: "txt2img",
      prompt: loraprompt + lora +", "+ customPrompt + ", " + prompt,
      negative_prompt: negaprompt,
      override_settings: {
        sd_model_checkpoint: checkpoint,
        CLIP_stop_at_last_layers: 2,
      },
      hr_scale: 2,
      steps: 25,
      sampler_index: "DPM++ 2M",
      scheduler: "Karras",
      cfg_scale: 7,
      width: 512,
      height: 762,
    }
    console.log('Payload for API:', payload);
    try {
      const response = await axios.post(`https://api.runpod.ai/v2/${process.env.NEXT_PUBLIC_SD_RUNPOD_API_ID}/runsync`, {
      //const response = await axios.post(`https://api.runpod.ai/v2/exwbe8nwqkd9kv/runsync`, {
        input: payload2
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SD_RUNPOD_API_KEY}`,
          //'Authorization': `Bearer 01TDHLUK9CCYKARPIULUS106ZBDEIQMAK8G0MAU5`,
        },
        timeout: 60000,// set timeout to 60s,
      })
      
      console.log('SD_RUNPOD_API_ID:', process.env.NEXT_PUBLIC_SD_RUNPOD_API_ID);
      console.log('SD_RUNPOD_API_KEY:', process.env.NEXT_PUBLIC_SD_RUNPOD_API_KEY); 
  
      console.log("Posted to Runpod")
  
      const image = response.data.output.images[0]
      console.log(image.length)
  
      const { data, error } = await supabase
        .storage
        .from('gen-images')
        .upload(`public/ai-mind-gen-${nanoid()}.png`, decode(image), {
          contentType: 'image/png'
        })
      if (error) {
        console.log('error', error)
        return undefined
      }
      console.log(data)
      // @ts-ignore
      const publicPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`
      console.log(publicPath)
  
      // return image
      return publicPath
  
    } catch (error) {
      console.error('Error:', error);
      return undefined;
    }
  }

  const isLoading = form.formState.isSubmitting;
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const generatePreviewImage = async () => {
    setIsGeneratingImage(true);
    console.log("Generating image preview...");
    try {
      const prompt = " ";
      const styleTag = form.getValues('styleTag') || "";
      const characterTag = form.getValues('characterTag') || "";
      console.log(styleTag, characterTag);
      const customPrompt = form.getValues('customPrompt') || "";
      const imageData = await generateImage(prompt, styleTag, characterTag,customPrompt);
      if (imageData) {
        setImagePreview(imageData);
      } else {
        console.error("Received undefined image data");
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setImagePreview(null);
    } finally {
      setIsGeneratingImage(false);
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await axios.patch(`/api/mind/${initialData.id}`, values);
      } else {
        await axios.post("/api/mind", values);
      }

      toast({
        description: "Success.",
        duration: 2500,
      });

      router.refresh();
      router.push("/");
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        description: "Something went wrong.",
        duration: 2500,
      });
    }
  };

  const useGeneratedImage = () => {
    if (imagePreview) {
      form.setValue('src', imagePreview);
    }
  };

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">General Information</h3>
              <p className="text-sm text-muted-foreground">
                General information about this AI GF
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                <FormControl>
                  <ImageUpload disabled={isLoading} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Elon Musk" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is how your AI GF will be named.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="CEO & Founder of Tesla, SpaceX" {...field} />
                  </FormControl>
                  <FormDescription>
                    Short description for your AI GF
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select disabled={isLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue defaultValue={field.value} placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a category for your AI
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Detailed instructions for AI Behaviour
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="instructions"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea disabled={isLoading} rows={7} className="bg-background resize-none" placeholder="Your instructions here..." {...field} />
                </FormControl>
                <FormDescription>
                  Describe in detail your mind&apos;s backstory and relevant details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="seed"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example Conversation</FormLabel>
                <FormControl>
                  <Textarea disabled={isLoading} rows={7} className="bg-background resize-none" placeholder="（Optional）" {...field} />
                </FormControl>
                <FormDescription>
                  Write a couple of examples of a human chatting with your AI, write expected answers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center mt-4">
            <Button
              type="button"
              size="lg"
              className="bg-secondary text-primary hover:bg-secondary-dark"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Additional Options" : "Show Additional Options"}
            </Button>
          </div>
          {isExpanded && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="styleTag"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Style Tag</FormLabel>
                      <FormControl>
                        <Select disabled={isLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue defaultValue={field.value} placeholder="Select a style tag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="anime">Anime</SelectItem>
                            <SelectItem value="anime_fashion">Anime Fashion</SelectItem>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        This is the AI engine that will be used for image generation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="characterTag"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Character Tag</FormLabel>
                      <FormControl>
                        <Select disabled={isLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue defaultValue={field.value} placeholder="Select a character tag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="robin_fashion">Robin(1pc)</SelectItem>
                            <SelectItem value="nami">Nami(1pc)</SelectItem>
                            <SelectItem value="hancock">Boa Hancock(1pc)</SelectItem>
                            <SelectItem value="yamato">Yamato(1pc)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        This is the girl model that will be used to generate AI images.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="customPrompt"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Prompt</FormLabel>
                      <FormControl>
                        <Textarea disabled={isLoading} rows={3} className="bg-background resize-none" placeholder="Your custom prompt here..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Describe the look of your girl.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex justify-center">
                <Button type="button" size="lg" disabled={isLoading || isGeneratingImage} onClick={generatePreviewImage}>
                  Generate A Preview Image Of Your AI GF
                  <Eye className="w-4 h-4 ml-2" />
                </Button>
              </div>
              {isGeneratingImage && (
                <div className="w-full flex justify-center mt-4">
                  <LoadingSpinner />
                </div>
              )}
              {imagePreview && (
                <div className="w-full flex flex-col items-center justify-center mt-4 space-y-2">
                  <div className="border-4 border-gray-300 p-2 rounded-md">
                    <img src={imagePreview} alt="Image Preview" sizes="(max-width: 768px) 100vw, 768px" />
                  </div>
                  <Button type="button" onClick={useGeneratedImage}>
                    Use this Image as the avatar
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="w-full flex justify-center mt-4">
            <Button size="lg" disabled={isLoading}>
              {initialData ? "Confirm Changes of your GF" : "Create your GF"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
