import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms · lume",
  description: "The simple rules for joining the lume waitlist.",
};

export default function TermsPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalLayout title="Terms" updated="25 September 2026">
      <p>
        These terms cover the lume website and waitlist. By joining the waitlist you agree to them. They&apos;re
        short, so please read them.
      </p>

      <h2>Who we are</h2>
      <p>
        lume is an independent student project. It is not affiliated with, endorsed by, or operated by IITM
        Janakpuri or GGSIPU. Any mention of IITM Janakpuri only describes who lume is being built for.
      </p>

      <h2>Who can join</h2>
      <ul>
        <li>You must be 18 or older.</li>
        <li>lume is being built for students of IITM Janakpuri, Delhi.</li>
        <li>Only sign up yourself, with your own email address and accurate details.</li>
      </ul>

      <h2>What the waitlist is</h2>
      <p>
        Joining the waitlist means we&apos;ll email you about lume&apos;s launch. It&apos;s free. It doesn&apos;t
        create an account, and it doesn&apos;t guarantee access, a launch date, or any particular feature. Features
        described on this site, including verification, themes and profiles, are plans and may change. The profiles
        shown on this site are fictional samples.
      </p>

      <h2>Fair use</h2>
      <p>Please don&apos;t:</p>
      <ul>
        <li>sign up other people, or use fake or throwaway details;</li>
        <li>use bots or scripts, or try to get around our bot check or rate limits;</li>
        <li>try to access data that isn&apos;t yours or disrupt the website.</li>
      </ul>
      <p>We may remove waitlist entries that break these rules.</p>

      <h2>Your data</h2>
      <p>
        How we handle your details is explained in our <Link href="/privacy">Privacy Policy</Link>. You can leave the
        waitlist and have your data deleted at any time by emailing {mail}.
      </p>

      <h2>Our content</h2>
      <p>
        The lume name, design and text on this site belong to the project team. Please don&apos;t copy them to
        pretend to be us.
      </p>

      <h2>No warranties</h2>
      <p>
        The website is provided &quot;as is&quot;. We do our best to keep it running and accurate, but we can&apos;t
        promise it will always be available or error-free. To the extent the law allows, we aren&apos;t liable for
        any indirect loss arising from your use of the website or waitlist.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. We&apos;ll change the date above, and email you about significant changes. The
        full lume app will have its own terms, which you&apos;ll be asked to accept before creating an account.
      </p>

      <h2>Law</h2>
      <p>These terms are governed by the laws of India, and the courts in New Delhi have jurisdiction.</p>

      <h2>Contact</h2>
      <p>Questions? Email {mail}.</p>
    </LegalLayout>
  );
}
