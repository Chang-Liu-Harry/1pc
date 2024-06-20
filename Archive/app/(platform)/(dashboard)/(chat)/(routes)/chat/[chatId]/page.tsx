import { redirect } from "next/navigation";
import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { ChatClient } from "./components/client";
import { checkSubscription } from "@/lib/subscription";

interface ChatIdPageProps {
  params: {
    chatId: string;
  }
}

const ChatIdPage = async ({
  params
}: ChatIdPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirectToSignIn();
  }

  const isPro = await checkSubscription();
  // console.log('isPro?', isPro)

  const mind = await prismadb.mind.findUnique({
    where: {
      id: params.chatId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc"
        },
        where: {
          userId,
        },
      },
      _count: {
        select: {
          messages: true,
        }
      }
    }
  });


  if (!mind) {
    return redirect("/");
  }

  return (
    <ChatClient mind={mind} isPro={isPro} />
  );
}

export default ChatIdPage;
