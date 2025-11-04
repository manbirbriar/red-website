"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { EventClickArg, EventInput, EventSourceInput } from "@fullcalendar/core/index.js";
import type { FullCalendarProps } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { AVAILABILITY_ENDPOINT } from "@/lib/apiConfig";

type RawBookingDetails = {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  school?: string;
  presentationType?: string;
  location?: string;
  extraNotes?: string;
  status?: string;
  createdAt?: string;
  slotLabel?: string;
  [key: string]: unknown;
};

type RawAvailabilitySlot = Record<string, unknown> & {
  booking?: RawBookingDetails | null;
};

type CalendarEvent = EventInput & {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  extendedProps: {
    raw: RawAvailabilitySlot;
    location?: string;
    capacity?: number;
    availabilityStatus?: string;
    isBookable: boolean;
    booking?: BookingDetails;
  };
};

type BookingDetails = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  school?: string;
  presentationType?: string;
  location?: string;
  extraNotes?: string;
  status?: string;
  createdAt?: string;
  slotLabel?: string;
};

type FetchState = "idle" | "loading" | "loaded" | "error";

const FullCalendar = dynamic(
  () => import("@fullcalendar/react"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
        Loading calendar…
      </div>
    ),
  },
) as unknown as (props: FullCalendarProps) => JSX.Element;

const locale =
  typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-CA";

const dateFormatter = new Intl.DateTimeFormat(locale, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(locale, {
  month: "short",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(locale, {
  hour: "numeric",
  minute: "2-digit",
});

const longDateTimeFormatter = new Intl.DateTimeFormat(locale, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatSlotLabel(startISO: string, endISO?: string, availabilityStatus?: string) {
  const startDate = new Date(startISO);
  const endDate = endISO ? new Date(endISO) : undefined;

  if (Number.isNaN(startDate.getTime())) {
    return availabilityStatus && availabilityStatus !== "available"
      ? "Presentation booked"
      : "Available presentation";
  }

  const statusPrefix =
    availabilityStatus && availabilityStatus !== "available" ? "Booked" : "Available";

  let label = `${statusPrefix} · ${shortDateFormatter.format(startDate)}`;
  label += `, ${timeFormatter.format(startDate)}`;

  if (endDate && !Number.isNaN(endDate.getTime())) {
    label += ` – ${timeFormatter.format(endDate)}`;
  }

  return label;
}

function formatSelectedSlot(startISO: string, endISO?: string) {
  const startDate = new Date(startISO);
  const endDate = endISO ? new Date(endISO) : undefined;

  if (Number.isNaN(startDate.getTime())) {
    return "Schedule confirmed during follow-up";
  }

  if (endDate && !Number.isNaN(endDate.getTime())) {
    const sameDay = startDate.toDateString() === endDate.toDateString();
    if (sameDay) {
      return `${dateFormatter.format(startDate)} · ${timeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`;
    }

    return `${longDateTimeFormatter.format(startDate)} – ${longDateTimeFormatter.format(endDate)}`;
  }

  return `${dateFormatter.format(startDate)} · ${timeFormatter.format(startDate)}`;
}

function normalisePayload(payload: unknown): RawAvailabilitySlot[] {
  if (Array.isArray(payload)) {
    return payload as RawAvailabilitySlot[];
  }

  if (payload && typeof payload === "object") {
    const candidate = (payload as Record<string, unknown>).availability;
    if (Array.isArray(candidate)) {
      return candidate as RawAvailabilitySlot[];
    }

    const slots = (payload as Record<string, unknown>).slots;
    if (Array.isArray(slots)) {
      return slots as RawAvailabilitySlot[];
    }
  }

  return [];
}

function normaliseBookingDetails(raw: unknown): BookingDetails | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const booking = raw as Record<string, unknown>;

  const normalised: BookingDetails = {
    id:
      typeof booking.id === "string"
        ? booking.id
        : typeof booking.id === "number"
          ? String(booking.id)
          : undefined,
    name: typeof booking.name === "string" ? booking.name : undefined,
    email: typeof booking.email === "string" ? booking.email : undefined,
    phone: typeof booking.phone === "string" ? booking.phone : undefined,
    school: typeof booking.school === "string" ? booking.school : undefined,
    presentationType:
      typeof booking.presentationType === "string" ? booking.presentationType : undefined,
    location: typeof booking.location === "string" ? booking.location : undefined,
    extraNotes:
      typeof booking.extraNotes === "string" && booking.extraNotes.trim().length > 0
        ? booking.extraNotes
        : undefined,
    status: typeof booking.status === "string" ? booking.status : undefined,
    createdAt: typeof booking.createdAt === "string" ? booking.createdAt : undefined,
    slotLabel: typeof booking.slotLabel === "string" ? booking.slotLabel : undefined,
  };

  return normalised;
}

function formatBookingTooltip(details: BookingDetails): string {
  const lines: string[] = [];

  if (details.slotLabel) {
    lines.push(details.slotLabel);
  }

  if (details.school) {
    lines.push(`School: ${details.school}`);
  }
  if (details.presentationType) {
    lines.push(`Presentation: ${details.presentationType}`);
  }

  if (lines.length === 0 && details.name) {
    lines.push(`Booked by: ${details.name}`);
  }

  return lines.join("\n");
}

function toCalendarEvent(slot: RawAvailabilitySlot, index: number): CalendarEvent | null {
  const startCandidate =
    slot.start ??
    slot.startTime ??
    slot.start_time ??
    slot.startDate ??
    slot.date ??
    slot.begin ??
    slot.when;

  const endCandidate =
    slot.end ??
    slot.endTime ??
    slot.end_time ??
    slot.endDate ??
    slot.finish ??
    slot.until;

  if (typeof startCandidate !== "string") {
    return null;
  }

  const idCandidate = slot.id ?? slot.slotId ?? slot.availabilityId ?? slot.uuid;
  const id = typeof idCandidate === "string" || typeof idCandidate === "number"
    ? String(idCandidate)
    : `${startCandidate}-${endCandidate ?? index}`;

  const allDayValue = slot.allDay ?? slot.all_day ?? slot.isAllDay;
  const allDay = typeof allDayValue === "boolean" ? allDayValue : false;

  const statusCandidate = slot.status ?? slot.state ?? slot.availabilityStatus;
  const availabilityStatus =
    typeof statusCandidate === "string" ? statusCandidate.toLowerCase() : undefined;
  const isBookable = !availabilityStatus || availabilityStatus === "available";
  const locationCandidate = slot.location ?? slot.venue ?? slot.room ?? slot.site;
  const capacityCandidate = slot.capacity ?? slot.availableSeats ?? slot.remainingSpots;
  const bookingDetails = normaliseBookingDetails(slot.booking);

  const titleCandidate = slot.title ?? slot.label ?? slot.name;
  const fallbackTitle = formatSlotLabel(
    startCandidate,
    typeof endCandidate === "string" ? endCandidate : undefined,
    availabilityStatus,
  );
  const title =
    typeof titleCandidate === "string" && titleCandidate.trim().length > 0
      ? titleCandidate
      : fallbackTitle;

  const backgroundColor = isBookable ? "#b91c1c" : "#94a3b8";
  const borderColor = isBookable ? "#7f1d1d" : "#64748b";
  const textColor = isBookable ? "#ffffff" : "#111827";

  return {
    id,
    title,
    start: startCandidate,
    end: typeof endCandidate === "string" ? endCandidate : undefined,
    allDay,
    backgroundColor,
    borderColor,
    textColor,
    extendedProps: {
      raw: slot,
      location: typeof locationCandidate === "string" ? locationCandidate : undefined,
      capacity:
        typeof capacityCandidate === "number"
          ? capacityCandidate
          : typeof capacityCandidate === "string"
            ? Number.parseInt(capacityCandidate, 10)
            : undefined,
      availabilityStatus,
      isBookable,
      booking: bookingDetails,
    },
  };
}

export default function AvailabilityCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [state, setState] = useState<FetchState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAvailability = useCallback(
    async (signal?: AbortSignal) => {
      setState("loading");
      setErrorMessage(null);

      try {
        const response = await fetch(AVAILABILITY_ENDPOINT, { signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        let payload: unknown = [];

        if (response.status !== 204) {
          const text = await response.text();
          if (text) {
            try {
              payload = JSON.parse(text);
            } catch (parseError) {
              console.warn("Availability response was not valid JSON", parseError);
              payload = [];
            }
          }
        }

        const rawSlots = normalisePayload(payload);
        const calendarEvents = rawSlots
          .map(toCalendarEvent)
          .filter((event): event is CalendarEvent => Boolean(event));

        setEvents(calendarEvents);
        setState("loaded");
        setLastUpdated(new Date());

        const hasBookableSlots = calendarEvents.some(
          (event) => event.extendedProps.isBookable,
        );

        setSelectionNotice(
          hasBookableSlots
            ? null
            : "All presentation windows are currently booked. Please check back soon or reach out by email.",
        );

        setSelectedEventId((currentId) => {
          const stillSelected = calendarEvents.find(
            (event) => event.id === currentId && event.extendedProps.isBookable,
          );
          if (stillSelected) {
            return stillSelected.id;
          }

          const firstAvailable = calendarEvents.find((event) => event.extendedProps.isBookable);
          return firstAvailable ? firstAvailable.id : null;
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load availability", error);
        setErrorMessage(
          "We couldn't load the availability calendar. Please refresh or try again shortly.",
        );
        setState("error");
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAvailability(controller.signal);

    return () => controller.abort();
  }, [fetchAvailability]);

  const handleEventClick = useCallback(
    (eventClickInfo: EventClickArg) => {
      eventClickInfo.jsEvent.preventDefault();
      const { id, extendedProps } = eventClickInfo.event;
      const props = extendedProps as Partial<CalendarEvent["extendedProps"]>;

      if (props && props.isBookable === false) {
        setSelectionNotice(
          "That presentation window has already been booked. Please choose another available time.",
        );
        return;
      }

      setSelectionNotice(null);
      setSelectedEventId(id);

      queueMicrotask(() => {
        document
          .getElementById("booking-slot-details")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [],
  );

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const selectedSlotLabel = useMemo(
    () =>
      selectedEvent
        ? formatSelectedSlot(selectedEvent.start, selectedEvent.end)
        : null,
    [selectedEvent],
  );

  const selectedAvailabilityStatus =
    selectedEvent?.extendedProps.availabilityStatus ?? null;
  const selectedIsBookable = selectedEvent?.extendedProps.isBookable ?? false;

  const selectedStatusLabel = useMemo(() => {
    if (selectedAvailabilityStatus) {
      return selectedAvailabilityStatus.replace(/^\w/, (char) => char.toUpperCase());
    }
    return selectedIsBookable ? "Available" : "Unavailable";
  }, [selectedAvailabilityStatus, selectedIsBookable]);

  const contactHref = useMemo(() => {
    if (!selectedEvent) {
      return "/contact";
    }

    if (selectedSlotLabel) {
      return `/contact?slot=${encodeURIComponent(selectedEvent.id)}&label=${encodeURIComponent(selectedSlotLabel)}`;
    }

    return `/contact?slot=${encodeURIComponent(selectedEvent.id)}`;
  }, [selectedEvent, selectedSlotLabel]);

  const mailtoHref = useMemo(() => {
    if (!selectedSlotLabel) {
      return "mailto:reducalgary@gmail.com?subject=RED%20presentation%20request";
    }

    return `mailto:reducalgary@gmail.com?subject=${encodeURIComponent(
      "RED presentation request",
    )}&body=${encodeURIComponent(
      `I'd like to request the presentation slot: ${selectedSlotLabel}.`,
    )}`;
  }, [selectedSlotLabel]);

  const calendarEvents = useMemo(() => events as EventSourceInput, [events]);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-red-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            Pick a presentation window
          </p>
          <h2 className="text-2xl font-semibold text-red-800">
            Availability Calendar
          </h2>
          <p className="text-sm text-slate-600">
            Select an open slot to start a booking request. We&apos;ll follow up to
            confirm details and tailor the session to your classroom.
          </p>
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </header>

        {selectionNotice ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {selectionNotice}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            events={calendarEvents}
            eventClick={handleEventClick}
            selectable={false}
            eventDisplay="block"
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: true,
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "lowercase",
            }}
            eventDidMount={(info) => {
              const props = info.event.extendedProps as Partial<CalendarEvent["extendedProps"]>;
              if (props?.isBookable === false && props.booking) {
                const tooltip = formatBookingTooltip(props.booking);
                if (tooltip.trim().length > 0) {
                  info.el.setAttribute("title", tooltip);
                } else {
                  info.el.removeAttribute("title");
                }
              } else {
                info.el.removeAttribute("title");
              }
            }}
            eventClassNames={(arg) => {
              const props = arg.event.extendedProps as Partial<CalendarEvent["extendedProps"]>;
              const classes = ["transition"];

              if (props?.isBookable === false) {
                classes.push("cursor-not-allowed", "opacity-80");
              } else {
                classes.push("hover:brightness-110", "cursor-pointer");
              }

              if (arg.event.id === selectedEventId) {
                classes.push("ring-2", "ring-offset-2", "ring-red-500");
              }
              return classes;
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Last refreshed:{" "}
            {state === "loading"
              ? "updating…"
              : lastUpdated
                ? new Intl.DateTimeFormat(locale, {
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(lastUpdated)
                : "not yet loaded"}
          </span>
          <button
            type="button"
            onClick={() => fetchAvailability()}
            className="rounded-full border border-red-200 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-50"
            disabled={state === "loading"}
          >
            {state === "loading" ? "Refreshing…" : "Refresh availability"}
          </button>
        </div>
      </section>

      <section
        id="booking-slot-details"
        className="rounded-3xl border border-red-100 bg-red-50/60 px-6 py-8 shadow-sm md:px-10 md:py-12"
      >
        <h3 className="text-lg font-semibold uppercase tracking-[0.3em] text-red-600">
          Next steps
        </h3>

        {state === "loading" && !selectedEvent ? (
          <p className="mt-6 text-sm text-slate-600">
            Loading availability. Choose a slot to see booking details.
          </p>
        ) : null}

        {!selectedEvent && state === "loaded" ? (
          <p className="mt-6 text-sm text-slate-600">
            Choose an available presentation window from the calendar to start your request.
          </p>
        ) : null}

        {selectedEvent ? (
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
                Selected slot
              </p>
              <p className="mt-2 text-lg font-semibold text-red-800">
                {selectedSlotLabel}
              </p>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Status
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  selectedIsBookable ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {selectedStatusLabel}
              </p>

              {typeof selectedEvent.extendedProps.capacity === "number" ? (
                <p className="mt-1 text-sm text-slate-600">
                  Recommended audience size: up to {selectedEvent.extendedProps.capacity} students.
                </p>
              ) : null}
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              {selectedIsBookable ? (
                <>
                  <p>
                    Ready to move forward? Share your class details and we&apos;ll confirm the
                    presentation within 48 hours.
                  </p>
                  <Link
                    href={contactHref}
                    className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    Request this slot
                  </Link>
                </>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  This presentation window has already been booked. Choose another time from the
                  calendar or reach out by email to discuss alternatives.
                </div>
              )}
              <p className="text-xs text-slate-500">
                Prefer email? Reach us at{" "}
                <a
                  href={mailtoHref}
                  className="font-medium text-red-700 underline-offset-2 hover:underline"
                >
                  reducalgary@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
