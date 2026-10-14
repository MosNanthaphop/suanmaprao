import Icon from './Icon.jsx';

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={'fixed right-3 bottom-[78px] z-50 flex max-w-[calc(100%-24px)] items-center gap-2 rounded-md border px-4 py-3 text-sm shadow-md transition sm:right-6 sm:bottom-6 ' +
        (toast.type === 'error' ? 'border-red-100 bg-red-50 text-red-800' : 'border-green/15 bg-white text-green-dark')}
    >
      <Icon name={toast.type === 'error' ? 'close' : 'check'} className="size-4" />
      {toast.message}
    </div>
  );
}
