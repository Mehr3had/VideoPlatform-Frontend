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
        <main className="min-h-screen bg-gray-100">

            <Navbar />

            <section className="mx-auto max-w-7xl px-8 py-10">

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard
                        </h1>

                        <p className="mt-2 text-gray-500">
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

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Videos
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.videos_count}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Subscribers
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.subscribers_count}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Views
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.total_views}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Likes
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.total_likes}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Comments
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.total_comments}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Following
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats.following_count}
                        </p>
                    </div>

                </div>

                {videos.length === 0 ? (

                    <div className="mt-10 rounded-xl bg-white p-10 text-center shadow-sm">

                        <p className="text-gray-500">
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

                    <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-sm">

                        <div className="border-b px-6 py-4">

                            <h2 className="font-semibold text-gray-900">
                                Your Videos
                            </h2>

                        </div>

                        <div className="divide-y">

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
                                        <div className="flex h-28 w-48 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                                            No thumbnail
                                        </div>
                                    )}

                                    <div className="flex-1">

                                        <Link
                                            href={`/videos/${video.id}`}
                                            className="text-lg font-semibold text-gray-900 hover:text-red-700"
                                        >
                                            {video.title}
                                        </Link>

                                        <p className="mt-2 text-sm text-gray-500">
                                            {video.views_count} views
                                        </p>

                                        <div className="mt-3 flex gap-4 text-sm text-gray-500">
                                            <span>👍 {video.likes_count}</span>
                                            <span>👎 {video.dislikes_count}</span>
                                            <span>💬 {video.comments_count}</span>
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                            {video.description}
                                        </p>

                                    </div>

                                    <div className="flex gap-3">

                                        <Link
                                            href={`/dashboard/edit/${video.id}`}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(video.id)
                                            }
                                            className="rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
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