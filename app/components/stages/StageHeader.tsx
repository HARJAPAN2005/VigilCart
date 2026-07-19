'use client';

/** Consistent per-stage header: quiet act marker, display-face title, one human line. */
export default function StageHeader({
  eyebrow,
  title,
  blurb,
  action,
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11.5px] font-medium text-dim">{eyebrow}</p>
        <h2 className="font-display mt-1.5 text-[26px] font-semibold tracking-tight text-white">
          {title}
        </h2>
        {blurb && <p className="mt-2.5 max-w-2xl text-[13.5px] leading-6 text-muted">{blurb}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
