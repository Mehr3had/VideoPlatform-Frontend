"use client";

import Navbar from "@/components/Navbar";
import DesktopHomeView from "@/components/home/DesktopHomeView";
import MobileHomeView from "@/components/home/MobileHomeView";
import useHomeVideos from "@/hooks/useHomeVideos";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
    const home = useHomeVideos();
    const { isPersian } = useLanguage();

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <div className="hidden md:block">
                <DesktopHomeView home={home} />
            </div>

            <div className="md:hidden">
                <MobileHomeView home={home} />
            </div>
        </main>
    );
}