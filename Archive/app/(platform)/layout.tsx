import { ClerkProvider } from "@clerk/nextjs";
const PlatformLayout = (
  { children }: { children: React.ReactNode }
) => {
  return (
    <ClerkProvider afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
      {/* <ViewTransitions> */}
      {children}
      {/* </ViewTransitions> */}
    </ClerkProvider>
  );
}

export default PlatformLayout;