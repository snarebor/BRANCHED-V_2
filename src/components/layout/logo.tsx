export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="6" cy="16" r="3" className="fill-branch-500" />
      <circle cx="26" cy="7" r="3" className="fill-amber-500" />
      <circle cx="26" cy="25" r="3" className="fill-amber-500" />
      <path
        d="M9 16C15 16 15 16 17.5 12.5C19.5 9.7 21 8 23.5 7.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-branch-500"
      />
      <path
        d="M9 16C15 16 15 16 17.5 19.5C19.5 22.3 21 24 23.5 24.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-branch-500"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark className="h-7 w-7" />
      <span className="font-display text-xl font-semibold tracking-tight text-branch-900">Branched</span>
    </span>
  );
}
