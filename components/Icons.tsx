import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ShieldCheckIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const IdCardIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M15 10h3M15 13h3" />
  </Base>
);

export const LockIcon = (p: P) => (
  <Base {...p}>
    <rect x="5" y="10" width="14" height="10" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <path d="M12 14v2" />
  </Base>
);

export const HeartsIcon = (p: P) => (
  <Base {...p}>
    <path d="M9.5 18.5S3 14.6 3 10.2A3.2 3.2 0 0 1 9.5 9a3.2 3.2 0 0 1 6.5 1.2c0 .7-.2 1.4-.5 2" />
    <path d="M17 21s-4-2.4-4-5.1a2 2 0 0 1 4-.7 2 2 0 0 1 4 .7c0 2.7-4 5.1-4 5.1Z" />
  </Base>
);

export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.35-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.65 12 20 12 20Z" />
  </Base>
);

export const XIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const CheckBadgeIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 3l2.1 1.6 2.6-.2.9 2.5 2.3 1.3-.6 2.6 1.1 2.4-2 1.7-.3 2.6-2.6.4L14 21l-2-1.4L10 21l-1.5-2.1-2.6-.4-.3-2.6-2-1.7 1.1-2.4-.6-2.6 2.3-1.3.9-2.5 2.6.2L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const BookIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
  </Base>
);

export const CalendarIcon = (p: P) => (
  <Base {...p}>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </Base>
);

export const PinIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11Z" />
    <circle cx="12" cy="10" r="2.2" />
  </Base>
);

export const RulerIcon = (p: P) => (
  <Base {...p}>
    <path d="M9 3v18M9 7h3M9 11h2M9 15h3M9 19h2" />
    <rect x="6" y="3" width="6" height="18" rx="1.5" />
  </Base>
);

export const ChatIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5Z" />
  </Base>
);

export const ArrowRightIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);
