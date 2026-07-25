import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/Button';

export function InstallBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  const visible = canInstall && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="glass fixed inset-x-3 top-3 z-40 flex items-center gap-3 rounded-2xl border border-ink-900/8 p-3 shadow-lifted dark:border-white/10 sm:left-[calc(16rem+1rem)] sm:right-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/8 text-emerald-700 dark:bg-white/10 dark:text-gold-300">
            <Download className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-950 dark:text-white">Installer Hussary Quran</p>
            <p className="text-xs text-ink-900/50 dark:text-white/45">Un accès instantané, même hors ligne.</p>
          </div>
          <Button size="sm" onClick={promptInstall}>
            Installer
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full p-1.5 text-ink-900/40 hover:bg-ink-900/5 dark:text-white/40 dark:hover:bg-white/10"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
