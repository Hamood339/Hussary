import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Moon as MoonIcon, WifiOff } from 'lucide-react';
import { IslamicPattern } from '@/components/common/IslamicPattern';
import { Button } from '@/components/ui/Button';

const STEPS = [
  {
    icon: MoonIcon,
    title: 'Bienvenue sur Hussary Quran',
    body: 'Une écoute paisible et sans distraction de la récitation du Cheikh Mahmoud Khalil Al-Hussary.',
  },
  {
    icon: WifiOff,
    title: 'Entièrement hors ligne',
    body: 'Aucun fichier audio n’est jamais téléchargé. Tout ce que vous écoutez vit déjà sur cet appareil.',
  },
  {
    icon: BookOpen,
    title: 'Prêt à commencer',
    body: 'Retrouvez vos favoris, reprenez une sourate là où vous vous étiez arrêté, et posez des repères.',
  },
];

const STORAGE_KEY = 'hussary-quran-onboarded';

export function Onboarding() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return true;
    }
  });
  const [step, setStep] = useState(0);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage may be unavailable (private mode); fail silently
    }
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-950 to-ink-950 p-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <IslamicPattern className="absolute inset-0 text-gold-200" opacity={0.06} />
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-gold-200 shadow-glow-gold">
              {(() => {
                const Icon = STEPS[step].icon;
                return <Icon className="h-7 w-7" strokeWidth={1.75} />;
              })()}
            </div>
            <h1 className="font-display mt-6 text-2xl font-semibold text-white">{STEPS[step].title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100/70">{STEPS[step].body}</p>

            <div className="mt-8 flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-gold-300' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="mt-8 flex w-full gap-2.5">
              {step > 0 && (
                <Button variant="ghost" className="flex-1 text-white hover:bg-white/10" onClick={() => setStep((s) => s - 1)}>
                  Retour
                </Button>
              )}
              <Button
                variant="gold"
                className="flex-1"
                onClick={() => (step < STEPS.length - 1 ? setStep((s) => s + 1) : finish())}
              >
                {step < STEPS.length - 1 ? 'Suivant' : 'Commencer'}
              </Button>
            </div>
            {step < STEPS.length - 1 && (
              <button onClick={finish} className="mt-4 text-xs text-emerald-100/50 hover:text-emerald-100/80">
                Passer
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
