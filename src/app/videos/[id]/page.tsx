"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { text } from "stream/consumers";
import Navbar from "@/components/Navbar";
import { API, BACKEND_URL } from "@/lib/api";

export default function VideoDetailPage() {

  const params = useParams();
  const videoId = params.id;

  const [video, setVideo] = useState<any>(null);

  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);

  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

    useEffect(() => {

        const getVideo = async () => {

            const response = await fetch(
                `${API}/videos/${videoId}/`
            );

            const data = await response.json();

            if (response.ok) {

                setVideo(data);

                setLikesCount(data.likes_count);
                setDislikesCount(data.dislikes_count);

                const token = localStorage.getItem("accessToken");

                await fetch(
                    `${API}/videos/${videoId}/view/`,
                    {
                        method: "POST",

                        headers: token
                        ?{
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                    }
                );

                const commentsResponse = await fetch(
                    `${BACKEND_URL}/videos/${videoId}/comments/`
                );

                const commentsData = await commentsResponse.json();

                if (commentsResponse.ok) {
                    setComments(commentsData);
                }

            }

        };

        getVideo();


    }, [videoId]);

    if (!video) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </main>
        );
    }

    const handleReaction = async (reaction: string) => {

        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        const response = await fetch(
            `${BACKEND_URL}/videos/${videoId}/react/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    reaction: reaction,
                }),
            }
        );

        const data = await response.json();

        if(response.ok) {

            setLikesCount(data.likes_count);
            setDislikesCount(data.dislikes_count);

            console.log(data);
        }

        else {
            console.log("Reaction failed:", data);
        }
    }

    const handleCommentSubmit = async (e: any) => {

        e.preventDefault();

        const token = localStorage.getItem("accessToken");

        if(!token) {
            alert("Please login first.");
            return;
        }

        if(!commentText.trim()) {
            return;
        }

        const response = await fetch(
            `${BACKEND_URL}/videos/${videoId}/comments/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    text: commentText,
                }),
            }
        );

        const data = await response.json();

        if(response.ok) {

            setComments((previouscomments) => [
                data.comment,
                ...previouscomments,
            ]);

            setCommentText("");
        }

        else {
            console.log("Comment failed:", data);
            alert(data.error || "Comment failed.")
        }
    };

    return (
        <main className="min-h-screen bg-gray-100">

            <Navbar />

            <section className="mx-auto max-w-5xl px-8 py-10">

                <video
                    controls
                    poster={video.thumbnail}
                    className="w-full rounded-xl"
                >
                    <source src={video.video_file} />
                </video>

                <h1 className="mt-6 text-3xl font-bold text-gray-900">
                    {video.title}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    
                    <a
                        href={`/profile/${video.user_id}`}
                        className="font-medium text-gray-700 hover:text-red-700"
                    >
                        {video.username}
                    </a>

                    {" • "}

                    {video.views_count} views

                </p>

                <p className="mt-6 text-gray-700">
                    {video.description}
                </p>

                <div className="mt-6 flex gap-3">

                    <button
                        onClick={() => handleReaction("like")}
                        className="rounded-lg bg-red-700 px-5 py-2 font-medium text-white hover:bg-red-800"
                    >
                        👍 Like {likesCount}
                    </button>

                    <button
                        onClick={() => handleReaction("dislike")}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
                    >
                        👎 Dislike {dislikesCount}
                    </button>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(
                                window.location.href
                            );

                            alert("Link copied!");
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700"
                    >
                        🔗 Share
                    </button>

                </div>

            </section>

            <section className="mt-10">

                <h2 className="mb-5 text-2xl font-bold">
                    Comments
                </h2>

                <form
                    onSubmit={handleCommentSubmit}
                    className="mb-6"
                >

                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-red-700"
                        rows={4}
                    />

                    <button
                        type="submit"
                        className="mt-3 rounded-lg bg-red-700 px-5 py-2 font-medium text-white hover:bg-red-800"
                    >
                        Add Comment
                    </button>

                </form>

                <div className="space-y-4">

                    {comments.map((comment) => (

                        <div
                            key={comment.id}
                            className="rounded-lg bg-white p-4 shadow-sm"
                        >

                            <p className="font-medium text-gray-900">
                                {comment.username}
                            </p>

                            <p className="mt-1 text-gray-700">
                                {comment.text}
                            </p>

                        </div>
                    ))}

                </div>

            </section>

        </main>
    );
}