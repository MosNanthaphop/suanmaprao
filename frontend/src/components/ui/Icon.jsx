const symbols = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /><path d="M9 21v-7h6v7" /></>,
  history: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.73 1.73-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.45v-.18a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06-1.73-1.73.06-.06A1.7 1.7 0 0 0 8.37 15a1.7 1.7 0 0 0-1.56-1.03H6.6v-2.45h.21A1.7 1.7 0 0 0 8.37 10a1.7 1.7 0 0 0-.34-1.87l-.06-.06L9.7 6.34l.06.06a1.7 1.7 0 0 0 1.87.34 1.7 1.7 0 0 0 1.03-1.56V5h2.45v.18a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06 1.73 1.73-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.56 1.03h.21v2.45h-.21A1.7 1.7 0 0 0 19.4 15Z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" /><path d="M4 21c3-6 7-9 13-12" /></>,
  coconut: <><path d="M12 21c5.6 0 9-3.6 9-8.1S17.8 4 12 4 3 8.4 3 12.9 6.4 21 12 21Z" /><path d="M8 5.3c-.7-1.5-2.2-2.5-4-2.3 0 1.6.8 2.9 2.3 3.6M12 4c.2-1.7 1.3-3.1 3-3.7.7 1.5.4 3.1-.7 4.4M16.5 5.2c1-1.4 2.8-2 4.4-1.5-.3 1.6-1.4 2.7-3 3" /></>,
  coins: <><ellipse cx="9" cy="6" rx="6" ry="3" /><path d="M3 6v5c0 1.7 2.7 3 6 3 1.1 0 2.1-.2 3-.4M3 11v5c0 1.7 2.7 3 6 3 1 0 2-.1 2.8-.4" /><ellipse cx="17" cy="14" rx="4" ry="2" /><path d="M13 14v5c0 1.1 1.8 2 4 2s4-.9 4-2v-5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  check: <path d="m5 12 4 4L19 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 15 1.1 2.9L23 19l-2.9 1.1L19 23l-1.1-2.9L15 19l2.9-1.1L19 15Z" /></>
};

export function IconSprite() {
  return (
    <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
      {Object.entries(symbols).map(([name, paths]) => (
        <symbol id={'icon-' + name} key={name} viewBox="0 0 24 24">{paths}</symbol>
      ))}
    </svg>
  );
}

export default function Icon({ name, className = 'size-5', ...props }) {
  return (
    <svg className={'shrink-0 fill-none stroke-current stroke-[1.7] ' + className} aria-hidden="true" {...props}>
      <use href={'#icon-' + name} />
    </svg>
  );
}
