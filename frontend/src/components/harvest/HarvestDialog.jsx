import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { FormField, UnitInput } from '../ui/FormField.jsx';
import { formatMoney, localDateString } from '../../lib/formatters.js';

const emptyForm = (price) => ({
  date: localDateString(),
  quantity: '',
  pricePerCoconut: String(price),
  note: ''
});

export default function HarvestDialog({ open, editing, price, onClose, onSave, busy }) {
  const dialogRef = useRef(null);
  const quantityRef = useRef(null);
  const [form, setForm] = useState(() => emptyForm(price));

  useEffect(() => {
    if (!open) return;
    setForm(editing
      ? {
          date: editing.date,
          quantity: String(editing.quantity),
          pricePerCoconut: String(editing.pricePerCoconut),
          note: editing.note || ''
        }
      : emptyForm(price));
    const timer = window.setTimeout(() => quantityRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open, editing, price]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;
  const total = (Number(form.quantity) || 0) * (Number(form.pricePerCoconut) || 0);

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave({
      date: form.date,
      quantity: Number(form.quantity),
      pricePerCoconut: Number(form.pricePerCoconut),
      note: form.note.trim()
    }, editing?.id);
  }

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-h-[min(92vh,760px)] w-[calc(100%_-_28px)] max-w-[520px] overflow-y-auto rounded-lg border border-line bg-white p-0 text-ink shadow-lg shadow-ink/10 backdrop:bg-ink/45"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}
      aria-labelledby="harvest-dialog-title"
    >
      <form className="px-4 py-5 sm:px-6" onSubmit={submit}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center border border-line text-green"><Icon name="coconut" className="size-5" /></span>
            <span>
              <small className="block text-xs text-slate-500">บันทึกผลผลิต</small>
              <h2 id="harvest-dialog-title" className="text-lg font-bold text-ink">{editing ? 'แก้ไขรอบตัด' : 'เพิ่มรอบตัดใหม่'}</h2>
            </span>
          </div>
          <button className="grid size-9 place-items-center rounded-md bg-canvas text-slate-500 hover:text-slate-700" type="button" onClick={onClose} aria-label="ปิดหน้าต่าง"><Icon name="close" className="size-4" /></button>
        </div>
        <FormField label="วันที่ตัด" required>
        <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-green/50 focus:ring-4 focus:ring-green/10" type="date" required value={form.date} onChange={(event) => change('date', event.target.value)} />
        </FormField>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
          <FormField label="จำนวนมะพร้าว" required>
            <UnitInput ref={quantityRef} type="number" min="1" step="1" required inputMode="numeric" placeholder="เช่น 320" value={form.quantity} onChange={(event) => change('quantity', event.target.value)} unit="ลูก" />
          </FormField>
          <FormField label="ราคาต่อลูก" required>
            <UnitInput type="number" min="0" max="1000000" step="0.01" required inputMode="decimal" value={form.pricePerCoconut} onChange={(event) => change('pricePerCoconut', event.target.value)} unit="บาท" />
          </FormField>
        </div>
        <FormField className="mt-4" label={<>หมายเหตุ <small className="font-normal text-slate-400">(ไม่บังคับ)</small></>}>
          <input className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-green/50 focus:ring-4 focus:ring-green/10" type="text" maxLength="240" placeholder="เช่น รอบเช้า · แปลงหลังบ้าน" value={form.note} onChange={(event) => change('note', event.target.value)} />
        </FormField>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-md border border-green/10 bg-green/5 px-4 py-3">
          <span className="text-xs text-slate-600">รายรับรอบนี้โดยประมาณ</span>
          <strong className="text-2xl font-bold tracking-tight text-green">{formatMoney(total)}</strong>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="quiet" onClick={onClose}>ยกเลิก</Button>
          <Button type="submit" icon="check" disabled={busy}>{busy ? 'กำลังบันทึก…' : editing ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</Button>
        </div>
      </form>
    </dialog>
  );
}
