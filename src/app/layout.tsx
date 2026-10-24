
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "VideoPlatform",
    description: "Video sharing platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="fa"
            dir="rtl"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="flex min-h-full flex-col">
                <LanguageProvider>{children}</LanguageProvider>
            </body>
        </html>
    );
}