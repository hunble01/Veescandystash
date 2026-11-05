import { accentClasses } from "@/lib/format";
import type { Accent } from "@/lib/types";

// Stand-in frame until real product photography exists (brief §6, §16).
// Deliberately reads as "photo goes here", not as a finished product shot.
export function PhotoPlaceholder({
  accent = "orange",
  label = "Photo coming soon",
  className = "aspect-[4/3]",
  children,
}: {
  accent?: Accent;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const a = accentClasses[accent];
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex items-center justify-center overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] ${a.soft} ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(-45deg, ${a.dot}1f 0 14px, transparent 14px 28px)`,
      }}
    >
      {children}
      <span className="absolute bottom-3 left-3 rounded-full border-2 border-ink/15 bg-white/90 px-3 py-1 text-[11px] font-bold tracking-wide text-ink-soft uppercase">
        {label}
      </span>
    </div>
  );
}
