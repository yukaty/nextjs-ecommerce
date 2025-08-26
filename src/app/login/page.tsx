"use client"; // Runs on the client (browser) side

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link"; // Link to registration page
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Input";

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
        <FormField label="Email Address" required>
          <Input
            type="email"
            id="email"
            name="email"
            required
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            type="password"
            id="password"
            name="password"
            required
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          fullWidth
        >
          Login
        </Button>

        <div className="text-center mt-4">
          <Link href="/register" className="text-brand-600 hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </main>
  );
}
