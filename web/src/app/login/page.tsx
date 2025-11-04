"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ADMIN_ENDPOINT } from "@/lib/apiConfig";
import { setAdminToken } from "@/lib/adminSession";

type LoginResponse = {
  token: string;
  expiresInMinutes: number;
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${ADMIN_ENDPOINT}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed (${response.status})`);
      }

      const payload = (await response.json()) as LoginResponse;
      setAdminToken(payload.token);
      router.push("/admin");
    } catch (authError) {
      console.error(authError);
      setError("Login failed. Please check your username and password.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-10">
      <section className="space-y-6 text-red-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">Admin access</p>
        <h1 className="text-4xl font-semibold leading-tight">Sign in to manage bookings</h1>
        <p className="text-base text-slate-700">
          Use the credentials shared privately with you to review requests, confirm or reject bookings, and update availability.
        </p>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white px-6 py-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-red-800">
              Username
            </label>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-red-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
