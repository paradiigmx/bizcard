import type { Metadata, Viewport } from "next";
import React from "react";
import "./globals.css";
import { AppProvider } from "./provider";
import MainLayout from "./components/MainLayout";

export const metadata: Metadata = {
  title: "BizCard+ AI Scanner",
  description: "An intelligent business card scanner that uses AI to extract, parse, and save contact information. Powered by Paradiigm.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="slate" suppressHydrationWarning>
      <body>
        <AppProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AppProvider>
      </body>
    </html>
  );
}