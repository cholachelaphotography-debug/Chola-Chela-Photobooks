"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

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

        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">
            Forgot password?
          </h1>
          <p className="text-stone-500 text-sm mb-6">
            Enter the email on your account. We will guide you on how to get
            access again.
          </p>

          {!submitted ? (
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
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800 transition"
              >
                Continue
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-sm text-stone-600">
              <p className="text-stone-800 font-medium">
                Password reset is handled by the studio.
              </p>
              <p>
                Please contact Chola Chela Photo Book Studio with the email{" "}
                <span className="font-medium text-stone-900">
                  {email || "you registered with"}
                </span>
                :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  WhatsApp:{" "}
                  <a
                    href="https://wa.me/260966080108"
                    className="text-orange-700 font-medium hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    +260 966 080 108
                  </a>
                </li>
                <li>
                  Email:{" "}
                  <a
                    href="mailto:cholachelaphotography@gmail.com"
                    className="text-orange-700 font-medium hover:underline"
                  >
                    cholachelaphotography@gmail.com
                  </a>
                </li>
              </ul>
              <p className="text-stone-500">
                Technicians: ask an administrator to use{" "}
                <strong>Reset password</strong> under User management on the
                admin dashboard.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-stone-500 mt-6">
            <Link
              href="/login"
              className="text-orange-700 font-medium hover:underline"
            >
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
