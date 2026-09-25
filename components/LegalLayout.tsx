import Link from "next/link";
import { Footer } from "./Footer";
import { Wordmark } from "./Wordmark";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="pt-safe border-b border-line/60">
        <div className="container-page flex h-16 items-center justify-between">
          <Wordmark />
          <Link href="/#waitlist" className="btn-ghost h-10 min-h-0 px-4 text-sm">
            Join waitlist
          </Link>
        </div>
      </header>
      <main id="main" className="container-page max-w-2xl py-14">
        <h1 className="font-serif text-[clamp(2.6rem,9vw,4rem)] leading-none text-ink">{title}</h1>
        <p className="mt-4 text-sm text-muted">Last updated: {updated}</p>
        <div className="prose-legal mt-6">{children}</div>
      </main>
      <Footer />
    </>
  );
}
