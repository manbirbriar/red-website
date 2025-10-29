import Image from "next/image";
import Link from "next/link";

const presentations = [
  {
    title: "Drug Overview",
    image: "/assets/images/drug_overview.png",
    description: [
      "The Drug Overview provides an understanding of the commonly-used drugs amphetamine (adderall), alcohol, and cannabis. Students are first introduced to the brain and its normal function. Different parts of the brain are discussed, as well as the role of neurotransmitters in permitting communication. This provides a foundation on which to discuss the drugs’ effects on the brain.",
      "The presentation is delivered through engaging videos, interactive activities and educational discussions of topics related to these drugs, such as the legalization of cannabis. Students are challenged in a final investigation activity where they study vital signs and symptoms to diagnose patients who have overdosed.",
    ],
    activities: [
      {
        title: "Patient Overdose Investigation",
        detail:
          "In this activity, students must use neurological and physiological symptoms in order to successfully diagnose patients with the correct drug overdose. This activity is conducted in teams of 4-5, and the teams compete for prizes with one another to successfully diagnose their patients!",
      },
      {
        title: "Reaction Time Test",
        detail:
          "In this activity, the effects of drugs on the brain’s reaction speed are explained with a hands-on reaction time test. Students measure their reaction speeds in normal conditions and under simulated drug impairment.",
      },
      {
        title: "Trivia",
        detail:
          "Students will participate in a trivia game designed to test their background knowledge and spark discussion regarding various abused substances. Throughout the game, misconceptions and incorrect responses will be explained by our volunteers.",
      },
    ],
  },
  {
    title: "Fentanyl",
    image: "/assets/images/fentanyl.png",
    description: [
      "The Fentanyl presentation was developed in response to the opioid crisis in Alberta. The topic of fentanyl is first approached through a series of interactive questions relating to current statistics on this drug. Students are challenged to understand the realities of this opioid and its presence in the media.",
      "Importantly, students then learn about the symptoms of overdose, naloxone kits, and the science behind how opioids work. Finally, students participate in a classroom discussion on the topic of supervised injection sites.",
    ],
    activities: [
      {
        title: "Debate",
        detail:
          "In this activity, the classroom will be divided in two, with half arguing in favour of supervised injection sites, and half arguing against the idea. This debate will encourage students to think on both sides of the issue and spark some great discussion.",
      },
      {
        title: "Concluding Activity",
        detail:
          "At the end of the presentation the class will be divided into groups and asked to brainstorm answers to several questions relating to drug use and opioids. This gives students the opportunity to reflect on what they have learned and consider other drug-related questions.",
      },
    ],
  },
  {
    title: "Cannabis",
    image: "/assets/images/cannabis.png",
    description: [
      "While cannabis was legalized in 2018, there remain many misconceptions about this drug. This presentation seeks to present accurate information about the use and effects of recreational and medical cannabis, and points to what remains unknown about the drug.",
      "This information is especially important for this age group, as there is evidence that cannabis can have negative long-term effects on the developing brain. We finish with a case study activity in which students are put into the shoes of physicians and use their new-found knowledge to evaluate the prescription of cannabis to various patients.",
    ],
    activities: [
      {
        title: "Case Study Activity",
        detail:
          "In this activity, students evaluate three different cases involving the use or prescription of cannabis. The case studies encourage students to think critically about the effects of cannabis on the body and potential issues that may be associated with its use.",
      },
    ],
  },
  {
    title: "Vaccine",
    image: "/assets/images/vaccine.png",
    description: [
      "The vaccine presentation was developed in response to the COVID-19 pandemic to explain the whys and hows of COVID-19 and “the jab”. This presentation is intended to provide a basic understanding of immunology, our body’s defense mechanisms against foreign bodies, how vaccines work, and the history that has led to the development of the vaccines we have today.",
      "The aim is to familiarize students with these concepts so they have the knowledge to recognize misinformation, as well as feel more confident in their medical decisions. Since this is probably only the first of many far-reaching global pandemics, such education is necessary for fast national and global action in the future. People fear what they do not know, and we hope this presentation changes that.",
    ],
  },
  {
    title: "Addiction",
    image: "/assets/images/addiction.png",
    description: [
      "Addiction has always held a large stigma. As more research comes out and governments and science understand more about addiction, it is becoming more and more clear that we completely misunderstood addiction.",
      "This presentation seeks to educate those on what addiction actually is, how it works, and potential resolutions for aspects of it at both the individual and societal level. Education on addiction is necessary to ensure that coming generations are more empathetic to others’ struggles and mitigate the mystery that often shrouds addiction.",
    ],
  },
  {
    title: "Mental Health",
    image: "/assets/images/mental_health.png",
    description: [
      "Now more than ever, mental health is an increasingly relevant field, both in science and everyday life. This presentation, which is geared towards a general student audience, aims to provide a comprehensive explanation of the neurological bases behind common mental health disorders, specifically mood, anxiety, and addiction disorders.",
      "Additionally, this presentation explores the science behind medications for mental disorders. By providing a more scientific lens through which to view mental health disorders and their treatments, we hope to reduce cases of stigma and/or myths in students, and motivate important but sometimes intimidating discussions about mental health.",
    ],
  },
];

export default function PresentationsPage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 text-red-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
          Classroom presentations
        </p>
        <h1 className="text-4xl font-semibold leading-tight">
          Tailored sessions that spark curiosity and build critical thinking.
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Our volunteer presenters combine neuroscience, public health, and lived
          experience to deliver engaging lessons for Calgary schools. Each
          presentation includes interactive activities, discussion prompts, and
          take-home resources for students and teachers.
        </p>
        <Link
          href="/booking"
          className="inline-flex w-fit items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Book a presentation
        </Link>
      </section>

      <section className="space-y-12">
        {presentations.map((presentation) => (
          <article
            key={presentation.title}
            className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8"
          >
            <div className="mx-auto flex-shrink-0 overflow-hidden rounded-2xl bg-white p-4 shadow-sm md:mx-0">
              <Image
                src={presentation.image}
                alt={`${presentation.title} illustration`}
                width={160}
                height={160}
                sizes="(min-width: 768px) 160px, 120px"
                className="h-24 w-24 object-contain md:h-32 md:w-32"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-semibold text-red-800">
                {presentation.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                {presentation.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {presentation.activities && presentation.activities.length > 0 && (
                <div className="space-y-4">
                  {presentation.activities.map((activity) => (
                    <div key={activity.title} className="space-y-1">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
                        {activity.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {activity.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 transition hover:text-red-900"
              >
                Request this presentation
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
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-red-100 bg-red-50/80 px-6 py-10 shadow-sm">
        <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-red-800">
              Not sure which presentation fits?
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-700">
              We can adapt content for split classes, specialized programs, and
              large assemblies. Share your learning goals when you book and our
              coordinators will suggest the best option.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Start a booking request
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-red-400 px-5 py-2.5 font-semibold text-red-700 transition hover:border-red-500 hover:bg-red-50"
            >
              Ask a question
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
