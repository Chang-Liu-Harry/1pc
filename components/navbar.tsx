'use client';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Menu, Sparkles } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { ModeToggle } from "./theme-toggle";
import MobileSidebar from "./mobile-sidebar";
import { useProModal } from "@/hooks/use-pro-modal";

// change your font here...
const font = Poppins({
  weight: "600",
  subsets: ["latin"],
});

interface NavbarProps {
  isPro: boolean;
}

const Navbar = ({ isPro }: NavbarProps) => {
  const proModal = useProModal();
  const { isSignedIn, user } = useUser();
  const [isSignedInState, setIsSignedInState] = useState(isSignedIn);

  useEffect(() => {
    setIsSignedInState(isSignedIn);
  }, [isSignedIn, user]);

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
      <div className="flex items-center gap-x-3">
        <Image src="/onepiece.png" alt="One Piece" width={50} height={50} />
        <Link href="/">
          <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary", font.className)}>
            OnepieceAI
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-x-3">
        {!isSignedInState && (
          <>
            <SignInButton>
              <Button size="sm" variant="outline" className="bg-white text-black border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 transition ease-in-out duration-300">
                Log In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size="sm" variant="outline" className="bg-black text-white border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-800 transition ease-in-out duration-300">
                Sign Up
              </Button>
            </SignUpButton>
          </>
        )}
        {isSignedInState && (
          <>
            {!isPro && (
              <Button onClick={proModal.onOpen} size="sm" variant="premium" className="bg-white text-white border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 transition ease-in-out duration-300">
                Upgrade
                <Sparkles className="h-4 w-4 fill-current text-black ml-2" />
              </Button>
            )}
            <div className="rounded-full overflow-hidden">
              <UserButton afterSignOutUrl="/" />
            </div>
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
