const tones = {
  green: 'bg-green',
  clay: 'bg-terracotta',
  olive: 'bg-olive',
  neutral: 'bg-ink/30'
};

export default function MetricCard({ tone = 'green', label, value, unit, note }) {
  return (
    <article className="min-w-0 px-3 py-3.5 sm:min-h-[119px] sm:px-5 sm:py-[18px]">
      <span className={'mb-2 block h-[2px] w-5 ' + (tones[tone] || tones.green)} />
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <strong className="tabular truncate text-[22px] leading-snug font-semibold tracking-tight text-ink sm:text-2xl">{value}</strong>
        {unit && <span className="shrink-0 text-xs text-slate-500">{unit}</span>}
      </div>
      <p className="mt-1 truncate text-xs text-slate-600">{note}</p>
    </article>
  );
}
