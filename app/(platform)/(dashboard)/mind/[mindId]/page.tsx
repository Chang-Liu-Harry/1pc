import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { MindForm } from "./components/mind-form";

interface MindIdPageProps {
  params: {
    mindId: string;
  };
};

const MindIdPage = async ({
  params
}: MindIdPageProps) => {
  // TODO: Check subscription
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }
  const mind = await prismadb.mind.findUnique({
    where: {
      id: params.mindId,
      userId,
    }
  });
  console.log("Fetched mind:", mind);

  const categories = await prismadb.category.findMany();

  return (
    <MindForm initialData={mind} categories={categories} />
  );
}


export default MindIdPage;
