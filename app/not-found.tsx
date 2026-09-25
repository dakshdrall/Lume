import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export default function NotFound() {
  return (
    <main id="main" className="container-page flex min-h-dvh flex-col items-center justify-center text-center">
      <Wordmark />
      <h1 className="mt-8 font-serif text-5xl text-ink">
        Nothing <em className="italic text-accent">glowing</em> here.
      </h1>
      <Link href="/" className="btn-primary mt-8">
        Back home
      </Link>
    </main>
  );
}
