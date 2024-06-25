import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

export async function PATCH(
  req: Request,
  { params }: { params: { mindId: string } }
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId, styleTag, characterTag, customPrompt, medias } = body;

    if (!params.mindId) {
      return new NextResponse("Mind ID required", { status: 400 });
    }

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


    const mind = await prismadb.mind.update({
      where: {
        id: params.mindId,
        userId: user.id,
      },
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
        medias
      }
    });

    return NextResponse.json(mind);
  } catch (error) {
    console.log("[MIND_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export async function DELETE(
  request: Request,
  { params }: { params: { mindId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const mind = await prismadb.mind.delete({
      where: {
        userId,
        id: params.mindId
      }
    });

    return NextResponse.json(mind);
  } catch (error) {
    console.log("[MIND_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
