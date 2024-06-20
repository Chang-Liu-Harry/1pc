import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export type MindKey = {
  mindName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient();
  }

  public async init() {
    return null
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }

  public async vectorSearch(
    recentChatHistory: string,
    mindFileName: string
  ) {

    const docs: never[] = [];
    return docs;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
  }

  private generateRedisMindKey(mindKey: MindKey): string {
    return `${mindKey.mindName}-${mindKey.modelName}-${mindKey.userId}`;
  }

  public async writeToHistory(text: string, mindKey: MindKey) {
    if (!mindKey || typeof mindKey.userId == "undefined") {
      console.log("Mind key set incorrectly");
      return "";
    }

    const key = this.generateRedisMindKey(mindKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  public async readLatestHistory(mindKey: MindKey): Promise<string> {
    if (!mindKey || typeof mindKey.userId == "undefined") {
      console.log("Mind key set incorrectly");
      return "";
    }

    const key = this.generateRedisMindKey(mindKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }

  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    mindKey: MindKey
  ) {
    const key = this.generateRedisMindKey(mindKey);
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}