import { useEffect, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import PageIntro from '../components/ui/PageIntro.jsx';
import { FormField, UnitInput } from '../components/ui/FormField.jsx';

export default function SettingsPage({ settings, onSave, onDirtyChange, busy }) {
  const [price, setPrice] = useState(String(settings.pricePerCoconut));
  const [cycle, setCycle] = useState(String(settings.cycleDays));

  useEffect(() => {
    setPrice(String(settings.pricePerCoconut));
    setCycle(String(settings.cycleDays));
  }, [settings.pricePerCoconut, settings.cycleDays]);

  const dirty = Number(price) !== Number(settings.pricePerCoconut) || Number(cycle) !== Number(settings.cycleDays);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  function submit(event) {
    event.preventDefault();
    onSave({ pricePerCoconut: Number(price), cycleDays: Number(cycle) });
  }

  return (
    <>
      <PageIntro
        eyebrow="ปรับให้ตรงกับสวน"
        title="ตั้งค่าสวน"
        description="กำหนดราคาปัจจุบันและระยะห่างของรอบตัดโดยประมาณ"
      />
      <form className="max-w-[790px] border-y border-line bg-paper px-4 pt-5 sm:px-[26px] sm:pt-6" onSubmit={submit}>
        <div className="border-b border-line/70 pb-4 sm:pb-5">
          <div>
            <h2 className="text-base font-bold text-ink sm:text-lg">ข้อมูลการเก็บเกี่ยว</h2>
            <p className="mt-0.5 text-xs text-slate-500">ราคาใหม่จะใช้กับรอบตัดที่บันทึกหลังจากนี้</p>
          </div>
        </div>
        <div className="grid gap-4 py-5 md:grid-cols-2 md:gap-6">
          <FormField label="ราคามะพร้าวต่อลูก" hint="รอบตัดเก่ายังคงใช้ราคาที่บันทึกไว้ในวันนั้น">
            <UnitInput type="number" min="0" max="1000000" step="0.01" required inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} unit="บาท / ลูก" />
          </FormField>
          <FormField label="รอบตัดโดยประมาณ" hint="ใช้คาดการณ์วันตัดครั้งถัดไปจากรอบล่าสุด">
            <UnitInput type="number" min="1" max="365" step="1" required inputMode="numeric" value={cycle} onChange={(event) => setCycle(event.target.value)} unit="วัน / รอบ" />
          </FormField>
        </div>
        <div className="flex flex-col items-start gap-3 border-t border-line/70 py-4 sm:min-h-[68px] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><Icon name="check" className="size-3.5 text-green/70" /> ข้อมูลจะบันทึกไว้ให้ทุกคนในบ้าน</span>
          <Button type="submit" icon="check" disabled={busy || !dirty} className="w-full sm:w-auto">{busy ? 'กำลังบันทึก…' : 'บันทึกการตั้งค่า'}</Button>
        </div>
      </form>
      <div className="mt-4 max-w-[790px] border-l-2 border-olive/50 pl-3.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
        <p><strong className="mr-1 font-medium text-olive">หมายเหตุ</strong>วันที่ตัดครั้งถัดไปคำนวณจากจำนวนวันที่ตั้งไว้ สามารถปรับให้ตรงกับรอบจริงของสวนได้</p>
      </div>
    </>
  );
}
