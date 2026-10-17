"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

export default function DashboardPage() {

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState<any[]>([]);
    const [stats, setStats] = useState({
        videos_count: 0,
        subscribers_count: 0,
        following_count: 0,
        total_views: 0,
        total_likes: 0,
        total_comments: 0,
    });

    useEffect(() => {

        const getDashboard = async () => {

            const token = localStorage.getItem("accessToken");

            if (!token) {
                router.push("/login");
                return;
            }

            try {

                const response = await fetch(
                    `${API}/dashboard/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("username");

                    router.push("/login");
                    return;
                }

                const data = await response.json();

                if (response.ok) {
                    setVideos(data.videos);

                    setStats({
                        videos_count: data.videos_count,
                        subscribers_count: data.subscribers_count,
                        following_count: data.following_count,
                        total_views: data.total_views,
                        total_likes: data.total_likes,
                        total_comments: data.total_comments,
                    });
                }

            } catch (error) {

                console.log(
                    "Dashboard error:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        getDashboard();

    }, [router]);

    const handleDelete = async (videoId: number) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this video?"
        );

        if (!confirmed) {
            return;
        }

        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        try {

            const response = await fetch(
                `${API}/videos/${videoId}/delete/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {

                setVideos((previousVideos) =>
                    previousVideos.filter(
                        (video) => video.id !== videoId
                    )
                );

            } else {

                alert(
                    data.error || "Delete failed."
                );

            }

        } catch (error) {

            console.log(
                "Delete error:",
                error
            );

            alert("Something went wrong.");

        }

    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex justify-center py-20">
                    <p className="text-gray-500">
                        Loading...
                    </p>
                </div>

            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]">

            <Navbar />

            <section className="mx-auto max-w-7xl px-8 py-10">

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Dashboard
                        </h1>

                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Manage your videos.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/upload"
                        className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800"
                    >
                        Upload Video
                    </Link>

                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Videos
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.videos_count}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Subscribers
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.subscribers_count}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Views
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.total_views}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Likes
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.total_likes}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Comments
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.total_comments}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Following
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {stats.following_count}
                        </p>
                    </div>

                </div>

                {videos.length === 0 ? (

                    <div className="mt-10 rounded-xl bg-white p-10 text-center shadow-sm dark:bg-[#181818]">

                        <p className="text-gray-500 dark:text-gray-400">
                            You haven't uploaded any videos yet.
                        </p>

                        <Link
                            href="/dashboard/upload"
                            className="mt-5 inline-block rounded-lg bg-red-700 px-5 py-3 text-sm font-medium text-white"
                        >
                            Upload Your First Video
                        </Link>

                    </div>

                ) : (

                    <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#181818]">

                        <div className="border-b border-gray-200 px-6 py-4 dark:border-[#303030]">

                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                                Your Videos
                            </h2>

                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-[#303030]">

                            {videos.map((video) => (

                                <div
                                    key={video.id}
                                    className="flex items-center gap-5 p-6"
                                >

                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="h-28 w-48 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-28 w-48 items-center justify-center rounded-lg bg-gray-200 text-gray-500 dark:bg-[#303030] dark:text-gray-400">
                                            No thumbnail
                                        </div>
                                    )}

                                    <div className="flex-1">

                                        <Link
                                            href={`/videos/${video.id}`}
                                            className="text-lg font-semibold text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                                        >
                                            {video.title}
                                        </Link>

                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {video.views_count} views
                                        </p>

                                        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span>👍 {video.likes_count}</span>
                                            <span>👎 {video.dislikes_count}</span>
                                            <span>💬 {video.comments_count}</span>
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                            {video.description}
                                        </p>

                                    </div>

                                    <div className="flex gap-3">

                                        <Link
                                            href={`/dashboard/edit/${video.id}`}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:text-gray-300 dark:hover:bg-[#252525]"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(video.id)
                                            }
                                            className="rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </section>

        </main>
    );
}