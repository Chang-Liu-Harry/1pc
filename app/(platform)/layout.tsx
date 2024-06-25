"use client"

import { ClerkProvider } from "@clerk/nextjs";
import { useEighteenConfirm } from "@/hooks/use-eighteen-confirm";
import { EighteenConfirm } from "@/components/eighteen-confirm";

const PlatformLayout = (
  { children }: { children: React.ReactNode }
) => {
  const {isConfirmed} = useEighteenConfirm();
  if(!isConfirmed) {
    return <EighteenConfirm />;
  }
  
  return (
    <ClerkProvider afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
      {/* <ViewTransitions> */}
      {children}
      {/* </ViewTransitions> */}
    </ClerkProvider>
  );
}

export default PlatformLayout;