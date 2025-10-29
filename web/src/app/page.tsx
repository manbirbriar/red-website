import Link from "next/link";

import { QuoteCarousel } from "@/components/QuoteCarousel";

// const heroImageSrc = "/assets/images/main10.jpg";

const teacherQuotes = [
  {
    quote: "It was really informative, I learned new things myself.",
    author: "G.P. Vanier Grade 7 Teacher",
  },
  {
    quote: "Your instructors were excellent. Thank you so much.",
    author: "G.P. Vanier Grade 7 Teacher",
  },
  {
    quote: "Same time next year, with thanks to all.",
    author: "G.P. Vanier Grade 9 Teacher",
  },
];

const highlights = [
  {
    title: "Interactive Science",
    description:
      "Hands-on demonstrations and Kahoot! challenges help students connect neuroscience and public health concepts to real life.",
  },
  {
    title: "Curriculum Aligned",
    description:
      "Each presentation is tailored to grade levels and Alberta curriculum outcomes, from Grade 5 to Grade 12.",
  },
  {
    title: "Volunteer Powered",
    description:
      "University of Calgary students passionate about education and harm reduction lead every classroom visit.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className=" ">
        <div className="flex flex-col justify-center space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            Reforming Education on Drugs (RED)
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-red-800 md:text-5xl">
            Science-first drug education for Calgary classrooms.
          </h1>
          <p className="w-full text-base text-slate-700 text-left">
            RED’s mission is to equip students to make informed decisions by
            providing them with accurate information about the biological
            effects of drugs. What sets us apart is our science-based, unbiased
            approach to substance use education. We have found this method to
            foster an environment of trust in which students feel comfortable
            participating in open discussion. Our educational workshops are
            tailored to junior high and high school students that are exposed
            to relevant topics in Alberta such as fentanyl and cannabis.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Book a presentation
            </Link>
            <Link
              href="/presentations"
              className="inline-flex items-center justify-center rounded-full border border-red-400 px-6 py-3 text-base font-semibold text-red-700 transition hover:border-red-500 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Explore presentations
            </Link>
          </div>
        </div>
        {/* hero image removed intentionally */}
      </section>

      <section className="rounded-3xl border border-red-100 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-red-800">Our Vision</h2>
        <p className="mt-3 text-base text-slate-700">
          The annual costs of substance abuse are enormous - $40 Billion in Canada (Canadian Centre on Substance Abuse).
          Despite the implementation of substance abuse awareness campaigns, drug offences (per 100, 000 population) have
          been increasing since the early 1990’s (Statistics Canada, 2009). Unfortunately, substance abuse is still a major
          obstacle that must be overcome. RED (Reforming Education on Drugs) was established at the University of Calgary
          with hopes to combat substance abuse by educating the early-teens population. We believe in education with an
          emphasis on science, while taking social views into understanding as well. Through interactive presentations, we
          hope to establish, in students, a foundational understanding of the biological and neurological mechanisms
          involved in substance use. This approach allows us to engage students in a discussion and effectively
          communicate the consequences of substance abuse. By discussing substance abuse in an objective and scientific
          manner, we believe students will come to their own conclusions and hold themselves accountable.
        </p>
      </section>

      <section className="grid gap-10 md:grid-cols-[0.9fr,1.1fr] md:items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-red-800">
            Trusted by Calgary teachers
          </h2>
          <p className="text-base text-slate-700">
            Educators invite us back year after year because our team brings
            compassionate storytelling, strong scientific literacy, and
            age-appropriate content to every visit.
          </p>
          <ul className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-red-100 bg-white/70 p-4 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
          <QuoteCarousel quotes={teacherQuotes} />
      </section>

      <section className="grid gap-10 rounded-3xl border border-red-100 bg-white px-6 py-10 shadow-sm md:grid-cols-[1.2fr,0.8fr] md:px-12 md:py-14">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-red-800">What we cover</h2>
          <p className="text-base text-slate-700">
            Our team offers multiple presentation streams designed with
            neuroscience students, harm reduction advocates, and classroom
            teachers. Each session blends interactive demos, storytelling, and
            discussion prompts.
          </p>
          <div className="grid gap-3 text-sm">
            <p className="rounded-xl border border-red-100 bg-red-50/70 px-4 py-3 text-red-800">
              Drug Overview · Fentanyl · Cannabis · Vaccine · Mental Health
            </p>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
              Presentations range from 45 to 60 minutes and can be delivered in
              person or virtually, depending on school needs.
            </p>
          </div>
          <Link
            href="/presentations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 transition hover:text-red-900"
          >
            Learn about each presentation
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M7.293 4.293a1 1 0 011.414 0L13 8.586l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 9H4a1 1 0 110-2h6.586L7.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
        <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-600 to-red-500 p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold uppercase tracking-[0.3em] text-red-100">
            Contact Us
          </h3>
          <p className="mt-4 text-sm text-red-50">
            Have questions about our availability or classroom fit? Reach out
            and a volunteer coordinator will be in touch within 48 hours.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M1.5 6.75A3.75 3.75 0 015.25 3h13.5A3.75 3.75 0 0122.5 6.75v10.5A3.75 3.75 0 0118.75 21H5.25A3.75 3.75 0 011.5 17.25V6.75zm3.553-.952A1.25 1.25 0 004.5 6.75v.334l6.861 4.116a1.25 1.25 0 001.278 0L19.5 7.084V6.75a1.25 1.25 0 00-.553-1.002l-6.861 4.116a2.75 2.75 0 01-2.772 0L5.053 5.798z" />
                </svg>
              </span>
              reducalgary@gmail.com
            </p>
            <p className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M11.47 3.841a.75.75 0 011.06 0l7.07 7.07a.75.75 0 11-1.06 1.06L12 5.561 5.47 11.97a.75.75 0 01-1.06-1.06l7.06-7.07z" />
                  <path d="M12 21a.75.75 0 01-.75-.75V9a.75.75 0 011.5 0v11.25A.75.75 0 0112 21z" />
                </svg>
              </span>
              University of Calgary Students&apos; Union Club
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Contact the team
          </Link>
        </div>
      </section>
    </div>
  );
}