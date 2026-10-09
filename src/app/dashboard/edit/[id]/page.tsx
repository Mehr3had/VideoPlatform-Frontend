"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

import { API } from "@/lib/api";

export default function EditVideoPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const getVideo = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await fetch(
                    `${API}/videos/${videoId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to load video.");
                }

                const data = await response.json();

                setTitle(data.title ?? "");
                setDescription(data.description ?? "");
                setCategoryId(String(data.category ?? data.category_id ?? ""));
            } catch (error) {
                console.error("Load video error:", error);
                alert("Could not load video details.");
            } finally {
                setLoading(false);
            }
        };

        const getCategories = async () => {
            try {
                const response = await fetch(
                    `${API}/categories`
                );

                if(!response.ok) {
                    throw new Error("Failed to load categories.");
                }

                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Categories error:", error);
            }
        };

        getVideo();
        getCategories();
    }, [videoId, router]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", categoryId);

        if (videoFile) {
            formData.append("video_file", videoFile);
        }

        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        setSaving(true);

        try {
            console.log("Selected category:", categoryId);
            const response = await fetch(
                `${API}/videos/${videoId}/edit/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Video update failed.");
                return;
            }

            alert("Video updated successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Update video error:", error);
            alert("Something went wrong while updating the video.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100">
                <Navbar />
                <p className="py-20 text-center text-gray-500">
                    Loading video...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <Navbar />

            <section className="mx-auto max-w-2xl px-6 py-10">
                <div className="rounded-xl bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Video
                    </h1>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Title
                            </label>

                            <input
                                required
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Category
                            </label>

                            <select
                                value={categoryId}
                                onChange={(event) => setCategoryId(event.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
                            >
                                <option value="">Select a category</option>

                                {categories.map((category) => (
                                    <option key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={5}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Replace Video (optional)
                            </label>

                            <input
                                type="file"
                                accept="video/*"
                                onChange={(event) =>
                                    setVideoFile(event.target.files?.[0] ?? null)
                                }
                                className="block w-full text-sm text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Replace Thumbnail (optional)
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setThumbnail(event.target.files?.[0] ?? null)
                                }
                                className="block w-full text-sm text-gray-600"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}