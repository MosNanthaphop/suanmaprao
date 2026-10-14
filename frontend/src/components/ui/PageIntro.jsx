export default function PageIntro({ eyebrow, title, description }) {
  return (
    <div className="min-h-[124px] py-5 sm:min-h-[138px]">
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-olive">
          <span className="h-px w-5 bg-olive/70" />{eyebrow}
        </div>
        <h1 className="text-[27px] leading-snug font-semibold tracking-tight text-ink sm:text-[32px]">{title}</h1>
        <p className="mt-1 max-w-xl text-[13px] text-slate-600">{description}</p>
      </div>
    </div>
  );
}
