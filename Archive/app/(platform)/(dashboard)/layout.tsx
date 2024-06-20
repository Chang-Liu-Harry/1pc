import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import NoticeBar from "@/components/noticebar";
import { checkSubscription } from "@/lib/subscription";

const RootLayout = async ({
  children
}: {
  children: React.ReactNode
}) => {
  const isPro = await checkSubscription();
  return (
    <div className="h-full">
      <Navbar isPro={isPro} />
      <div className="flex">
      </div>
      <div className="md:flex hidden mt-16 w-20 flex-col fixed inset-y-0">
        <Sidebar isPro={isPro} />
      </div>
      <main className="md:pl-20 pt-20 h-full"> {/* Adjust main padding */}
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
