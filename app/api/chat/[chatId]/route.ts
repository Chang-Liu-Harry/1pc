import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { nanoid } from 'nanoid';
import axios from "axios";
import { decode } from 'base64-arraybuffer';
import { createClient } from '@supabase/supabase-js';
import { clerkClient } from "@clerk/nextjs";
import { scheduler } from "timers/promises";
import prisma from "@/lib/prismadb";
import { Prisma, Role } from "@prisma/client";


export const maxDuration = 25;
const loraprompt = "best quality, ultra high res, (photorealistic:1.4), 1girl, off-shoulder white shirt, black tight skirt, black choker, (faded ash gray messy bun:1), faded ash gray hair, (large breasts:1), looking at viewer, closeup <lora:koreandoll:0.66>, selfie, slightly blonde hair, pretty"
const negaprompt = "paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, glans,"

const generateImage = async (prompt: string) => {
  const supabase = createClient(`${process.env.SUPABASE_URL}`, `${process.env.SUPABASE_SERVICE_ROLE_SECRET}`)
  console.log('current prompt inside generateImage func', prompt)
  // throw new Error("Image generation not enabled")
  
  // !!! SUSPENDED
  //return null
  try {
    const response = await axios.post(`https://api.runpod.ai/v2/${process.env.SD_RUNPOD_API_ID}/runsync`, {
      input: {
        api_name: "txt2img",
        prompt: loraprompt,
        negative_prompt: negaprompt,
        override_settings: {
          "sd_model_checkpoint": "ChilloutMixFP32"
        },
        steps: 28,
        sampler_index: "DPM++ 2M",
        scheduler: "Karras",
        cfg_scale: 8,
        width: 512,
        height: 512,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SD_RUNPOD_API_KEY}`,
      },
      timeout: 30000// set timeout to 30s
    })

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
    const publicPath = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`
    console.log(publicPath)

    // return image
    return publicPath

  } catch (error) {
    console.error('Error:', error);
    return undefined;
  }
}

const generateTextMancerPro = async (prompt: string, conversationHistory: ChatMessage[]) => {
  let response = "";
  const data = {
    messages: [
      ...conversationHistory, // Add the past messages here
      {
        role: "user",
        content: prompt,
        name: "chang",
      }
    ],
    response_config: {
      description: "\
      Scenario:The university, and the room; \
      Personality: Lydia is sexy, spicy, she doesn't get along very well with you, \
      she is a gal/gyaru, she likes fashion and is one of the most popular girls in class;\
      ",
      role: "assistant",
      name: "Lydia",
    },
    model: "mythomax"
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': `${process.env.MANCER_API_KEY}`
  };
  
  try {
    console.log('Sending text generation request to Mancer with prompt:', prompt);
    let raw_response = await axios.post(`https://neuro.mancer.tech/oai/v1/chat/completions`, data, { headers });
    response = raw_response.data.choices[0].message.content;
    console.log('Received response from Mancer:', response);
  } catch (error) {
    console.error('Error during text generation:', error);
  }
  
  return response;
};

interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

function parseChatMessages(chatText: string): ChatMessage[] {
  const lines = chatText.split('\n'); // Split text into lines
  const messages: ChatMessage[] = [];

  lines.forEach(line => {
      if (line.startsWith('User:')) {
          messages.push({
              role: 'user',
              content: line.slice(5).trim() // Remove the 'User:' part
          });
      } else if (line.includes('http://') || line.includes('https://')) {
          messages.push({
              role: 'system',
              content: line.trim()
          });
      } else if (line.trim().length > 0) {
          messages.push({
              role: 'assistant',
              content: line.trim()
          });
      }
  });

  return messages;
}

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  var Readable = require("stream").Readable;
  try {
    const req = await request.json();
    const prompt = req.prompt;

    console.log('Received request with prompt:', prompt);
    const user = await currentUser();
    console.log('Current user:', user);
    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);
    if (!success) {
      console.log('Rate limit exceeded for user:', user.id);
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const subscription = await prismadb.userSubscription.findFirst({
      where: { userId: user.id },
    });

    let isPro = false;
    if (subscription && subscription.stripeCurrentPeriodEnd) {
      const periodEndDate = new Date(subscription.stripeCurrentPeriodEnd);
      const currentDate = new Date();
      isPro = currentDate < periodEndDate;
    }
    console.log('User subscription status - isPro:', isPro);

    const mind = await prismadb.mind.update({
      where: { id: params.chatId },
      data: {
        messages: {
          create: {
            role: Role.user,
            type: "text",
            content: prompt,
            name: "Chang",
            userId : user.id,
          },
        },
      },
    });

    if (!mind) {
      console.log('Mind not found for chatId:', params.chatId);
      return new NextResponse("Mind not found", { status: 404 });
    }

    const numberOfChat = await prismadb.message.count({
      where: { userId: user.id },
    });

    if (numberOfChat >= 15 && !isPro) {
      let s = new Readable();
      let response = "Oops, my dear. I got something else to do now";
      s.push(response);
      s.push(null);

      await prismadb.mind.update({
        where: { id: params.chatId },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: Role.system,
              type: "text",
              name: "system",
              userId : user.id,
            },
          },
        },
      });

      console.log('Message limit exceeded for non-premium user:', user.id);
      return new StreamingTextResponse(s);
    }

    let type = prompt.includes("send") ? "image" : "text";
    console.log('Request type determined:', type);

    const name = mind.id;
    const mindKey = {
      mindName: name,
      userId: user.id,
      modelName: "llama2",
    };

    const memoryManager = await MemoryManager.getInstance();
    let records = await memoryManager.readLatestHistory(mindKey);
    //console.log('Fetched records:', records);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(mind.seed, "\n\n", mindKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", mindKey);
    
    //const recentChatHistory = await memoryManager.readLatestHistory(mindKey);
    //console.log('Recent chat history:', recentChatHistory);
    
    
    
  let relevantHistory: ChatMessage[] = parseChatMessages(records) || [];
  if (relevantHistory) {
      console.log('Relevant history for the conversation:', relevantHistory);
  } else {
      console.log('No valid history could be processed.');
  }

    if (type == "image") {
      if (!isPro) {
        let s = new Readable();
        s.push("Only paid user could generate images");
        s.push(null);
        console.log('Non-premium user attempted to generate an image.');
        return new StreamingTextResponse(s);
      }
      const image = await generateImage(prompt);
      let s = new Readable();
      if (image) {
        s.push(image);
        s.push(null);
        await prismadb.mind.update({
          where: { id: params.chatId },
          data: {
            messages: {
              create: {
                content: image,
                role: "system",
                type: "image",
                name: "system",
                userId : user.id,
              },
            },
          },
        });
        console.log('Generated image for user:', image);
        return new StreamingTextResponse(s);
      } else {
        let errorContent = "Error when generating images";
        s.push(errorContent);
        s.push(null);
        await prismadb.mind.update({
          where: { id: params.chatId },
          data: {
            messages: {
              create: {
                content: errorContent,
                role: "system",
                type: "text",
                name: "system",
                userId: user.id,
              },
            },
          },
        });
        console.error('Error generating image for user.');
        return new StreamingTextResponse(s);
      }
    } else {
      const response = await generateTextMancerPro(prompt, relevantHistory);
      await memoryManager.writeToHistory("" + response.trim(), mindKey);

      let s = new Readable();
      s.push(response);
      s.push(null);
      if (response && response.length > 1) {
        await prismadb.mind.update({
          where: { id: params.chatId },
          data: {
            messages: {
              create: {
                role: Role.system,
                content: response.trim(),
                name: "Lydia",
                type: "text",
                //type: "text",
                userId: user.id,

              },
            },
          },
        });
      }
      console.log('Generated text response for user:', response);
      return new StreamingTextResponse(s);
    }
  } catch (error) {
    console.error('Error during request handling:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
