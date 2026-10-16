import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

const items = [
  { id: 'overview', label: 'ภาพรวม', shortLabel: 'ภาพรวม', icon: 'home' },
  { id: 'history', label: 'ประวัติการตัด', shortLabel: 'ประวัติ', icon: 'history' },
  { id: 'settings', label: 'ตั้งค่าสวน', shortLabel: 'ตั้งค่า', icon: 'settings' }
];

function NavItem({ item, activeView, onChange, count, mobile = false }) {
  const active = activeView === item.id;
  if (mobile) {
    return (
      <button
        className={'grid justify-items-center gap-0.5 rounded-md px-2 py-1.5 transition ' + (active ? 'font-bold text-green' : 'text-slate-400')}
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => onChange(item.id)}
      >
        <Icon name={item.icon} className="size-5" />
        <span className="text-xs">{item.shortLabel}</span>
      </button>
    );
  }

  return (
    <button
      className={'group relative flex min-h-12 w-full items-center justify-center gap-3 rounded-md px-3 text-left transition xl:justify-start ' +
        (active ? 'bg-green/10 font-bold text-green-dark before:absolute before:-left-[18px] before:top-3 before:bottom-3 before:w-[3px] before:rounded-r before:bg-green/70' : 'text-slate-500 hover:bg-green/5 hover:text-green')}
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => onChange(item.id)}
      title={item.label}
    >
      <Icon name={item.icon} className="size-5" />
      <span className="hidden text-xs xl:block">{item.label}</span>
      {item.id === 'history' && (
        <span className={'hidden min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs xl:ml-auto xl:inline-block ' + (active ? 'bg-green/10 text-green' : 'bg-slate-100 text-slate-500')}>
          {count}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ activeView, onChange, count }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[76px] flex-col border-r border-line bg-white/80 px-3 py-6 md:flex xl:w-[246px] xl:px-[18px]">
      <div className="mb-10 flex items-center justify-center gap-3 xl:mb-[54px] xl:justify-start xl:px-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-green text-white">
          <Icon name="coconut" className="size-6" />
        </span>
        <span className="hidden min-w-0 xl:grid">
          <strong className="text-lg leading-snug tracking-tight text-ink">สวนสุรชัย</strong>
          <small className="text-xs text-slate-500">บันทึกของบ้านเรา</small>
        </span>
      </div>
      <span className="mb-2 hidden px-3 text-xs font-bold tracking-[1.2px] text-slate-500 xl:block">เมนูหลัก</span>
      <nav className="grid gap-1.5" aria-label="เมนูหลัก">
        {items.map((item) => <NavItem key={item.id} {...{ item, activeView, onChange, count }} />)}
      </nav>
      <div className="mt-auto hidden xl:block">
        <div className="flex items-center gap-2.5 border-t border-line py-3">
          <span className="size-1.5 shrink-0 rounded-full bg-green/70" />
          <span className="grid">
            <strong className="text-xs font-medium text-ink">บันทึกอัตโนมัติ</strong>
            <small className="text-xs text-slate-600">ข้อมูลของสวนนี้</small>
          </span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ activeView, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid min-h-[66px] grid-cols-3 border-t border-line bg-white/95 px-3 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur md:hidden" aria-label="เมนูหลัก">
      {items.map((item) => <NavItem key={item.id} {...{ item, activeView, onChange }} mobile />)}
    </nav>
  );
}

export function TopBar({ date, onAdd }) {
  return (
    <header className="flex min-h-[70px] items-center justify-between border-b border-line sm:min-h-[83px]">
      <div className="grid gap-0.5 text-sm text-slate-600">
        <span className="text-xs text-slate-600">จัดการสวน · บ้านเรา</span>
        <span>{date}</span>
      </div>
      <Button icon="plus" onClick={onAdd} className="min-h-10 px-3 sm:px-4">
        บันทึกรอบตัด
      </Button>
    </header>
  );
}

