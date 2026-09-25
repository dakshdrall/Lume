import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy · lume",
  description: "What lume collects for its waitlist, why, and how to get it deleted.",
};

export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalLayout title="Privacy Policy" updated="25 September 2026">
      <p>
        lume is an independent student project. It is not affiliated with, endorsed by, or operated by IITM
        Janakpuri or GGSIPU. This page explains, in plain English, what we collect when you join the waitlist and
        what we do with it. We wrote it with India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act) in
        mind.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>We collect your first name, email address and year of study.</li>
        <li>We use them only to tell you when lume launches. Nothing else.</li>
        <li>We never sell or share your data for advertising.</li>
        <li>Email us any time and we&apos;ll delete everything.</li>
        <li>You must be 18 or older to join.</li>
      </ul>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>What you give us:</strong> your first name, email address, year of study, and your confirmations
          that you are 18+ and agree to this policy and our Terms.
        </li>
        <li>
          <strong>When you joined:</strong> the date and time of your signup.
        </li>
        <li>
          <strong>Abuse prevention:</strong> to limit spam signups we store a one-way, salted hash of your IP address
          (not the IP itself) for up to 24 hours. Cloudflare Turnstile, our bot check, processes basic browser and
          device signals to tell people from bots.
        </li>
      </ul>
      <p>
        We do not collect photos, your location, phone number, or any sensitive details on this waitlist. We
        don&apos;t use advertising or tracking cookies.
      </p>

      <h2>Why we collect it</h2>
      <p>
        Only to send you launch updates about lume, and to keep the waitlist free of bots and duplicates. We rely on
        your consent, which you give by ticking the checkbox on the form. We will not use your data for any other
        purpose without asking you first.
      </p>

      <h2>Who else sees it</h2>
      <p>We use a few trusted service providers that process data on our behalf, only to run the waitlist:</p>
      <ul>
        <li>Supabase: database where the waitlist is stored.</li>
        <li>Vercel: website hosting.</li>
        <li>Cloudflare: the Turnstile bot check.</li>
      </ul>
      <p>
        These providers may store data on servers outside India. We don&apos;t sell, rent or trade your data, and we
        don&apos;t share it with IITM Janakpuri, GGSIPU, or anyone else, unless the law requires us to.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your details until lume launches, or until you ask us to delete them, whichever comes first. If you
        don&apos;t go on to create an account, we delete your waitlist entry within 90 days of launch.
      </p>

      <h2>Your rights</h2>
      <p>Under the DPDP Act you can:</p>
      <ul>
        <li>ask what data we hold about you;</li>
        <li>ask us to correct or update it;</li>
        <li>withdraw your consent and ask us to delete it;</li>
        <li>raise a grievance with us, and nominate someone to act for you.</li>
      </ul>
      <p>
        Email {mail} from the address you signed up with. We&apos;ll respond within 7 days and delete your data
        within 7 days of a deletion request. Withdrawing consent is as easy as giving it. If you aren&apos;t
        satisfied with our response, you can complain to the Data Protection Board of India.
      </p>

      <h2>18+ only</h2>
      <p>
        lume is only for adults aged 18 and over. If we learn that someone under 18 has joined the waitlist, we
        will delete their details.
      </p>

      <h2>Security</h2>
      <p>
        Your data is stored in an access-controlled database and is never exposed publicly. Only the project team
        can view it. No system is perfectly secure, but if a breach ever affects your data we will tell you and the
        relevant authorities as the law requires.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy we&apos;ll update the date above, and if the change is significant we&apos;ll email
        you before it takes effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, requests or grievances: {mail}. See also our <Link href="/terms">Terms</Link>.
      </p>
    </LegalLayout>
  );
}
