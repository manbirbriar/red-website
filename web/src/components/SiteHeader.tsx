"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const logoSrc = "/assets/images/Logo.png";

const navItems = [
  { href: "/presentations", label: "Presentations" },
  { href: "/booking", label: "Book a Presentation" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-red-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt="Reforming Education on Drugs logo"
            width={56}
            height={56}
            className="h-12 w-12 rounded-full border border-red-500 object-contain"
            priority
          />
          <span className="text-lg font-semibold uppercase tracking-wide text-red-700">
            Reforming Education on Drugs
          </span>
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:border-red-500 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {isOpen ? (
              <path
                fillRule="evenodd"
                d="M4.293 6.707a1 1 0 010-1.414l.086-.086a1 1 0 011.414 0L10 9.414l4.207-4.207a1 1 0 011.414 0l.086.086a1 1 0 010 1.414L11.414 10l4.207 4.207a1 1 0 010 1.414l-.086.086a1 1 0 01-1.414 0L10 11.414l-4.207 4.207a1 1 0 01-1.414 0l-.086-.086a1 1 0 010-1.414L8.586 10 4.293 5.793z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm1 4a1 1 0 000 2h12a1 1 0 100-2H4z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
        <nav className="hidden items-center gap-6 text-sm font-medium text-red-700 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-transparent px-4 py-2 transition hover:border-red-200 hover:bg-red-50 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {isOpen && (
        <nav className="md:hidden">
          <ul className="space-y-2 border-t border-red-100 bg-white px-4 py-3 text-sm font-medium text-red-700">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex w-full rounded-md px-3 py-2 transition hover:bg-red-50 hover:text-red-800"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
