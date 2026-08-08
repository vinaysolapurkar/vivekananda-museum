// Line icons for the museum design system. Stroke inherits currentColor.
const PATHS: Record<string, React.ReactNode> = {
  headphones: (
    <>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3Z" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m3 17 5-5 4 4 3.5-3.5L21 18" />
    </>
  ),
  lotus: (
    <>
      <path d="M12 20c-2.5-1.4-4-3.8-4-6.5C8 10 9.6 7 12 4.5 14.4 7 16 10 16 13.5c0 2.7-1.5 5.1-4 6.5Z" />
      <path d="M12 20c-3.8.4-6.8-1-8.5-3.6 2-1 4-1.3 5.8-.9M12 20c3.8.4 6.8-1 8.5-3.6-2-1-4-1.3-5.8-.9" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4Z" />
      <path d="M6 4a2 2 0 0 0-2 2v2h4" />
      <path d="M10 9h5M10 13h5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.7 2.7 4 5.9 4 9s-1.3 6.3-4 9c-2.7-2.7-4-5.9-4-9s1.3-6.3 4-9Z" />
    </>
  ),
  temple: (
    <>
      <path d="M4 20h16M5 20v-7h14v7M3 13h18l-9-6-9 6Z" />
      <path d="M12 4v3M10 20v-4h4v4" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M19 12H5m6 6-6-6 6-6" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  award: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  letter: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6.5 8 6 8-6" />
    </>
  ),
};

export type MuseumIconName = keyof typeof PATHS;

export default function MuseumIcon({
  name,
  size = 24,
  strokeWidth = 1.6,
  className,
  style,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {PATHS[name] ?? <circle cx="12" cy="12" r="9" />}
    </svg>
  );
}
