import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

/**
 * CaptchaChallenge
 * Pose une opération arithmétique simple (addition ou soustraction).
 * Props :
 *   onVerified(bool) — appelé avec true quand la réponse est correcte,
 *                      false quand elle est effacée ou incorrecte.
 *   reset           — quand cette valeur change, le captcha se régénère.
 */
const OPERATIONS = ['+', '-', '×'];

function generateChallenge() {
  const op = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
  let a, b, answer;

  if (op === '+') {
    a = Math.floor(Math.random() * 15) + 1;
    b = Math.floor(Math.random() * 15) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 15) + 6;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 5) + 2;
    answer = a * b;
  }

  return { a, b, op, answer };
}

const CaptchaChallenge = ({ onVerified, reset }) => {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error

  const refresh = useCallback(() => {
    setChallenge(generateChallenge());
    setInput('');
    setStatus('idle');
    onVerified(false);
  }, [onVerified]);

  // Régénère quand reset change (ex: après soumission)
  useEffect(() => {
    refresh();
  }, [reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val === '') {
      setStatus('idle');
      onVerified(false);
      return;
    }

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      if (parsed === challenge.answer) {
        setStatus('success');
        onVerified(true);
      } else {
        setStatus('error');
        onVerified(false);
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all ${
        status === 'success'
          ? 'border-green-400 bg-green-500/10'
          : status === 'error'
          ? 'border-red-400/50 bg-red-500/10'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-400 mb-3">
        Vérification anti-bot
      </p>

      <div className="flex items-center gap-3">
        {/* Question */}
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl shrink-0">
          <span className="text-white font-black text-lg tabular-nums">
            {challenge.a}
          </span>
          <span className="text-blue-400 font-black text-lg">
            {challenge.op}
          </span>
          <span className="text-white font-black text-lg tabular-nums">
            {challenge.b}
          </span>
          <span className="text-white/40 font-black text-lg">=</span>
        </div>

        {/* Input réponse */}
        <input
          type="number"
          inputMode="numeric"
          placeholder="?"
          value={input}
          onChange={handleChange}
          className={`w-20 text-center py-2.5 rounded-xl border-2 font-black text-lg outline-none bg-white/5 text-white transition-all placeholder:text-white/20 ${
            status === 'success'
              ? 'border-green-400 bg-green-500/20'
              : status === 'error'
              ? 'border-red-400/50'
              : 'border-white/10 focus:border-blue-500/50'
          }`}
        />

        {/* Icône statut */}
        <div className="w-8 flex items-center justify-center shrink-0">
          {status === 'success' ? (
            <ShieldCheck size={22} className="text-green-400" />
          ) : (
            <button
              type="button"
              onClick={refresh}
              title="Nouvelle question"
              className="text-white/20 hover:text-white/60 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>

      {status === 'error' && input !== '' && (
        <p className="text-[10px] font-bold text-red-400 mt-2 ml-1">
          Mauvaise réponse — réessaie ou{' '}
          <button
            type="button"
            onClick={refresh}
            className="underline hover:text-red-300"
          >
            change de question
          </button>
        </p>
      )}
    </div>
  );
};

export default CaptchaChallenge;
