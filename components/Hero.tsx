import { WaitlistCounter } from "./WaitlistCounter";
import { ArrowRightIcon } from "./Icons";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="container-page overflow-x-clip pb-16 pt-14 sm:pb-24 sm:pt-24">
      <div className="text-halo relative mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Soft halo in the page colour keeps the headline crisp over the floating hearts. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[50%] bg-[radial-gradient(ellipse_closest-side,rgb(var(--bg)/0.94)_0%,rgb(var(--bg)/0.88)_65%,transparent_100%)]"
        />
        <span className="pill rise">
          <span className="glow-dot h-1.5 w-1.5" aria-hidden="true" />
          Coming soon to IITM Janakpuri
        </span>

        {/* Headline animates transform only, so it's painted immediately (good for LCP). */}
        <h1
          id="hero-title"
          className="rise-y mt-7 font-serif text-[clamp(3.1rem,13vw,7.5rem)] leading-[0.95] tracking-[-0.02em] text-ink"
        >
          Find your glow
          <br />
          <em className="italic text-accent">on campus.</em>
        </h1>

        <p className="rise mt-7 max-w-xl text-[17px] leading-relaxed text-muted [animation-delay:100ms] sm:text-lg">
          A verified, private dating space made only for IITM Janakpuri students. Real people, real profiles,
          and none of the noise.
        </p>

        <div className="rise mt-9 flex flex-col items-center gap-5 [animation-delay:200ms]">
          <a href="#waitlist" className="btn-primary h-12 px-7 text-base shadow-[0_8px_30px_-12px_rgb(var(--accent)/0.6)]">
            Join the waitlist
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          <WaitlistCounter />
        </div>
      </div>
    </section>
  );
}
