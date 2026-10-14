export default function PageIntro({ eyebrow, title, description }) {
  return (
    <div className="min-h-[124px] py-5 sm:min-h-[138px]">
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-olive">
          <span className="h-px w-5 bg-olive/70" />{eyebrow}
        </div>
        <h1 className="text-[25px] leading-snug font-semibold tracking-tight text-ink sm:text-[29px]">{title}</h1>
        <p className="mt-1 max-w-xl text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
