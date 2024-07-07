import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ProModal } from "@/components/pro-modal";
import "@radix-ui/themes/styles.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnepieceAI",
  description: "Talk to any charater you like",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "bg-[linear-gradient(90deg,rgba(252,122,132,.6),rgba(101,156,123,.6))]"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProModal />
          {children}
          <Toaster />
        </ThemeProvider>

        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7BTFG1MQPR"
        ></Script>
        <Script id="google-analysis">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7BTFG1MQPR');
          `}
        </Script>
      </body>
    </html>
  );
}
