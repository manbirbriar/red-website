import Image from "next/image";

const brandLogos = [
  {
    src: "/assets/images/UniversityOfCalgary.png",
    alt: "University of Calgary logo",
    width: 240,
    height: 120,
  },
  {
    src: "/assets/images/StudentUnion.png",
    alt: "Students' Union logo",
    width: 240,
    height: 120,
  },
  {
    src: "/assets/images/Devon.png",
    alt: "Devon Energy logo",
    width: 200,
    height: 120,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-red-200/60 bg-transparent">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-red-700">
            Partners &amp; Supporters
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-start gap-6">
            {brandLogos.map((logo) => (
              <div
                key={logo.alt}
                className="flex items-center justify-center rounded bg-white px-4 py-2 shadow-sm ring-1 ring-red-100"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-red-700">
              Reforming Education on Drugs
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-700">
              Empowering Calgary youth with science-based education on
              substance use, harm reduction, and public health.
            </p>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold uppercase tracking-wide text-red-600">
              Contact
            </p>
            <p className="text-sm">reducalgary@gmail.com</p>
            <p className="text-sm">University of Calgary Students&apos; Union Club</p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-red-500">
          © {new Date().getFullYear()} Reforming Education on Drugs
        </p>
      </div>
    </footer>
  );
}
