import { useState, type FormEvent } from 'react';
import { MessageSquarePlus, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Service gratuit sans compte : relaie le message par email, sans backend ni
// base de données. Remplacer par le endpoint "hash" fourni par FormSubmit
// pour éviter d'exposer l'email en clair dans le bundle client.
const FEEDBACK_ENDPOINT = 'https://formsubmit.co/ajax/ahmadudu339@gmail.com';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function FeedbackCard() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          message,
          _subject: 'Nouveau commentaire — Hussary Quran',
        }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Card className="mt-4 p-5">
      <div className="flex items-center gap-2.5">
        <MessageSquarePlus className="h-4.5 w-4.5 text-emerald-700 dark:text-gold-300" />
        <h2 className="font-display text-base font-semibold text-ink-950 dark:text-white">Laisser un commentaire</h2>
      </div>
      <p className="mt-2 text-xs text-ink-900/50 dark:text-white/45">
        Une remarque, un bug, une idée ? Envoyez un message anonyme au développeur — aucune information vous
        concernant n’est collectée. Nécessite une connexion internet.
      </p>

      {status === 'sent' ? (
        <p className="mt-4 rounded-xl bg-emerald-900/8 p-3 text-sm text-emerald-700 dark:bg-white/8 dark:text-emerald-200">
          Merci, votre commentaire a bien été envoyé.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Votre commentaire..."
            rows={4}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-ink-900/10 bg-transparent p-3 text-sm text-ink-950 placeholder:text-ink-900/35 focus:border-emerald-600/40 focus:outline-none dark:border-white/12 dark:text-white dark:placeholder:text-white/30"
          />
          <div className="mt-3 flex items-center gap-3">
            <Button type="submit" size="sm" disabled={!message.trim() || status === 'sending'}>
              <Send className="h-3.5 w-3.5" />
              {status === 'sending' ? 'Envoi…' : 'Envoyer'}
            </Button>
            {status === 'error' && (
              <p className="text-xs text-red-500">Échec de l’envoi. Vérifiez votre connexion et réessayez.</p>
            )}
          </div>
        </form>
      )}
    </Card>
  );
}
