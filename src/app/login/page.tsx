"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { API } from "@/lib/api";

export default function LoginPage() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleLogin = async (e: any) => {
        e.preventDefault();

        const response = await fetch(
            `${API}/login/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            }
        );

        const data = await response.json();

        if(response.ok) {
            localStorage.setItem("accessToken",data.access);

            localStorage.setItem("username",data.username);

            console.log("Login successful");

            router.push("/");
        } 

        else {
            console.log("Login failed:",data.error);
        }
    };

    const getCurrentUser = async () => {
        const token = localStorage.getItem("accessToken");

        if(!token) {
            console.log("No access token found.");
            return;
        }

        const response = await fetch(
            `${API}/me`,
            {
                method: "GET",

                headers: {
                    Authorization:`Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if(response.ok) {
            console.log("Authenticated user:",data);
        }

        else {
            console.log("Authentication failed:",data);
        }
    };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-700"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-red-700"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-red-700 py-2 font-medium text-white hover:bg-red-800"
          >
            Login
          </button>

        </form>

      </div>

    </main>
  );
}