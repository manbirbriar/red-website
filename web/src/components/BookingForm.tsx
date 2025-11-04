"use client";

import { useState, FormEvent } from "react";

import { BOOKINGS_ENDPOINT } from "@/lib/apiConfig";

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  school: string;
  presentationType: string;
  location: string;
  extraNotes: string;
};

type BookingFormProps = {
  selectedSlotId?: string;
  selectedSlotLabel?: string;
};

const PRESENTATION_OPTIONS = [
  "Drug Overview",
  "Fentanyl",
  "Cannabis",
  "Vaccine",
  "Addiction",
  "Mental Health",
] as const;

export default function BookingForm({ selectedSlotId, selectedSlotLabel }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    school: "",
    presentationType: "",
    location: "",
    extraNotes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage(null);

    if (!selectedSlotId) {
      setErrorMessage("Please choose a presentation slot before submitting the booking request.");
      setSubmitStatus("error");
      setSubmitting(false);
      return;
    }

    const slotIdValue = Number.parseInt(selectedSlotId, 10);
    if (Number.isNaN(slotIdValue)) {
      setErrorMessage("We couldn't determine which presentation slot you selected. Please try again.");
      setSubmitStatus("error");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(BOOKINGS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          school: formData.school,
          presentationType: formData.presentationType,
          location: formData.location,
          extraNotes: formData.extraNotes,
          slotId: slotIdValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        school: "",
        presentationType: "",
        location: "",
        extraNotes: "",
      });
    } catch (error) {
      console.error("Failed to submit booking request", error);
      setErrorMessage(
        "We couldn't submit your booking request. Please try again or contact us directly at reducalgary@gmail.com"
      );
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-red-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
      <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-red-600">
        Booking Request
      </h2>

      {submitStatus === "success" ? (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-8 text-center">
          <h3 className="text-xl font-semibold text-green-800">Request Submitted!</h3>
          <p className="mt-2 text-sm text-green-700">
            Thank you for your interest. We&apos;ve emailed your request details (including a cancellation link) and will follow up within
            48 hours to confirm logistics.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {selectedSlotLabel && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Selected Time Slot
              </p>
              <p className="mt-1 text-sm font-medium text-blue-800">{selectedSlotLabel}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-red-800">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-red-800">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-red-800">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-semibold text-red-800">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label htmlFor="presentationType" className="block text-sm font-semibold text-red-800">
                Presentation Type <span className="text-red-500">*</span>
              </label>
              <select
                id="presentationType"
                name="presentationType"
                value={formData.presentationType}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="" disabled>
                  Select a presentation
                </option>
                {PRESENTATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-red-800">
                Presentation Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Gymnasium, Classroom 53"
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="extraNotes" className="block text-sm font-semibold text-red-800">
                Extra Notes
              </label>
              <textarea
                id="extraNotes"
                name="extraNotes"
                value={formData.extraNotes}
                onChange={handleChange}
                rows={4}
                placeholder="Any specific topics, accessibility needs, or other details we should know?"
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </div>

          <p className="text-xs text-slate-500">
            By submitting this form, you agree to be contacted by the RED team to coordinate your
            presentation.
          </p>
        </form>
      )}
    </div>
  );
}
