"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteSignup } from "@/app/admin/actions";
import { YEARS } from "@/lib/validation";

export type Signup = { id: string; name: string; email: string; year: string; created_at: string };

const TZ = "Asia/Kolkata";
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" });
const dateTime = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" });

const DAYS = 30;
const PAGE = 200;

export function Dashboard({ rows: initialRows }: { rows: Signup[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const todayKey = dayKey.format(new Date());
    const todayStart = new Date(`${todayKey}T00:00:00+05:30`).getTime();
    const days = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(todayStart - (DAYS - 1 - i) * 86_400_000 + 3_600_000);
      return { key: dayKey.format(d), label: dayLabel.format(d), count: 0 };
    });
    const byKey = new Map(days.map((d) => [d.key, d]));
    const byYear = new Map<string, number>(YEARS.map((y) => [y, 0]));
    let today = 0;

    for (const r of rows) {
      const k = dayKey.format(new Date(r.created_at));
      if (k === todayKey) today++;
      const d = byKey.get(k);
      if (d) d.count++;
      byYear.set(r.year, (byYear.get(r.year) ?? 0) + 1);
    }
    return { total: rows.length, today, days, byYear: [...byYear.entries()] };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.includes(q) || r.year.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Waitlist dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Total signups" value={stats.total} />
        <Stat label="Signups today (IST)" value={stats.today} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="card p-5 sm:p-6" aria-labelledby="per-day-title">
          <h2 id="per-day-title" className="text-sm font-medium text-muted">
            Signups per day · last {DAYS} days
          </h2>
          <DayChart days={stats.days} />
        </section>
        <section className="card p-5 sm:p-6" aria-labelledby="by-year-title">
          <h2 id="by-year-title" className="text-sm font-medium text-muted">
            By year of study
          </h2>
          <YearBars data={stats.byYear} total={stats.total} />
        </section>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="table-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="table-title" className="text-sm font-medium text-muted">
            Signups <span className="tabular-nums">({filtered.length.toLocaleString("en-IN")})</span>
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="search" className="sr-only">
              Search signups
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search name, email, year"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field py-2 sm:w-72"
            />
            <button type="button" className="btn-ghost" onClick={() => downloadCsv(filtered)} disabled={!filtered.length}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="-mx-5 mt-5 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th scope="col" className="px-5 py-2 font-medium sm:px-3">Name</th>
                <th scope="col" className="px-3 py-2 font-medium">Email</th>
                <th scope="col" className="px-3 py-2 font-medium">Year</th>
                <th scope="col" className="px-3 py-2 font-medium">Joined (IST)</th>
                <th scope="col" className="px-3 py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, PAGE).map((r) => (
                <Row key={r.id} row={r} onDeleted={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} />
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted">
                    No signups{query ? " match that search" : " yet"}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length > PAGE && (
            <p className="mt-3 px-5 text-xs text-muted sm:px-3">
              Showing the latest {PAGE}. Search to narrow down, or export CSV for everything.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5 sm:p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-serif text-5xl tabular-nums text-ink">{value.toLocaleString("en-IN")}</p>
    </div>
  );
}

function DayChart({ days }: { days: { key: string; label: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const W = 600;
  const H = 180;
  const gap = 2;
  const bw = W / days.length - gap;
  const active = hover !== null ? days[hover] : null;
  const total = days.reduce((s, d) => s + d.count, 0);

  return (
    <div className="mt-4">
      <p className="h-5 text-sm text-ink" aria-live="polite">
        {active ? (
          <>
            <span className="text-muted">{active.label}:</span>{" "}
            <strong className="tabular-nums">{active.count}</strong> signup{active.count === 1 ? "" : "s"}
          </>
        ) : (
          <span className="text-muted">
            <strong className="tabular-nums text-ink">{total}</strong> in the last {days.length} days · peak {max}/day
          </span>
        )}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={`Bar chart of signups per day. ${total} signups over the last ${days.length} days, peak of ${max} in a day.`}
        onMouseLeave={() => setHover(null)}
      >
        <line x1={0} x2={W} y1={H} y2={H} stroke="rgb(var(--line))" strokeWidth={1} />
        {days.map((d, i) => {
          const h = d.count === 0 ? 0 : Math.max(3, (d.count / max) * (H - 8));
          const x = i * (bw + gap);
          const r = Math.min(4, bw / 2, h);
          return (
            <g key={d.key} onMouseEnter={() => setHover(i)}>
              {/* full-height hit target, larger than the mark */}
              <rect x={x} y={0} width={bw + gap} height={H} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${H} V${H - h + r} Q${x},${H - h} ${x + r},${H - h} H${x + bw - r} Q${x + bw},${H - h} ${x + bw},${H - h + r} V${H} Z`}
                  fill="rgb(var(--accent))"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
            </g>
          );
        })}
        <text x={0} y={H + 16} fontSize={12} fill="rgb(var(--muted))">
          {days[0]?.label}
        </text>
        <text x={W} y={H + 16} fontSize={12} fill="rgb(var(--muted))" textAnchor="end">
          Today
        </text>
      </svg>
    </div>
  );
}

function YearBars({ data, total }: { data: [string, number][]; total: number }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <ul className="mt-4 flex flex-col gap-4">
      {data.map(([year, n]) => (
        <li key={year}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-ink">{year}</span>
            <span className="tabular-nums text-muted">
              {n.toLocaleString("en-IN")}
              {total > 0 && <span className="ml-1.5 text-xs">({Math.round((n / total) * 100)}%)</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-line/60" aria-hidden="true">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Row({ row, onDeleted }: { row: Signup; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <tr className="border-b border-line/60 last:border-0">
      <td className="px-5 py-3 text-ink sm:px-3">{row.name}</td>
      <td className="px-3 py-3 text-ink">{row.email}</td>
      <td className="px-3 py-3 text-muted">{row.year}</td>
      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted">{dateTime.format(new Date(row.created_at))}</td>
      <td className="whitespace-nowrap px-3 py-3 text-right">
        {confirming ? (
          <span className="inline-flex items-center gap-2">
            <span className="text-xs text-muted">{failed ? "Failed. Retry?" : "Delete permanently?"}</span>
            <button
              type="button"
              className="rounded-full bg-[#B42318] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await deleteSignup(row.id);
                  if (res.ok) onDeleted();
                  else setFailed(true);
                })
              }
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              className="rounded-full border border-line px-3 py-1.5 text-xs text-muted"
              onClick={() => {
                setConfirming(false);
                setFailed(false);
              }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-[#B42318] hover:text-[#B42318]"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${row.name} (${row.email})`}
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

function csvCell(v: string): string {
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: Signup[]) {
  const header = ["name", "email", "year", "joined_at"].join(",");
  const lines = rows.map((r) => [r.name, r.email, r.year, r.created_at].map(csvCell).join(","));
  const blob = new Blob([[header, ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lume-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
