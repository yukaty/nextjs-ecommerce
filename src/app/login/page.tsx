"use client"; // Runs on the client (browser) side

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link"; // Link to registration page

// Login page
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [errorMessage, setErrorMessage] = useState(""); // Error message

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Cancel default submission behavior
    setErrorMessage(""); // Clear errors before submission

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Input data validation
    if (!email?.trim() || !password?.trim()) {
      setErrorMessage("Please enter email address and password.");
      return;
    }

    try {
      // Send POST request to login API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        if (data.isAdmin) {
          // Admin login
          router.push("/admin/products");
        } else if (redirect) {
          // Redirect from protected page
          router.replace(redirect);
        } else {
          // Normal login
          router.push("/?logged-in=1");
        }
        router.refresh(); // Reload web page to update header
      } else {
        // Display error information on login failure
        setErrorMessage(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Communication error occurred.");
    }
  };

  // Common style for input fields
  const inputStyle =
    "w-full border border-gray-300 px-3 py-2 rounded-sm focus:ring-2 focus:ring-brand-500";
  // Common style for labels
  const labelStyle = "block font-bold mb-1";
  // Common style for badges
  const badgeStyle =
    "ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md";

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-center mb-6">Login</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl"
      >
        <label className={labelStyle} htmlFor="email">
          Email Address<span className={badgeStyle}>Required</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={inputStyle}
        />

        <label className={labelStyle} htmlFor="password">
          Password<span className={badgeStyle}>Required</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className={inputStyle}
        />

        <button
          type="submit"
          className="w-full mt-6 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-sm font-semibold"
        >
          Login
        </button>

        <div className="text-center mt-4">
          <Link href="/register" className="text-brand-600 hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </main>
  );
}
