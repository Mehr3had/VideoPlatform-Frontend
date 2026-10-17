"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { API } from "@/lib/api";

import Link from "next/link";

export default function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch( `${API}/login/`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
          data.detail ||
          "Invalid username or password."
        );
        return;
      }

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("username", data.username);

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    const token = localStorage.getItem("accessToken");

    if(!token) {
      console.log("No access token found.");
      return;
    }

    const response = await fetch(`${API}/me`, {
      method: "GET",
      headers: {
        Authorization:`Bearer ${token}`,
      },
    });

    const data = await response.json();

    if(response.ok) {
      console.log("Authenticated user:",data);
    }

    else {
      console.log("Authentication failed:",data);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0f0f0f]">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]">

        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-red-700 px-4 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="mt-1 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Forgot Password?
            </Link>
            <Link
              href="/forgot-username"
              className="text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Forgot Username?
            </Link>
          </div>

        </form>

      </div>

    </main>
  );
}