import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="lume, home"
      className={`inline-flex items-center gap-1.5 font-serif text-[28px] italic leading-none tracking-tight text-ink ${className}`}
    >
      lume
      <span aria-hidden="true" className="glow-dot mb-3 h-1.5 w-1.5" />
    </Link>
  );
}
