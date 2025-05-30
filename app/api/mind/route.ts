import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId, styleTag, characterTag, customPrompt, medias } = body;

    if (!user || !user.id || !user.username) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!src || !name || !description || !instructions || !seed || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    };

    const isPro = await checkSubscription();
    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const mind = await prismadb.mind.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.username,
        src,
        name,
        description,
        instructions,
        seed,
        styleTag,
        characterTag,
        customPrompt,
        medias: []
      }
    });

    return NextResponse.json(mind);
  } catch (error) {
    console.log("[MIND_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
