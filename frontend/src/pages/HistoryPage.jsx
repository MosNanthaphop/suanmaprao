import { useMemo, useState } from 'react';
import PageIntro from '../components/ui/PageIntro.jsx';
import { formatDate, formatMoney, formatNumber, getTotal, sortHarvests } from '../lib/formatters.js';

function HarvestDate({ harvest }) {
  return (
    <div className="min-w-0">
      <strong className="text-xs font-medium text-slate-700 sm:text-sm">{formatDate(harvest.date)}</strong>
    </div>
  );
}

function HarvestActions({ harvest, onEdit, onDelete }) {
  const date = formatDate(harvest.date);
  return (
    <div className="flex items-center gap-1">
      <button className="grid size-9 place-items-center rounded-md text-slate-500 hover:bg-green/10 hover:text-green" type="button" onClick={() => onEdit(harvest)} aria-label={'แก้ไขรอบตัดวันที่ ' + date} title="แก้ไข">
        <svg className="size-[15px] fill-none stroke-current stroke-[1.6]" aria-hidden="true"><use href="#icon-edit" /></svg>
      </button>
      <button className="grid size-9 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600" type="button" onClick={() => onDelete(harvest)} aria-label={'ลบรอบตัดวันที่ ' + date} title="ลบ">
        <svg className="size-[15px] fill-none stroke-current stroke-[1.6]" aria-hidden="true"><use href="#icon-trash" /></svg>
      </button>
    </div>
  );
}

function EmptyHistory({ hasAny }) {
  return (
    <div className="grid justify-items-center px-4 py-12 text-center">
      <strong className="text-[13px] font-medium text-slate-600">{hasAny ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีบันทึกรอบตัด'}</strong>
      <p className="mt-1 max-w-[290px] text-xs text-slate-500">{hasAny ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองปี แล้วค้นหาอีกครั้ง' : 'เริ่มเพิ่มข้อมูลรอบตัด เพื่อดูผลผลิตและรายรับย้อนหลังได้ที่นี่'}</p>
    </div>
  );
}

export default function HistoryPage({ harvests, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('all');
  const years = useMemo(() => [...new Set(harvests.map((harvest) => harvest.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a)), [harvests]);
  const activeYear = year === 'all' || years.includes(year) ? year : 'all';
  const items = sortHarvests(harvests).filter((harvest) =>
    (activeYear === 'all' || harvest.date.startsWith(activeYear)) &&
    (!query.trim() || String(harvest.note || '').toLocaleLowerCase('th').includes(query.trim().toLocaleLowerCase('th')))
  );

  return (
    <>
      <PageIntro
        eyebrow="บันทึกของสวน"
        title="ประวัติการตัด"
        description="ดูจำนวนผลผลิตและรายรับของแต่ละรอบย้อนหลัง"
      />
      <section className="border-y border-line bg-paper px-3 pt-4 pb-2 sm:px-5 sm:pt-[18px]">
        <div className="flex items-start justify-between gap-3 border-b border-line/70 pb-3.5 sm:items-center">
          <div className="grid">
            <strong className="text-sm text-ink sm:text-base">{formatNumber(items.length)} รอบตัด</strong>
            <span className="text-xs text-slate-500">บันทึกทั้งหมด</span>
          </div>
          <div className="flex w-[56%] flex-col gap-1.5 sm:w-auto sm:flex-row sm:gap-2">
          <label className="flex min-h-10 items-center gap-2 rounded-md border border-line px-2.5 text-slate-500 sm:w-[188px]">
              <svg className="size-[15px] fill-none stroke-current stroke-[1.7]" aria-hidden="true"><use href="#icon-search" /></svg>
              <input className="min-w-0 flex-1 bg-transparent text-xs text-slate-600 outline-none placeholder:text-slate-400" type="search" placeholder="ค้นหาหมายเหตุ" aria-label="ค้นหาหมายเหตุ" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label className="sr-only" htmlFor="history-year">เลือกปี</label>
            <select id="history-year" className="min-h-10 rounded-md border border-line bg-white px-2.5 text-xs text-slate-600 outline-none" value={activeYear} onChange={(event) => setYear(event.target.value)}>
              <option value="all">ทุกปี</option>
              {years.map((item) => <option value={item} key={item}>พ.ศ. {Number(item) + 543}</option>)}
            </select>
          </div>
        </div>
        {!items.length ? <EmptyHistory hasAny={harvests.length > 0} /> : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead className="border-b border-line text-xs font-medium text-slate-500">
                  <tr>
                    <th className="h-9 px-3">วันที่ตัด</th>
                    <th className="px-2 text-right">ผลผลิต</th>
                    <th className="px-2 text-right">ราคาต่อลูก</th>
                    <th className="px-2 text-right">รายรับ</th>
                    <th className="px-2">หมายเหตุ</th>
                    <th className="w-20 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((harvest) => (
                    <tr className="border-t border-line/70 text-xs text-slate-600" key={harvest.id}>
                      <td className="h-[54px] min-w-[150px] px-3"><HarvestDate harvest={harvest} /></td>
                      <td className="whitespace-nowrap px-2 text-right">{formatNumber(harvest.quantity)} ลูก</td>
                      <td className="whitespace-nowrap px-2 text-right">{formatMoney(harvest.pricePerCoconut)}</td>
                    <td className="whitespace-nowrap px-2 text-right font-bold text-green">{formatMoney(getTotal(harvest))}</td>
                      <td className="max-w-[180px] truncate px-2 text-slate-400" title={harvest.note || ''}>{harvest.note || '—'}</td>
                      <td className="px-2"><HarvestActions harvest={harvest} onEdit={onEdit} onDelete={onDelete} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid md:hidden">
              {items.map((harvest) => (
                <article className="border-t border-line/70 py-3" key={harvest.id}>
                  <div className="flex items-center justify-between gap-2">
                    <HarvestDate harvest={harvest} />
                  <strong className="whitespace-nowrap text-sm font-bold text-green">{formatMoney(getTotal(harvest))}</strong>
                  </div>
                  <div className="ml-[38px] mt-2 flex justify-between gap-3 text-xs text-slate-500">
                    <span>ผลผลิต <strong className="font-semibold text-slate-600">{formatNumber(harvest.quantity)} ลูก</strong></span>
                    <span>ราคาต่อลูก <strong className="font-semibold text-slate-600">{formatMoney(harvest.pricePerCoconut)}</strong></span>
                  </div>
                  {harvest.note && <p className="ml-[38px] mt-1 truncate text-xs text-slate-500">{harvest.note}</p>}
                  <div className="ml-[26px] mt-1"><HarvestActions harvest={harvest} onEdit={onEdit} onDelete={onDelete} /></div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
