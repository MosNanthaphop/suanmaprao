import Icon from '../components/ui/Icon.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import PageIntro from '../components/ui/PageIntro.jsx';
import { dayDifference, dateFromString, formatDate, formatMoney, formatNumber, getTotal, localDateString, sortHarvests } from '../lib/formatters.js';

function RevenueChart({ harvests, year }) {
  const totals = Array.from({ length: 12 }, () => 0);
  harvests.forEach((harvest) => {
    const date = dateFromString(harvest.date);
    if (date.getFullYear() === year) totals[date.getMonth()] += getTotal(harvest);
  });
  const max = Math.max(...totals, 1);
  const hasData = totals.some((amount) => amount > 0);
  const months = Array.from({ length: 12 }, (_, index) => {
    const label = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'short' }).format(new Date(year, index, 1, 12));
    const amount = totals[index];
    const height = amount ? Math.max(12, (amount / max) * 100) : 3;
    return (
      <div className="group relative z-0 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" key={index}>
        <div className="flex h-full w-full flex-1 items-end justify-center">
          <span
            className={'w-[min(15px,58%)] transition-colors group-hover:bg-terracotta ' + (amount ? 'bg-green/80' : 'bg-green/10')}
            style={{ height: height + '%' }}
            title={label + ' ' + formatMoney(amount)}
          />
        </div>
        <span className="whitespace-nowrap text-xs text-slate-500">{label}</span>
      </div>
    );
  });

  return (
    <section className="min-w-0 border-y border-line bg-paper px-3.5 py-4 sm:min-h-[295px] sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink sm:text-lg">รายรับแต่ละเดือน</h2>
          <span className="text-xs text-slate-500">แสดงเป็นบาท</span>
        </div>
        <span className="text-xs font-medium text-slate-500">พ.ศ. {year + 543}</span>
      </div>
      <div className="relative mt-4 h-[166px] sm:mt-[17px] sm:h-[188px]">
        <div className="chart-grid absolute inset-0 flex items-end justify-between gap-1 px-1 pb-0.5">
          {months}
        </div>
        {!hasData && (
          <p className="pointer-events-none absolute inset-x-0 top-[42%] text-center text-xs text-slate-500">ยังไม่มีรายรับในปีนี้</p>
        )}
      </div>
    </section>
  );
}

function ForecastCard({ harvests, cycleDays }) {
  const sorted = sortHarvests(harvests);
  if (!sorted.length) {
    return (
      <section className="min-h-[255px] border-y border-line border-l-[3px] border-l-green bg-sand px-5 py-5 sm:min-h-[295px] sm:px-[22px]">
        <div className="flex min-h-[215px] flex-col justify-center sm:min-h-[250px]">
          <div className="text-xs font-medium text-olive">รอบถัดไป</div>
          <h2 className="mt-4 text-[17px] font-semibold text-ink">เริ่มจากบันทึกรอบแรก</h2>
          <p className="mt-1 max-w-[250px] text-xs leading-relaxed text-slate-600">ใช้ปุ่ม “บันทึกรอบตัด” ด้านบนเพื่อเริ่มคำนวณวันตัดครั้งถัดไป</p>
        </div>
      </section>
    );
  }

  const latest = sorted[0];
  const lastDate = dateFromString(latest.date);
  const dueDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + cycleDays, 12);
  const dueString = localDateString(dueDate);
  const remaining = dayDifference(localDateString(), dueString);
  const elapsed = cycleDays - remaining;
  const progress = Math.max(0, Math.min(100, (elapsed / cycleDays) * 100));
  const status = remaining > 1
    ? 'เหลืออีก ' + formatNumber(remaining) + ' วันถึงรอบตัด'
    : remaining === 1
      ? 'พรุ่งนี้ถึงกำหนดรอบตัด'
      : remaining === 0
        ? 'ถึงกำหนดรอบตัดวันนี้'
        : 'เลยกำหนด ' + formatNumber(Math.abs(remaining)) + ' วัน';

  return (
    <section className="min-h-[255px] border-y border-line border-l-[3px] border-l-green bg-sand px-5 py-5 sm:min-h-[295px] sm:px-[22px]">
      <div>
        <div className="text-xs font-medium text-olive">รอบถัดไป</div>
        <p className="mt-5 text-xs text-slate-600">คาดว่าตัดครั้งต่อไป</p>
        <h2 className="tabular mt-0.5 text-[27px] leading-relaxed font-semibold tracking-tight text-ink sm:text-[30px]">{formatDate(dueString, { year: '2-digit' })}</h2>
        <p className="mt-1 text-sm text-slate-600">{status}</p>
        <div className="mt-5 h-1 overflow-hidden bg-green/15" role="progressbar" aria-label="ความคืบหน้าของรอบตัด" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
          <span className="block h-full bg-green transition-all" style={{ width: progress + '%' }} />
        </div>
        <div className="mt-2 flex justify-between gap-3 text-xs text-slate-600">
          <span>ตัดล่าสุด <strong className="font-medium text-ink">{formatDate(latest.date, { day: 'numeric', month: 'short' })}</strong></span>
          <span>รอบละ <strong className="font-medium text-ink">{formatNumber(cycleDays)} วัน</strong></span>
        </div>
      </div>
    </section>
  );
}

function RecentList({ harvests, onShowHistory }) {
  const items = sortHarvests(harvests).slice(0, 4);
  return (
    <section className="mt-5 border-y border-line bg-paper px-3.5 pt-4 pb-2 sm:mt-6 sm:px-5 sm:pt-5">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink sm:text-lg">รอบตัดที่ผ่านมา</h2>
        </div>
        <button className="flex min-h-9 items-center gap-1 text-xs font-semibold text-green/75 hover:text-green" type="button" onClick={onShowHistory}>
          ดูประวัติทั้งหมด <Icon name="arrow" className="size-3.5" />
        </button>
      </div>
      {!items.length ? (
        <div className="flex min-h-[90px] items-center justify-center border-t border-line/70 text-center text-xs text-slate-500">
          บันทึกรอบตัดแรก แล้วข้อมูลล่าสุดจะแสดงตรงนี้
        </div>
      ) : items.map((harvest) => (
        <div className="grid min-h-[62px] grid-cols-[minmax(0,1.3fr)_minmax(60px,.7fr)_minmax(76px,.7fr)] items-center gap-2 border-t border-line/70 sm:grid-cols-[minmax(0,1.3fr)_minmax(100px,.8fr)_minmax(90px,.7fr)] sm:gap-4" key={harvest.id}>
          <div className="min-w-0">
            <span className="grid min-w-0">
              <strong className="truncate text-xs font-semibold text-slate-700 sm:text-sm">{formatDate(harvest.date)}</strong>
              <small className="truncate text-xs text-slate-500">{harvest.note || 'รอบตัดมะพร้าว'}</small>
            </span>
          </div>
          <span className="grid">
            <small className="text-xs text-slate-500">จำนวน</small>
            <strong className="text-xs font-semibold text-slate-600 sm:text-sm">{formatNumber(harvest.quantity)} ลูก</strong>
          </span>
          <span className="grid">
            <small className="text-xs text-slate-500">รายรับ</small>
            <strong className="whitespace-nowrap text-xs font-bold text-green sm:text-sm">{formatMoney(getTotal(harvest))}</strong>
          </span>
        </div>
      ))}
    </section>
  );
}

export default function OverviewPage({ harvests, settings, onShowHistory }) {
  const year = new Date().getFullYear();
  const latest = sortHarvests(harvests)[0];
  const totalIncome = harvests.reduce((sum, harvest) => sum + getTotal(harvest), 0);
  const totalCoconuts = harvests.reduce((sum, harvest) => sum + Number(harvest.quantity), 0);

  return (
    <>
      <PageIntro
        eyebrow="ข้อมูลสวนมะพร้าว"
        title="สรุปสวนของเรา"
        description="บันทึกรอบตัดและติดตามรายรับของสวน"
      />
      <div className="mb-4 grid grid-cols-2 divide-x divide-y divide-line border-y border-line bg-paper xl:mb-5 xl:grid-cols-4 xl:divide-y-0">
        <MetricCard tone="income" valueClassName="text-green-strong" emphasis label="รายรับสะสม" value={formatMoney(totalIncome)} note="รวมทุกรอบที่บันทึก" />
        <MetricCard label="มะพร้าวทั้งหมด" value={formatNumber(totalCoconuts)} unit="ลูก" note="ผลผลิตที่เก็บเกี่ยวแล้ว" />
        <MetricCard tone="olive" label="วันที่ตัดล่าสุด" value={latest ? formatDate(latest.date, { day: 'numeric', month: 'short', year: '2-digit' }) : '—'} note={latest ? 'บันทึกล่าสุดของสวน' : 'ยังไม่มีรอบตัด'} />
        <MetricCard tone="neutral" label="รอบตัดโดยประมาณ" value={formatNumber(settings.cycleDays)} unit="วัน" note="ปรับได้ในตั้งค่าสวน" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,.9fr)] lg:gap-4">
        <RevenueChart harvests={harvests} year={year} />
        <ForecastCard harvests={harvests} cycleDays={Number(settings.cycleDays) || 45} />
      </div>
      <RecentList harvests={harvests} onShowHistory={onShowHistory} />
    </>
  );
}
