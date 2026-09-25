import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { CONTACT_EMAIL, DISCLAIMER } from "@/lib/site";

export function Footer() {
  return (
    <footer className="pb-safe relative mt-24 border-t border-line/70 bg-bg">
      <div className="container-page flex flex-col gap-6 pt-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-muted">{DISCLAIMER}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href="/privacy" className="text-muted underline-offset-4 hover:text-ink hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted underline-offset-4 hover:text-ink hover:underline">
            Terms
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </nav>
      </div>
      <p className="container-page mt-8 text-xs text-muted">© {new Date().getFullYear()} lume</p>
    </footer>
  );
}
