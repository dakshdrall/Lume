"use client";

import { m } from "framer-motion";
import { HeartsIcon, IdCardIcon, LockIcon, ShieldCheckIcon } from "./Icons";

const features = [
  {
    icon: IdCardIcon,
    title: "Verified students only",
    body: "Every profile passes a student ID check and a live selfie match before it goes live.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safety first",
    body: "Report and block in one tap. Every profile is reviewed by a real human.",
  },
  {
    icon: LockIcon,
    title: "Private by design",
    body: "No public photos, no location sharing, and no phone numbers on display. Ever.",
  },
  {
    icon: HeartsIcon,
    title: "Mutual matches only",
    body: "Chat opens only when both people like each other. No unsolicited messages.",
  },
];

export function Features() {
  return (
    <section aria-labelledby="features-title" className="container-page py-16 sm:py-24">
      <div className="text-halo max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent-ink">What&apos;s coming</p>
        <h2 id="features-title" className="mt-3 font-serif text-[clamp(2.2rem,7vw,3.6rem)] leading-[1.02] text-ink">
          Built for trust, <em className="italic">not swipes.</em>
        </h2>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, body }, i) => (
          <m.li
            key={title}
            className="card flex flex-col gap-4 p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
            <p className="text-[15px] leading-relaxed text-muted">{body}</p>
          </m.li>
        ))}
      </ul>
    </section>
  );
}
