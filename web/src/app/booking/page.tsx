

const steps = [
  "Fill out the booking request with your school and presentation preferences.",
  "Our coordinators match your classroom with available RED volunteers.",
  "We connect within 48 hours to confirm logistics and tailor the session.",
  "You receive a confirmation package with presentation details and next steps.",
];



export default function BookingPage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 text-red-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
          Book a presentation
        </p>
        <h1 className="text-4xl font-semibold leading-tight">
          Bring RED to your classroom.
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          We&apos;re currently collecting availability for the upcoming semester.
          Share a few details about your class and we&apos;ll coordinate a time
          that works for your students and our volunteers.
        </p>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
        <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-red-600">
          How it works
        </h2>
        <ol className="mt-6 space-y-4 text-base text-slate-700">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white shadow-sm">
                {index + 1}
              </span>
              <span className="pt-2 text-sm leading-relaxed text-slate-700">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Booking request section removed - handled via contact page or email */}
    </div>
  );
}
