import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-line/60 bg-bg">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Wordmark />
          <span className="pill hidden md:inline-flex">Unofficial · for IITM Janakpuri students</span>
        </div>
        <a href="#waitlist" className="btn-primary h-10 min-h-0 px-4 text-sm">
          Join waitlist
        </a>
      </div>
    </header>
  );
}
