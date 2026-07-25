import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/Button';

export function UpdateNotification() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // Check for a new version every hour while the app stays open.
      setInterval(() => void registration.update(), 60 * 60 * 1000);
    },
  });

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="glass fixed inset-x-3 z-40 flex items-center gap-3 rounded-2xl border border-ink-900/8 p-3 shadow-lifted dark:border-white/10 sm:left-[calc(16rem+1rem)] sm:right-4"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/8 text-emerald-700 dark:bg-white/10 dark:text-gold-300">
            <RefreshCw className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-950 dark:text-white">Mise à jour disponible</p>
            <p className="text-xs text-ink-900/50 dark:text-white/45">Rechargez pour profiter de la dernière version.</p>
          </div>
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Recharger
          </Button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="rounded-full px-2 py-1 text-xs text-ink-900/40 hover:bg-ink-900/5 dark:text-white/40 dark:hover:bg-white/10"
          >
            Plus tard
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
