import { forwardRef } from 'react';

export function FormField({ label, hint, required = false, children, className = '' }) {
  return (
    <label className={'grid gap-2 text-sm font-semibold text-slate-600 ' + className}>
      <span>{label}{required && <i className="ml-1 text-terracotta not-italic">*</i>}</span>
      {children}
      {hint && <small className="text-xs leading-relaxed font-normal text-slate-500">{hint}</small>}
    </label>
  );
}

export const UnitInput = forwardRef(function UnitInput({ unit, className = '', ...props }, ref) {
  return (
    <span className={'flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-3 transition focus-within:border-green/50 focus-within:ring-4 focus-within:ring-green/10 ' + className}>
      <input ref={ref} className="min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-slate-400" {...props} />
      <span className="shrink-0 text-xs font-normal text-slate-500">{unit}</span>
    </span>
  );
});
