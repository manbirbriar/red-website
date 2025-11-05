"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BOOKINGS_ENDPOINT } from "@/lib/apiConfig";

type CancellationStatus = "pending" | "confirmed" | "rejected" | "cancelled" | string;

type CancellationDetails = {
  bookingId: number;
  status: CancellationStatus;
  slotLabel?: string | null;
  teacherName?: string | null;
  school?: string | null;
  presentationType?: string | null;
  location?: string | null;
};

type FetchState = "idle" | "loading" | "loaded" | "error";

function PageIntro() {
  return (
    <section className="space-y-6 text-red-800">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
        Cancel a booking
      </p>
      <h1 className="text-4xl font-semibold leading-tight">
        Manage your RED presentation request
      </h1>
      <p className="max-w-2xl text-base text-slate-700">
        Use this page to review the booking linked in your email and, if needed, cancel the request.
      </p>
    </section>
  );
}

function CancelPageLoading() {
  return (
    <div className="space-y-12">
      <PageIntro />
      <section className="rounded-3xl border border-red-100 bg-white px-6 py-10 shadow-sm md:px-10">
        <p className="text-sm text-slate-600">Loading booking details…</p>
      </section>
      <div className="text-sm text-slate-600">
        <Link href="/booking" className="font-semibold text-red-700 hover:text-red-900">
          Back to booking overview
        </Link>
      </div>
    </div>
  );
}

function CancelPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [details, setDetails] = useState<CancellationDetails | null>(null);
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const canCancel = useMemo(() => {
    if (!details) return false;
    return details.status === "pending" || details.status === "confirmed";
  }, [details]);

  const statusLabel = useMemo(() => {
    if (!details?.status) {
      return "Unknown";
    }
    return details.status.replace(/^\w/, (char) => char.toUpperCase());
  }, [details]);

  const loadDetails = useCallback(async () => {
    if (!token) {
      setError("Missing cancellation token. Please use the link provided in your email.");
      setState("error");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const response = await fetch(`${BOOKINGS_ENDPOINT}/cancellations/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load booking. Status ${response.status}`);
      }

      const payload = (await response.json()) as CancellationDetails;
      setDetails(payload);
      setState("loaded");
    } catch (fetchError) {
      console.error(fetchError);
      setError(
        "We couldn’t find a booking for that link. Please double-check the URL or contact reducalgary@gmail.com.",
      );
      setState("error");
    }
  }, [token]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const handleCancel = useCallback(async () => {
    if (!token || submitting || !canCancel) {
      return;
    }

    setSubmitting(true);
    setSubmissionMessage(null);

    try {
      const response = await fetch(`${BOOKINGS_ENDPOINT}/cancellations/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel booking. Status ${response.status}`);
      }

      const payload = (await response.json()) as CancellationDetails;
      setDetails(payload);
      setSubmissionMessage("Your booking has been cancelled.");
    } catch (cancelError) {
      console.error(cancelError);
      setSubmissionMessage(
        "We couldn't cancel this booking automatically. Please reach out to reducalgary@gmail.com for help.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [token, submitting, canCancel]);

  return (
    <div className="space-y-12">
      <PageIntro />
      <section className="rounded-3xl border border-red-100 bg-white px-6 py-10 shadow-sm md:px-10">
        {state === "loading" ? (
          <p className="text-sm text-slate-600">Loading booking details…</p>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!error && details ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-700">
              <h2 className="text-base font-semibold text-red-800">Booking overview</h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-red-700">{statusLabel}</dd>
                </div>
                {details.slotLabel ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Presentation window
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">{details.slotLabel}</dd>
                  </div>
                ) : null}
                {details.school ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">School</dt>
                    <dd className="mt-1 text-sm text-slate-700">{details.school}</dd>
                  </div>
                ) : null}
                {details.presentationType ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Presentation
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">{details.presentationType}</dd>
                  </div>
                ) : null}
                {details.location ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">{details.location}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {submissionMessage ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {submissionMessage}
              </div>
            ) : null}

            {details.status === "rejected" ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This request has already been rejected by the RED team. Feel free to submit a new request if you need a different
                time.
              </div>
            ) : null}

            {details.status === "cancelled" ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                This booking is cancelled. If plans change, you can submit a fresh booking request.
              </div>
            ) : null}

            {canCancel ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Need to cancel? Click the button below and we&apos;ll free up the slot for another classroom.
                </p>
                <button
                  type="button"
                  onClick={() => void handleCancel()}
                  disabled={submitting}
                  className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Cancelling…" : "Cancel this booking"}
                </button>
              </div>
            ) : null}

            <p className="text-xs text-slate-500">
              Questions? Email us at
              <a href="mailto:reducalgary@gmail.com" className="ml-1 font-medium text-red-700 underline-offset-2 hover:underline">
                reducalgary@gmail.com
              </a>
              .
            </p>
          </div>
        ) : null}
      </section>

      <div className="text-sm text-slate-600">
        <Link href="/booking" className="font-semibold text-red-700 hover:text-red-900">
          Back to booking overview
        </Link>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<CancelPageLoading />}>
      <CancelPageContent />
    </Suspense>
  );
}
