"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setSuccessMessage("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Force password change for temp admin-created accounts
      const session = await getSession();
      const user = session?.user as
        | { role?: string; mustChangePassword?: boolean }
        | undefined;

      if (user?.mustChangePassword) {
        router.push("/change-password");
        router.refresh();
        return;
      }

      const role = user?.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "technician") {
        router.push("/technician");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">Welcome back</h1>
      <p className="text-stone-500 text-sm mb-6">
        Log in to your studio. You will be taken to the right dashboard for your
        role.
      </p>

      {successMessage && (
        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-orange-700 font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-stone-500 mt-6">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="text-orange-700 font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold text-lg">
              CC
            </div>
            <div className="text-left">
              <div className="font-semibold text-stone-900 leading-tight">
                Chola Chela
              </div>
              <div className="text-[10px] uppercase tracking-widest text-orange-700">
                Photo Book Studio
              </div>
            </div>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
              Loading...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
