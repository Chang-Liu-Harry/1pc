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
import { Mind, Prisma, Role } from "@prisma/client";


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

const generateTextMancerPro = async (mind: Mind, userName: string, prompt: string, conversationHistory: ChatMessage[]) => {
  let response = "";
  const data = {
    messages: [
      ...conversationHistory, // Add the past messages here
      {
        role: "user",
        content: prompt,
        name: userName,
      }
    ],
    response_config: {
      description: mind.instructions,
      // "\
      // Scenario:The university, and the room; \
      // Personality: Lydia is sexy, spicy, she doesn't get along very well with you, \
      // she is a gal/gyaru, she likes fashion and is one of the most popular girls in class;\
      // ",
      role: "assistant",
      name: mind.name,
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
  console.log(data)
  return response;
};

interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
  name?: string;
}

function parseChatMessages(chatText: string, userName: string, mindName: string): ChatMessage[] {
  const lines = chatText.split('\n'); // Split text into lines
  const messages: ChatMessage[] = [];

  lines.forEach(line => {
      if (line.startsWith('User:')) {
          messages.push({
              role: 'user',
              content: line.slice(5).trim(), // Remove the 'User:' part
              name: userName,
          });
      } else if (line.includes('http://') || line.includes('https://')) {
          messages.push({
              role: 'system',
              content: line.trim(),
              name: "system",
          });
      } else if (line.trim().length > 0) {
          messages.push({
              role: 'assistant',
              content: line.trim(),
              name: mindName,
          });
      }
  });

  return messages;
}

// subsciption status caching

interface SubscriptionCacheEntry {
  isPro: boolean;
  timestamp: number;
}

interface SubscriptionCache {
  [userId: string]: SubscriptionCacheEntry;
}

const subscriptionCache: SubscriptionCache = {};

function getCacheKey(userId: string): string {
  return `subscription-${userId}`;
}

async function checkSubscription(userId: string): Promise<boolean> {
  const cacheKey = getCacheKey(userId);
  const currentTime = Date.now();
  const cacheEntry = subscriptionCache[cacheKey];

  // Check if cache exists and is within 24 hours
  if (cacheEntry && (currentTime - cacheEntry.timestamp < 86400000)) {
    console.log('Returning cached subscription status');
    return cacheEntry.isPro;
  }

  console.time('Check subscription in DB');
  const subscription = await prismadb.userSubscription.findFirst({
    where: { userId: userId },
  });
  const isPro = subscription && subscription.stripeCurrentPeriodEnd ? new Date() < new Date(subscription.stripeCurrentPeriodEnd) : false;
  console.timeEnd('Check subscription in DB');

  // Update cache
  subscriptionCache[cacheKey] = {
    isPro: isPro,
    timestamp: currentTime
  };

  return isPro;
}

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  const Readable = require("stream").Readable;
  try {
    console.time('Total request handling time');
    const req = await request.json();
    const prompt = req.prompt;

    console.log('Received request with prompt:', prompt);
    const user = await currentUser();
    console.log('Current user:', user);
    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;

    console.time('Rate limit and subscription check');
    const [rateLimitResult, isPro] = await Promise.all([
      rateLimit(identifier),
      checkSubscription(user.id)
    ]);
    console.timeEnd('Rate limit and subscription check');

    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for user:', user.id);
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    console.log('User subscription status:', isPro);
    
    console.time('Update mind in DB');
    const mindUpdatePromise = prismadb.mind.update({
      where: { id: params.chatId },
      data: {
        messages: {
          create: {
            role: Role.user,
            type: "text",
            content: prompt,
            name: user.username ? user.username : user.id,
            userId : user.id,
          },
        },
      },
    });
    console.timeEnd('Update mind in DB');

    // switch to redis?
    const numberOfChatPromise = prismadb.message.count({
      where: { userId: user.id },
    });

    const [mind, numberOfChat] = await Promise.all([mindUpdatePromise, numberOfChatPromise]);
    
    console.log('Number of chats:', numberOfChat);

    if (!mind) {
      console.log('Mind not found for chatId:', params.chatId);
      return new NextResponse("Mind not found", { status: 404 });
    }

    if (numberOfChat >= 30 && !isPro) {
      let s = new Readable();
      let response = "Sorry, I really want to talk to you 😔 but it seems you have reached the limit of free chat. Could you please subscribe the premium plan which does not cost much at all to continue chatting with me? ";
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
      console.timeEnd('Total request handling time');
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
    console.time('Read latest history');
    let records = await memoryManager.readLatestHistory(mindKey);
    console.timeEnd('Read latest history');
    //console.log('Fetched records:', records);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(mind.seed, "\n\n", mindKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", mindKey);
    
    //const recentChatHistory = await memoryManager.readLatestHistory(mindKey);
    //console.log('Recent chat history:', recentChatHistory);
    
    console.time('Parse chat messages');
    let relevantHistory: ChatMessage[] = parseChatMessages(records,(user.username?user.username:user.id),mind.name) || [];
    console.timeEnd('Parse chat messages');
    
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
        console.timeEnd('Total request handling time');
        return new StreamingTextResponse(s);
      }
      console.time('Generate image');
      const image = await generateImage(prompt);
      console.timeEnd('Generate image');
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
        console.timeEnd('Total request handling time');
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
        console.timeEnd('Total request handling time');
        return new StreamingTextResponse(s);
      }
    } else {
      console.time('Generate text');
      const response = await generateTextMancerPro(mind,(user.username?user.username:user.id),prompt, relevantHistory);
      console.timeEnd('Generate text');
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
                name: mind.name,
                type: "text",
                //type: "text",
                userId: user.id,

              },
            },
          },
        });
      }
      console.log('Generated text response for user:', response);
      console.timeEnd('Total request handling time');
      return new StreamingTextResponse(s);
    }
  } catch (error) {
    console.error('Error during request handling:', error);
    console.timeEnd('Total request handling time');
    return new NextResponse("Internal Error", { status: 500 });
  }
}

