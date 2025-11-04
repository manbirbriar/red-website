"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";

function ContactContent() {
  const searchParams = useSearchParams();
  const slotId = searchParams.get("slot");
  const slotLabel = searchParams.get("label") ?? undefined;

  return (
    <div className="space-y-16">
      <section className="space-y-6 text-red-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
          {slotId ? "Complete your booking" : "Contact us"}
        </p>
        <h1 className="text-4xl font-semibold leading-tight">
          {slotId ? "You're almost there." : "We would love to hear from you."}
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          {slotId ? (
            <>
              Fill out the form below to complete your booking request. We&apos;ll reach out within
              48 hours to confirm details and coordinate your RED presentation.
            </>
          ) : (
            <>
              Whether you&apos;re a teacher, parent, volunteer, or community partner, the RED team
              is ready to answer questions, collaborate on programming, and connect you with
              resources.
            </>
          )}
        </p>
      </section>

      {slotId ? (
        <BookingForm selectedSlotId={slotId ?? undefined} selectedSlotLabel={slotLabel} />
      ) : (
        <section className="grid gap-10 md:grid-cols-[0.6fr,1.4fr]">
          <aside className="space-y-8 rounded-3xl border border-red-100 bg-red-50/70 px-6 py-8 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-red-600">
                Reach us directly
              </h2>
              <dl className="mt-4 space-y-4 text-sm text-slate-700">
                <div>
                  <dt className="font-semibold text-red-700 text-lg">Email</dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:reducalgary@gmail.com"
                      className="text-red-700 underline-offset-2 hover:underline text-lg"
                    >
                      reducalgary@gmail.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-red-700 text-lg">Socials</dt>
                  <dd className="mt-1 text-lg">Instagram · Facebook · Twitter</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-16">
          <section className="space-y-6 text-red-800">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
              Contact us
            </p>
            <h1 className="text-4xl font-semibold leading-tight">Loading...</h1>
          </section>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
