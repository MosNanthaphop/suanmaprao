import { useCallback, useEffect, useRef, useState } from 'react';
import { IconSprite } from './components/ui/Icon.jsx';
import { MobileNav, Sidebar, TopBar } from './components/layout/Navigation.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HarvestDialog from './components/harvest/HarvestDialog.jsx';
import Toast from './components/ui/Toast.jsx';
import { formatDate, localDateString } from './lib/formatters.js';

const initialData = {
  settings: { pricePerCoconut: 8, cycleDays: 45 },
  harvests: []
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
  return data;
}

export default function App() {
  const [data, setData] = useState(initialData);
  const [activeView, setActiveView] = useState('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const settingsDirty = useRef(false);
  const today = new Date();

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const closeDialog = useCallback(() => setDialogOpen(false), []);
  const markSettingsDirty = useCallback((dirty) => {
    settingsDirty.current = dirty;
  }, []);

  useEffect(() => {
    let cancelled = false;
    api('/api/state')
      .then((next) => { if (!cancelled) setData(next); })
      .catch((error) => { if (!cancelled) notify('เชื่อมต่อข้อมูลสวนไม่ได้: ' + error.message, 'error'); });
    return () => { cancelled = true; };
  }, [notify]);

  useEffect(() => {
    const refresh = async () => {
      if (document.visibilityState !== 'visible' || dialogOpen || settingsDirty.current) return;
      try {
        const latest = await api('/api/state');
        setData((current) => JSON.stringify(latest) === JSON.stringify(current) ? current : latest);
      } catch {
        // Keep the last loaded data visible if the server is briefly unavailable.
      }
    };
    const timer = window.setInterval(refresh, 20000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [dialogOpen, activeView]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function changeView(view) {
    if (view !== activeView) settingsDirty.current = false;
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openAddDialog() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEditDialog(harvest) {
    setEditing(harvest);
    setDialogOpen(true);
  }

  async function saveHarvest(payload, id) {
    setBusy(true);
    try {
      const path = id ? '/api/harvests/' + encodeURIComponent(id) : '/api/harvests';
      const next = await api(path, { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      setData(next);
      setDialogOpen(false);
      notify(id ? 'แก้ไขข้อมูลรอบตัดแล้ว' : 'บันทึกรอบตัดเรียบร้อยแล้ว');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function deleteHarvest(harvest) {
    if (!window.confirm('ลบรอบตัดวันที่ ' + formatDate(harvest.date) + ' ใช่ไหม?')) return;
    try {
      const next = await api('/api/harvests/' + encodeURIComponent(harvest.id), { method: 'DELETE' });
      setData(next);
      notify('ลบรอบตัดเรียบร้อยแล้ว');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function saveSettings(payload) {
    setBusy(true);
    try {
      const next = await api('/api/settings', { method: 'PUT', body: JSON.stringify(payload) });
      settingsDirty.current = false;
      setData(next);
      notify('บันทึกการตั้งค่าสวนแล้ว');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const todayLabel = formatDate(localDateString(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <IconSprite />
      <Sidebar activeView={activeView} onChange={changeView} count={data.harvests.length} />
      <main className="min-h-screen px-4 pb-24 md:ml-[76px] md:px-6 md:pb-8 xl:ml-[246px] xl:px-12">
        <div className="mx-auto max-w-[1420px]">
          <TopBar date={todayLabel} onAdd={openAddDialog} />
          {activeView === 'overview' && (
            <OverviewPage
              harvests={data.harvests}
              settings={data.settings}
              onShowHistory={() => changeView('history')}
            />
          )}
          {activeView === 'history' && (
            <HistoryPage
              harvests={data.harvests}
              onEdit={openEditDialog}
              onDelete={deleteHarvest}
            />
          )}
          {activeView === 'settings' && (
            <SettingsPage
              settings={data.settings}
              onSave={saveSettings}
              onDirtyChange={markSettingsDirty}
              busy={busy}
            />
          )}
          <footer className="flex justify-center gap-2 pt-6 text-[10px] text-slate-500">
            <span>สวนมะพร้าว</span><span className="text-slate-400">·</span><span>ผลผลิตและรายรับ</span>
          </footer>
        </div>
      </main>
      <MobileNav activeView={activeView} onChange={changeView} />
      <HarvestDialog
        open={dialogOpen}
        editing={editing}
        price={data.settings.pricePerCoconut}
        onClose={closeDialog}
        onSave={saveHarvest}
        busy={busy}
      />
      <Toast toast={toast} />
    </div>
  );
}
