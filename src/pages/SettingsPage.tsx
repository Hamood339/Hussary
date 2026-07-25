import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, HardDrive, Moon, PlayCircle, Sun, SunMoon, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlayerStore } from '@/store/playerStore';
import { dbApi } from '@/lib/db';
import { cn } from '@/lib/utils';
import type { ThemePreference } from '@/types';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: SunMoon },
];

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Mo';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} Mo`;
  return `${(mb / 1024).toFixed(2)} Go`;
}

export function SettingsPage() {
  const { theme, autoplay, notificationsEnabled, setTheme, setAutoplay, setNotificationsEnabled } = useSettingsStore();
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorage({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
      });
    }
  }, []);

  async function handleNotificationToggle(value: boolean) {
    await setNotificationsEnabled(value);
    usePlayerStore.getState().refreshMediaMetadata();
  }

  async function handleReset() {
    await dbApi.resetAll();
    window.location.reload();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950 dark:text-white sm:text-3xl">Réglages</h1>
      <p className="mt-1 text-sm text-ink-900/55 dark:text-white/50">Personnalisez votre expérience d’écoute.</p>

      <Card className="mt-6 p-5">
        <div className="flex items-center gap-2.5">
          <SunMoon className="h-4.5 w-4.5 text-emerald-700 dark:text-gold-300" />
          <h2 className="font-display text-base font-semibold text-ink-950 dark:text-white">Apparence</h2>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-colors',
                theme === value
                  ? 'border-emerald-600/40 bg-emerald-900/8 text-emerald-700 dark:border-gold-400/40 dark:bg-white/8 dark:text-gold-300'
                  : 'border-ink-900/8 text-ink-900/55 hover:bg-ink-900/5 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 divide-y divide-ink-900/6 p-5 dark:divide-white/8">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <PlayCircle className="h-4.5 w-4.5 text-emerald-700 dark:text-gold-300" />
            <div>
              <p className="text-sm font-medium text-ink-950 dark:text-white">Lecture automatique</p>
              <p className="text-xs text-ink-900/50 dark:text-white/45">Enchaîner sur la sourate suivante</p>
            </div>
          </div>
          <Switch checked={autoplay} onCheckedChange={(v) => void setAutoplay(v)} label="Lecture automatique" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Bell className="h-4.5 w-4.5 text-emerald-700 dark:text-gold-300" />
            <div>
              <p className="text-sm font-medium text-ink-950 dark:text-white">Notifications</p>
              <p className="text-xs text-ink-900/50 dark:text-white/45">
                Afficher les contrôles de lecture sur l’écran verrouillé
              </p>
            </div>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={(v) => void handleNotificationToggle(v)}
            label="Notifications"
          />
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-center gap-2.5">
          <HardDrive className="h-4.5 w-4.5 text-emerald-700 dark:text-gold-300" />
          <h2 className="font-display text-base font-semibold text-ink-950 dark:text-white">Stockage</h2>
        </div>
        {storage ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-ink-900/8 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-400"
                style={{ width: `${storage.quota ? Math.min(100, (storage.usage / storage.quota) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-900/50 dark:text-white/45">
              {formatBytes(storage.usage)} utilisés {storage.quota ? `sur ${formatBytes(storage.quota)} disponibles` : ''}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-ink-900/45 dark:text-white/40">Estimation du stockage indisponible sur ce navigateur.</p>
        )}
      </Card>

      <Card className="mt-4 border-red-500/20 p-5">
        <div className="flex items-center gap-2.5">
          <Trash2 className="h-4.5 w-4.5 text-red-500" />
          <h2 className="font-display text-base font-semibold text-ink-950 dark:text-white">Réinitialiser l’application</h2>
        </div>
        <p className="mt-2 text-xs text-ink-900/50 dark:text-white/45">
          Efface définitivement les favoris, marque-pages, historique et réglages stockés sur cet appareil.
        </p>
        {!confirmReset ? (
          <Button variant="outline" size="sm" className="mt-4 border-red-500/30 text-red-500 hover:bg-red-500/8" onClick={() => setConfirmReset(true)}>
            Réinitialiser
          </Button>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="flex-1 text-xs text-red-600 dark:text-red-400">Cette action est irréversible.</p>
            <Button size="sm" variant="outline" className="border-red-500/30 text-red-500" onClick={handleReset}>
              Confirmer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
              Annuler
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
