import type { Metadata } from "next";
import { Wordmark } from "@/components/Wordmark";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { Dashboard, type Signup } from "@/components/admin/Dashboard";
import { getAuthClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { isAllowedAdmin } from "@/lib/admin";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · lume", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: { error?: string } }) {
  const auth = getAuthClient();
  const db = getAdminClient();

  if (!auth || !db) {
    return (
      <Shell>
        <p className="text-muted">
          Supabase isn&apos;t configured. Set the environment variables from <code>.env.example</code>.
        </p>
      </Shell>
    );
  }

  const { data } = await auth.auth.getUser();
  const email = data.user?.email ?? null;

  if (!email) {
    return (
      <Shell>
        <AdminLogin linkError={searchParams.error === "link"} />
      </Shell>
    );
  }

  if (!isAllowedAdmin(email)) {
    return (
      <Shell>
        <p className="text-muted">
          <strong className="text-ink">{email}</strong> isn&apos;t on the admin list.
        </p>
        <form action={signOut} className="mt-6">
          <button className="btn-ghost">Sign out</button>
        </form>
      </Shell>
    );
  }

  const { data: rows, error } = await db
    .from("waitlist")
    .select("id, name, email, year, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  return (
    <Shell wide email={email}>
      {error ? (
        <p role="alert" className="text-muted">
          Couldn&apos;t load signups: {error.message}
        </p>
      ) : (
        <Dashboard rows={(rows ?? []) as Signup[]} />
      )}
    </Shell>
  );
}

function Shell({ children, wide, email }: { children: React.ReactNode; wide?: boolean; email?: string }) {
  return (
    <div className="pb-safe min-h-dvh">
      <header className="pt-safe border-b border-line/70 bg-surface/60">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="pill">admin</span>
          </div>
          {email && (
            <form action={signOut} className="flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">{email}</span>
              <button className="btn-ghost h-9 min-h-0 px-4 text-sm">Sign out</button>
            </form>
          )}
        </div>
      </header>
      <main id="main" className={`container-page py-10 ${wide ? "" : "max-w-md"}`}>
        {children}
      </main>
    </div>
  );
}
