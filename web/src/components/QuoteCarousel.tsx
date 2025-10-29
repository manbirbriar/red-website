"use client";

import { useEffect, useState } from "react";

export type Quote = {
  quote: string;
  author: string;
};

type QuoteCarouselProps = {
  quotes: Quote[];
  intervalMs?: number;
};

export function QuoteCarousel({ quotes, intervalMs = 7000 }: QuoteCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % quotes.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [quotes.length, intervalMs]);

  if (quotes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-6 md:mt-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-lg font-semibold leading-relaxed text-red-900 md:text-xl">
          “{quotes[activeIndex].quote}”
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
          {quotes[activeIndex].author}
        </p>
      </div>

      <div className="flex w-full items-center justify-center">
        <div className="flex gap-2">
          {quotes.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show quote ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-8 bg-red-600"
                  : "w-2.5 bg-red-300/80 hover:bg-red-400"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 ml-6">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) =>
                prev === 0 ? quotes.length - 1 : prev - 1
              )
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white/80 text-red-600 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Previous quote"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M12.78 5.22a.75.75 0 010 1.06L9.06 10l3.72 3.72a.75.75 0 01-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % quotes.length)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white/80 text-red-600 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Next quote"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M7.22 14.78a.75.75 0 010-1.06L10.94 10 7.22 6.28a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
