"use client";

import { useWaitlist } from "./WaitlistContext";

export function WaitlistCounter({ className = "" }: { className?: string }) {
  const { count } = useWaitlist();

  let label: React.ReactNode;
  if (count === undefined) {
    label = <span className="inline-block h-4 w-40 animate-pulse rounded-full bg-line/80" aria-hidden="true" />;
  } else if (count === null || count === 0) {
    label = <span>The early list is open. Be one of the first.</span>;
  } else {
    label = (
      <span>
        <strong className="font-semibold text-ink tabular-nums">{count.toLocaleString("en-IN")}</strong>{" "}
        {count === 1 ? "student is" : "students are"} already waiting
      </span>
    );
  }

  return (
    <p className={`flex items-center gap-2.5 text-sm text-muted ${className}`} aria-live="polite">
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      {label}
    </p>
  );
}
