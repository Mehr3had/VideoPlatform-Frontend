"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

export default function UploadPage() {

    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        const getCategories = async () => {

            try {

                const response = await fetch(
                    `${API}/categories/`
                );

                const data = await response.json();

                if (response.ok) {
                    setCategories(data);
                }

            } catch (error) {

                console.log(
                    "Categories error:",
                    error
                );

            }

        };

        getCategories();

    }, []);

    const handleUpload = async (e: any) => {

        e.preventDefault();

        setError("");

        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError("Please login first.");
            return;
        }

        if (!videoFile) {
            setError("Please select a video file.");
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("video_file", videoFile);

        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        if (categoryId) {
            formData.append("category_id", categoryId);
        }

        try {

            const response = await fetch(
                `${API}/videos/upload/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("Video uploaded successfully!");

                router.push("/dashboard");

            } else {

                setError(
                    data.error || "Upload failed."
                );

            }

        } catch (error) {

            console.log(
                "Upload error:",
                error
            );

            setError(
                "Something went wrong."
            );

        } finally {

            setLoading(false);

        }

    };

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]">

            <Navbar />

            <section className="mx-auto max-w-2xl px-6 py-10">

                <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]">

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Upload Video
                    </h1>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Share a new video with your audience.
                    </p>

                    {error && (
                        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleUpload}
                        className="mt-8 space-y-6"
                    >

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                                placeholder="Enter video title"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                rows={5}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                                placeholder="Describe your video"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                            </label>

                            <select
                                value={categoryId}
                                onChange={(e) =>
                                    setCategoryId(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                            >

                                <option
                                    value=""
                                    className="bg-white text-gray-900 dark:bg-[#202020] dark:text-gray-100"
                                >
                                    Select category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                        className="bg-white text-gray-900 dark:bg-[#202020] dark:text-gray-100"
                                    >
                                        {category.name}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Video File
                            </label>

                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) =>
                                    setVideoFile(
                                        e.target.files?.[0] || null
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:file:bg-[#303030] dark:file:text-gray-200 dark:hover:file:bg-[#404040]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Thumbnail
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setThumbnail(
                                        e.target.files?.[0] || null
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:file:bg-[#303030] dark:file:text-gray-200 dark:hover:file:bg-[#404040]"
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50"
                        >
                            {loading
                                ? "Uploading..."
                                : "Upload Video"}
                        </button>

                    </form>

                </div>

            </section>

        </main>
    );
}