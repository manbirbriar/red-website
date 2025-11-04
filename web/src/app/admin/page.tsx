"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ADMIN_ENDPOINT } from "@/lib/apiConfig";
import {
  adminAuthHeaders,
  clearAdminToken,
  getAdminToken,
} from "@/lib/adminSession";

type Booking = {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  presentationType: string;
  location: string;
  extraNotes?: string | null;
  status: string;
  createdAt: string;
  slotLabel?: string | null;
};

type Availability = {
  id: number;
  start: string;
  end: string;
  location?: string | null;
  capacity?: number | null;
  status: string;
  isActive: boolean;
};

type NewSlotForm = {
  start: string;
  end: string;
  capacity: string;
};

const BOOKING_STATUSES = ["all", "pending", "confirmed", "rejected", "cancelled"] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<(typeof BOOKING_STATUSES)[number]>("all");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [creatingSlot, setCreatingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState<NewSlotForm>({
    start: "",
    end: "",
    capacity: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = getAdminToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setTokenChecked(true);
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingsResponse, availabilityResponse] = await Promise.all([
        fetch(`${ADMIN_ENDPOINT}/bookings`, {
          headers: {
            "Content-Type": "application/json",
            ...adminAuthHeaders(),
          },
          cache: "no-store",
        }),
        fetch(`${ADMIN_ENDPOINT}/availability`, {
          headers: {
            "Content-Type": "application/json",
            ...adminAuthHeaders(),
          },
          cache: "no-store",
        }),
      ]);

      if (bookingsResponse.status === 401 || availabilityResponse.status === 401) {
        clearAdminToken();
        router.replace("/login");
        return;
      }

      if (!bookingsResponse.ok || !availabilityResponse.ok) {
        throw new Error("Failed to load admin data");
      }

      const bookingsPayload = (await bookingsResponse.json()) as Booking[];
      const availabilityPayload = (await availabilityResponse.json()) as Availability[];

      setBookings(bookingsPayload);
      setAvailability(availabilityPayload);
      setLoading(false);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load admin data. Please refresh or sign in again.");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (tokenChecked) {
      void loadData();
    }
  }, [tokenChecked, loadData]);

  const filteredBookings = useMemo(() => {
    if (selectedStatus === "all") {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === selectedStatus);
  }, [bookings, selectedStatus]);

  const handleStatusChange = useCallback(async (bookingId: number, status: string) => {
    setActionMessage(null);
    try {
      const response = await fetch(`${ADMIN_ENDPOINT}/bookings/${bookingId}/status?status=${status}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthHeaders(),
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to update booking ${bookingId}`);
      }

      setActionMessage(`Booking ${bookingId} updated to ${status}.`);
      await loadData();
    } catch (updateError) {
      console.error(updateError);
      setActionMessage("Could not update booking. Please try again.");
    }
  }, [loadData, router]);

  const handleCreateSlot = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingSlot(true);
    setActionMessage(null);

    const payload = {
      start: newSlot.start,
      end: newSlot.end,
      capacity: newSlot.capacity ? Number.parseInt(newSlot.capacity, 10) : null,
    };

    try {
      const response = await fetch(`${ADMIN_ENDPOINT}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create slot");
      }

      setActionMessage("New availability slot added.");
      setNewSlot({ start: "", end: "", capacity: "" });
      await loadData();
    } catch (createError) {
      console.error(createError);
      setActionMessage("Could not add availability. Please check the form and try again.");
    } finally {
      setCreatingSlot(false);
    }
  }, [newSlot, loadData, router]);

  const handleDisableSlot = useCallback(async (slotId: number) => {
    if (!window.confirm("Disable this availability slot? Any pending booking will be cancelled.")) {
      return;
    }

    setActionMessage(null);

    try {
      const response = await fetch(`${ADMIN_ENDPOINT}/availability/${slotId}`, {
        method: "DELETE",
        headers: {
          ...adminAuthHeaders(),
        },
      });

      if (response.status === 401) {
        clearAdminToken();
        router.replace("/login");
        return;
      }

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to disable slot");
      }

      setActionMessage(`Availability slot ${slotId} disabled.`);
      await loadData();
    } catch (disableError) {
      console.error(disableError);
      setActionMessage("Could not disable the slot. Please try again.");
    }
  }, [loadData, router]);

  const handleLogout = useCallback(() => {
    clearAdminToken();
    router.replace("/login");
  }, [router]);

  if (!tokenChecked) {
    return null;
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">Admin dashboard</p>
          <h1 className="text-3xl font-semibold text-red-800">Booking requests & availability</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="self-start rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          Sign out
        </button>
      </header>

      {actionMessage ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {actionMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-3xl border border-red-100 bg-white px-6 py-8 shadow-sm md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-red-800">Booking requests</h2>
          <div className="flex items-center gap-3 text-sm">
            <label htmlFor="booking-status" className="font-medium text-slate-600">
              Filter by status
            </label>
            <select
              id="booking-status"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as (typeof BOOKING_STATUSES)[number])}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              {BOOKING_STATUSES.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption.replace(/^\w/, (char) => char.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-600">Loading bookings…</p>
        ) : filteredBookings.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">No bookings found for this filter.</p>
        ) : (
          <div className="mt-6 divide-y divide-slate-200">
            {filteredBookings.map((booking) => (
              <article key={booking.id} className="space-y-4 py-5">
                <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-red-800">
                      #{booking.id} · {booking.school}
                    </h3>
                    <p className="text-sm text-slate-600">{booking.slotLabel ?? "Slot pending scheduling"}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {booking.status}
                  </span>
                </header>

                <dl className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-600">Teacher</dt>
                    <dd>{booking.name}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-600">Email</dt>
                    <dd>{booking.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-600">Phone</dt>
                    <dd>{booking.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-600">Presentation</dt>
                    <dd>{booking.presentationType}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="font-semibold text-slate-600">Location</dt>
                    <dd>{booking.location}</dd>
                  </div>
                  {booking.extraNotes ? (
                    <div className="md:col-span-2">
                      <dt className="font-semibold text-slate-600">Notes</dt>
                      <dd className="whitespace-pre-wrap">{booking.extraNotes}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="flex flex-wrap gap-3">
                  {booking.status !== "confirmed" && booking.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange(booking.id, "confirmed")}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      Confirm
                    </button>
                  ) : null}
                  {booking.status !== "rejected" && booking.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange(booking.id, "rejected")}
                      className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Reject
                    </button>
                  ) : null}
                  {booking.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange(booking.id, "cancelled")}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Mark cancelled
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-red-100 bg-white px-6 py-8 shadow-sm md:px-10">
        <h2 className="text-xl font-semibold text-red-800">Manage availability</h2>

        <form onSubmit={handleCreateSlot} className="mt-6 grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-2">
          <div>
            <label htmlFor="start" className="block text-sm font-semibold text-red-800">
              Start
            </label>
            <input
              id="start"
              type="datetime-local"
              value={newSlot.start}
              onChange={(event) => setNewSlot((prev) => ({ ...prev, start: event.target.value }))}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label htmlFor="end" className="block text-sm font-semibold text-red-800">
              End
            </label>
            <input
              id="end"
              type="datetime-local"
              value={newSlot.end}
              onChange={(event) => setNewSlot((prev) => ({ ...prev, end: event.target.value }))}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-semibold text-red-800">
              Capacity (optional)
            </label>
            <input
              id="capacity"
              type="number"
              min="0"
              value={newSlot.capacity}
              onChange={(event) => setNewSlot((prev) => ({ ...prev, capacity: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <p className="md:col-span-2 text-xs text-slate-500">
            Location defaults to To be confirmed. You can adjust it later when confirming a booking.
          </p>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creatingSlot}
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingSlot ? "Adding slot…" : "Add availability"}
            </button>
          </div>
        </form>

        <div className="mt-8 divide-y divide-slate-200">
          {loading ? (
            <p className="text-sm text-slate-600">Loading availability…</p>
          ) : availability.length === 0 ? (
            <p className="text-sm text-slate-600">No availability slots created yet.</p>
          ) : (
            availability.map((slot) => (
              <article key={slot.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-red-800">Slot #{slot.id}</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(slot.start).toLocaleString()} – {new Date(slot.end).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">{slot.location ?? "Location TBD"}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Status: {slot.status} · {slot.isActive ? "Active" : "Inactive"}
                  </p>
                  {typeof slot.capacity === "number" ? (
                    <p className="text-xs text-slate-500">Capacity: {slot.capacity}</p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleDisableSlot(slot.id)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Disable
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
