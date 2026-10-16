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

const authStorageKey = 'suanmaprao-app-password';

function getStoredPassword() {
  try {
    return window.sessionStorage.getItem(authStorageKey) || '';
  } catch {
    return '';
  }
}

async function api(path, options = {}, password = '') {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (password) headers.Authorization = `Bearer ${password}`;
  const response = await fetch(path, {
    ...options,
    headers
  });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`API ตอบกลับไม่ใช่ JSON (HTTP ${response.status})`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`อ่านคำตอบจาก API ไม่ได้ (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const error = new Error(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
    error.status = response.status;
    throw error;
  }
  return data;
}

export default function App() {
  const [data, setData] = useState(initialData);
  const [password, setPassword] = useState(getStoredPassword);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
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
    setAuthLoading(true);
    api('/api/state', {}, password)
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setAuthError('');
        setAuthenticated(true);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.status === 401) {
          setAuthenticated(false);
          if (password) {
            try { window.sessionStorage.removeItem(authStorageKey); } catch { /* Storage can be unavailable. */ }
            setPassword('');
            setPasswordInput('');
            setAuthError('รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง');
          } else {
            setAuthError('');
          }
        } else {
          setAuthError(error.message);
        }
      })
      .finally(() => { if (!cancelled) setAuthLoading(false); });
    return () => { cancelled = true; };
  }, [notify, password]);

  useEffect(() => {
    if (!authenticated) return undefined;
    const refresh = async () => {
      if (document.visibilityState !== 'visible' || dialogOpen || settingsDirty.current) return;
      try {
        const latest = await api('/api/state', {}, password);
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
  }, [dialogOpen, activeView, authenticated, password]);

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

  async function unlockApp(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const next = await api('/api/state', {}, passwordInput);
      try { window.sessionStorage.setItem(authStorageKey, passwordInput); } catch { /* Keep this tab usable without storage. */ }
      setData(next);
      setAuthenticated(true);
      setPassword(passwordInput);
      setPasswordInput('');
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function saveHarvest(payload, id) {
    setBusy(true);
    try {
      const path = id ? '/api/harvests/' + encodeURIComponent(id) : '/api/harvests';
      const next = await api(path, { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }, password);
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
      const next = await api('/api/harvests/' + encodeURIComponent(harvest.id), { method: 'DELETE' }, password);
      setData(next);
      notify('ลบรอบตัดเรียบร้อยแล้ว');
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function saveSettings(payload) {
    setBusy(true);
    try {
      const next = await api('/api/settings', { method: 'PUT', body: JSON.stringify(payload) }, password);
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

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas px-4 text-sm text-slate-500">
        กำลังเชื่อมต่อข้อมูลสวน…
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas px-4 py-8 text-ink">
        <form className="w-full max-w-sm border border-line bg-white p-6 shadow-sm" onSubmit={unlockApp}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green">สวนมะพร้าว</p>
          <h1 className="mt-2 text-xl font-bold">เข้าสู่ข้อมูลสวน</h1>
          <label className="mt-5 block text-sm font-medium text-slate-600" htmlFor="app-password">รหัสผ่านของสวน</label>
          <input
            id="app-password"
            className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-green/50 focus:ring-4 focus:ring-green/10"
            type="password"
            autoComplete="current-password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            required
          />
          {authError && <p className="mt-3 text-sm text-red-600" role="alert">{authError}</p>}
          <button className="mt-5 h-11 w-full bg-green px-4 text-sm font-semibold text-white disabled:opacity-60" type="submit" disabled={authLoading}>
            {authLoading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </main>
    );
  }

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
          <footer className="flex justify-center gap-2 pt-6 text-xs text-slate-500">
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
