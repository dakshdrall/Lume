"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type WaitlistState = {
  /** null = unknown/unavailable, undefined = still loading */
  count: number | null | undefined;
  increment: () => void;
};

const WaitlistContext = createContext<WaitlistState>({ count: undefined, increment: () => {} });

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/count", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { count?: number | null } | null) => {
        setCount(typeof data?.count === "number" ? data.count : null);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setCount(null);
      });
    return () => ctrl.abort();
  }, []);

  const increment = useCallback(() => {
    setCount((c) => (typeof c === "number" ? c + 1 : c));
  }, []);

  return <WaitlistContext.Provider value={{ count, increment }}>{children}</WaitlistContext.Provider>;
}

export const useWaitlist = () => useContext(WaitlistContext);
