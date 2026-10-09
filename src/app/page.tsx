"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrendingVideos = async () => {
  try {
    const response = await fetch(
      `${API}/videos/trending/`
    );

    const data = await response.json();

    if (response.ok) {
      setTrendingVideos(data);
    } else {
      console.log("Error fetching trending videos:", data);
    }
  } catch (error) {
    console.log("Error fetching trending videos:", error);
  }
};

  const fetchVideos = async () => {
    try {
      const params = new URLSearchParams();

      params.append("page", page.toString());

      if (search) {
        params.append("search", search);
      }

      if (category) {
        params.append("category", category);
      }

      const response = await fetch(
        `${API}/videos/?${params.toString()}`
      );

      const data = await response.json();

      if (response.ok) {
        setVideos(data.results);

        setTotalPages(
          Math.ceil(data.count / 6)
        );
      } else {
        console.log("Error fetching videos:", data);
      }
    } catch (error) {
      console.log("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchTrendingVideos();
  }, [page, search, category]);

  const handleSearch = () => {
    setPage(1);
    fetchVideos();
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCategory(e.target.value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="px-8 py-12">

        <h2 className="mb-8 text-3xl font-bold text-gray-900">
          Latest Videos
        </h2>

        {/* Search & Category */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row">

          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-600"
          />

          <select
            value={category}
            onChange={handleCategoryChange}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-600"
          >
            <option value="">All Categories</option>
            <option value="1">Gaming</option>
            <option value="2">Movies</option>
            <option value="3">Music</option>
            <option value="4">Technology</option>
          </select>

          <button
            onClick={handleSearch}
            className="rounded-lg bg-red-700 px-6 py-3 font-medium text-white hover:bg-red-800"
          >
            Search
          </button>

        </div>

        {/* Trending Videos */}

        {trendingVideos.length > 0 && (
          <section className="mb-12">

            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              🔥 Trending Videos
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trendingVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                >

                  {video.thumbnail && (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  <div className="p-5">

                    <h3 className="text-lg font-semibold text-gray-900">
                      {video.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      {video.username} • {video.views_count} views
                    </p>
                  </div>
                </Link>
              ))}

            </div>

          </section>
        )}

        {/* Videos */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {videos.map((video) => (

            <Link
              key={video.id}
              href={`/videos/${video.id}`}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >

              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-5">

                <h3 className="text-lg font-semibold text-gray-900">
                  {video.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {video.username} • {video.views_count} views
                </p>

                {video.category_name && (
                  <p className="mt-2 text-xs font-medium text-red-700">
                    {video.category_name}
                  </p>
                )}

              </div>

            </Link>

          ))}

        </div>

        {/* Empty State */}

        {videos.length === 0 && (
          <p className="mt-10 text-center text-gray-500">
            No videos found.
          </p>
        )}

        {/* Pagination */}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">

            <button
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>

          </div>
        )}

      </section>

    </main>
  );
}
