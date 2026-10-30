"use client";

import { useAppearanceStore } from "@/stores/useAppearanceStore";
import { useLanguage } from "@/context/LanguageContext";

const accents = [
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#dc2626" },
    { name: "Blue", value: "#2563eb" },
    { name: "Green", value: "#16a34a" },
    { name: "Orange", value: "#ea580c" },
    { name: "Pink", value: "#db2777" },
];

export default function AppearanceSettings() {
    const mode = useAppearanceStore((state) => state.mode);
    const accent = useAppearanceStore((state) => state.accent);
    const backgroundStyle = useAppearanceStore(
        (state) => state.backgroundStyle
    );

    const setMode = useAppearanceStore((state) => state.setMode);
    const setAccent = useAppearanceStore((state) => state.setAccent);
    const setBackgroundStyle = useAppearanceStore(
        (state) => state.setBackgroundStyle
    );
    const resetAppearance = useAppearanceStore(
        (state) => state.resetAppearance
    );

    const { isPersian } = useLanguage();

    return (
        <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#303030] dark:bg-[#181818]">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {isPersian ? "تنظیمات ظاهری" : "Appearance"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isPersian
                        ? "ظاهر پلتفرم را مطابق سلیقه‌ات تنظیم کن."
                        : "Customize the look and feel of your platform."}
                </p>
            </div>

            <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isPersian ? "حالت نمایش" : "Theme"}
                </label>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setMode("light")}
                        aria-pressed={mode === "light"}
                        className={`rounded-lg border px-4 py-2 text-sm ${
                            mode === "light"
                                ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950"
                                : "border-gray-300 text-gray-700 dark:border-[#404040] dark:text-gray-300"
                        }`}
                    >
                        {isPersian ? "روشن" : "Light"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode("dark")}
                        aria-pressed={mode === "dark"}
                        className={`rounded-lg border px-4 py-2 text-sm ${
                            mode === "dark"
                                ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950"
                                : "border-gray-300 text-gray-700 dark:border-[#404040] dark:text-gray-300"
                        }`}
                    >
                        {isPersian ? "تاریک" : "Dark"}
                    </button>
                </div>
            </div>

            <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isPersian ? "رنگ اصلی" : "Accent color"}
                </label>

                <div className="flex flex-wrap gap-3">
                    {accents.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setAccent(item.value)}
                            title={item.name}
                            aria-label={item.name}
                            aria-pressed={accent === item.value}
                            className={`h-10 w-10 rounded-full border-2 ${
                                accent === item.value
                                    ? "border-gray-900 ring-2 ring-gray-400 ring-offset-2 dark:border-white dark:ring-offset-[#181818]"
                                    : "border-transparent"
                            }`}
                            style={{ backgroundColor: item.value }}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label
                    htmlFor="background-style"
                    className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {isPersian ? "رنگ پس‌زمینه" : "Background style"}
                </label>

                <select
                    id="background-style"
                    value={backgroundStyle}
                    onChange={(event) =>
                        setBackgroundStyle(
                            event.target.value as
                                | "default"
                                | "soft"
                                | "blue"
                        )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-violet-500 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                >
                    <option value="default">
                        {isPersian ? "پیش‌فرض" : "Default"}
                    </option>
                    <option value="soft">
                        {isPersian ? "ملایم" : "Soft"}
                    </option>
                    <option value="blue">
                        {isPersian ? "آبی" : "Blue"}
                    </option>
                </select>
            </div>

            <button
                type="button"
                onClick={resetAppearance}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-[#404040] dark:text-gray-300 dark:hover:bg-[#252525]"
            >
                {isPersian ? "بازگردانی تنظیمات پیش‌فرض" : "Reset appearance"}
            </button>
        </section>
    );
}