import Categories from "@/components/categories";
import Minds from "@/components/minds";
import SearchInput from "@/components/search-input";
import NoticeBar from "@/components/noticebar";  // Import NoticeBar
import prismadb from "@/lib/prismadb";

interface RootPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
};

export default async function RootPage({
  searchParams
}: RootPageProps) {

  let cId = searchParams.categoryId ? await prismadb.category.findFirst({
    where: {
      name: searchParams.categoryId
    }
  }) : undefined;

  // Check if searchParams.name is defined before trimming
  const trimmedName = searchParams.name ? searchParams.name.trim() : '';

  const data = await prismadb.mind.findMany({
    where: {
      categoryId: cId?.id,
      name: {
        contains: trimmedName,
        mode: 'insensitive', // Optional: if you want a case-insensitive search
      },
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      _count: {
        select: {
          messages: true,
        }
      }
    },
  });

  const categories = await prismadb.category.findMany();

  return (
    <div className="h-full p-4 space-y-2">
      <SearchInput />
      {/* <Categories data={categories} /> */}
      <NoticeBar />  {/* Add NoticeBar here */}
      <Minds data={data} />
    </div>
  );
}
