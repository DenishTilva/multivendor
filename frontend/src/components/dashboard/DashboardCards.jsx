const cx = (...classes) => classes.filter(Boolean).join(" ");

export function StatCard({ label, value, subvalue, tone = "slate" }) {
  const tones = {
    slate: {
      chip: "bg-slate-900 text-white",
      ring: "ring-slate-200/70",
    },
    sky: {
      chip: "bg-sky-600 text-white",
      ring: "ring-sky-200/60",
    },
    emerald: {
      chip: "bg-emerald-600 text-white",
      ring: "ring-emerald-200/60",
    },
    violet: {
      chip: "bg-violet-600 text-white",
      ring: "ring-violet-200/60",
    },
    rose: {
      chip: "bg-rose-600 text-white",
      ring: "ring-rose-200/60",
    },
  };

  const t = tones[tone] || tones.slate;

  return (
    <div className={cx("rounded-2xl bg-white p-4 shadow-sm ring-1", t.ring)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          {subvalue ? (
            <div className="mt-1 truncate text-sm text-slate-500">{subvalue}</div>
          ) : null}
        </div>
        <div className={cx("shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold", t.chip)}>
          Live
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {title}
          </div>
          {subtitle ? (
            <div className="mt-1 truncate text-sm text-slate-500">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-6 text-center">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-slate-500">{subtitle}</div> : null}
    </div>
  );
}

