"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import type { Profile, ProfileTheme } from "./profiles";
import {
  BookIcon,
  CalendarIcon,
  ChatIcon,
  CheckBadgeIcon,
  HeartIcon,
  PinIcon,
  RulerIcon,
  XIcon,
} from "./Icons";

type Props = { profile: Profile; theme: ProfileTheme };

export function ProfileCard({ profile, theme }: Props) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [passed, setPassed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => setLiked((l) => ({ ...l, [id]: !l[id] }));

  const onPass = () => {
    setLiked({});
    setPassed(true);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => setPassed(false), 2200);
  };

  const chips = [
    { icon: BookIcon, text: profile.course },
    { icon: CalendarIcon, text: profile.year },
    { icon: PinIcon, text: profile.hometown },
    ...(profile.height ? [{ icon: RulerIcon, text: profile.height }] : []),
    { icon: ChatIcon, text: profile.languages },
  ];

  const [p1, p2, p3] = profile.prompts;

  return (
    <div
      className="relative w-full max-w-[360px] overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
      style={{ background: theme.card, color: theme.ink }}
    >
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label={`Sample profile: ${profile.name}, ${profile.age}. Scroll to see more.`}
        className="no-scrollbar relative h-[min(600px,72vh)] overflow-y-auto overscroll-contain px-3.5 pb-24 pt-3.5 focus-visible:outline-offset-[-4px]"
      >
        <Photo
          colors={profile.photos[0]}
          initial={profile.name[0]}
          theme={theme}
          verified
          liked={!!liked.photo1}
          onLike={() => toggle("photo1")}
          label={`Like ${profile.name}'s first photo`}
        />

        <div className="px-1.5 pt-5">
          <h3 className="font-serif text-[34px] leading-none">
            {profile.name}, <span className="tabular-nums">{profile.age}</span>
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Details">
            {chips.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium"
                style={{ background: theme.chips, color: theme.sub }}
              >
                <Icon className="h-3.5 w-3.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <PromptBlock prompt={p1} theme={theme} liked={!!liked.p1} onLike={() => toggle("p1")} />

        <Photo
          colors={profile.photos[1]}
          theme={theme}
          liked={!!liked.photo2}
          onLike={() => toggle("photo2")}
          label={`Like ${profile.name}'s second photo`}
          className="mt-3"
        />

        <PromptBlock prompt={p2} theme={theme} liked={!!liked.p2} onLike={() => toggle("p2")} />

        <div className="mt-3 rounded-[22px] p-5" style={{ background: theme.chips }}>
          <p className="text-[13px] font-medium" style={{ color: theme.sub }}>
            Interests
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.interests.map((it) => (
              <li
                key={it}
                className="rounded-full border px-3 py-1.5 text-[13px]"
                style={{ borderColor: `${theme.accent}40`, background: theme.card, color: theme.ink }}
              >
                {it}
              </li>
            ))}
          </ul>
        </div>

        <PromptBlock prompt={p3} theme={theme} liked={!!liked.p3} onLike={() => toggle("p3")} />

        <p className="mt-6 text-center text-xs" style={{ color: theme.sub }}>
          Sample profile · fictional person
        </p>
      </div>

      {/* Pass button, pinned to the bottom like the real app */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        <button
          type="button"
          onClick={onPass}
          aria-label={`Pass on ${profile.name}`}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ background: theme.card, color: theme.ink, border: `1px solid ${theme.chips}` }}
        >
          <XIcon className="h-6 w-6" />
        </button>
        <AnimatePresence>
          {passed && (
            <m.p
              role="status"
              className="rounded-full px-3 py-1.5 text-xs font-medium shadow"
              style={{ background: theme.ink, color: theme.card }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              Passed. It&apos;s only a preview!
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LikeButton({
  liked,
  onClick,
  label,
  theme,
}: {
  liked: boolean;
  onClick: () => void;
  label: string;
  theme: ProfileTheme;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-90"
      style={{ background: theme.card, color: theme.accent }}
    >
      <m.span
        key={String(liked)}
        initial={{ scale: liked ? 0.6 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <HeartIcon className="h-5 w-5" filled={liked} />
      </m.span>
    </button>
  );
}

function Photo({
  colors,
  initial,
  theme,
  verified,
  liked,
  onLike,
  label,
  className = "",
}: {
  colors: [string, string];
  initial?: string;
  theme: ProfileTheme;
  verified?: boolean;
  liked: boolean;
  onLike: () => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-[22px] ${className}`}>
      <div
        role="img"
        aria-label="Photo placeholder"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 20% 10%, ${colors[1]} 0%, transparent 60%), linear-gradient(160deg, ${colors[0]}, ${colors[1]})`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -right-12 h-64 w-64 opacity-50"
        style={{ background: `radial-gradient(closest-side, ${theme.accent}, transparent)` }}
      />
      {initial && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-serif text-[120px] italic leading-none"
          style={{ color: `${theme.card}E6` }}
        >
          {initial}
        </span>
      )}
      <div className="scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
      {verified && (
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: theme.card, color: theme.accent }}
        >
          <CheckBadgeIcon className="h-4 w-4" />
          Verified
        </span>
      )}
      <div className="absolute bottom-3 right-3">
        <LikeButton liked={liked} onClick={onLike} label={label} theme={theme} />
      </div>
    </div>
  );
}

function PromptBlock({
  prompt,
  theme,
  liked,
  onLike,
}: {
  prompt: { label: string; answer: string };
  theme: ProfileTheme;
  liked: boolean;
  onLike: () => void;
}) {
  return (
    <div className="relative mt-3 rounded-[22px] p-5 pb-16" style={{ background: theme.chips }}>
      <p className="text-[13px] font-medium" style={{ color: theme.sub }}>
        {prompt.label}
      </p>
      <p className="mt-2 font-serif text-[26px] leading-[1.15]">{prompt.answer}</p>
      <div className="absolute bottom-3 right-3">
        <LikeButton liked={liked} onClick={onLike} label={`Like answer: ${prompt.label}`} theme={theme} />
      </div>
    </div>
  );
}
