import React, { useState } from 'react';
import {
  AlertTriangle,
  Lock,
  CheckCircle,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

/**
 * TransferValidationModal
 * Double validation avant le transfert de stock d'un événement.
 *
 * Étape 1 — Avertissement + résumé du transfert
 * Étape 2 — Saisie du nom de l'événement pour confirmer
 *
 * Props :
 *   eventName   {string}   Nom de l'événement à saisir pour confirmer
 *   movementsCount {number} Nombre de mouvements concernés
 *   onConfirm   {fn}       Appelé si les deux étapes sont validées
 *   onCancel    {fn}       Ferme le modal sans action
 */
const TransferValidationModal = ({
  eventName,
  movementsCount,
  onConfirm,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [inputName, setInputName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameMatches =
    inputName.trim().toLowerCase() === eventName?.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!nameMatches) return;
    setIsSubmitting(true);
    await onConfirm();
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div
          className={`p-6 flex items-center justify-between ${
            step === 1
              ? 'bg-amber-50 border-b border-amber-100'
              : 'bg-emerald-50 border-b border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-3">
            {step === 1 ? (
              <AlertTriangle size={22} className="text-amber-500 shrink-0" />
            ) : (
              <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
            )}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Étape {step} / 2
              </p>
              <h2
                className={`font-black text-base ${
                  step === 1 ? 'text-amber-900' : 'text-emerald-900'
                }`}
              >
                {step === 1 ? 'Confirmer le transfert' : 'Validation finale'}
              </h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ÉTAPE 1 — Avertissement */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-bold text-amber-900">
                ⚠️ Cette action est{' '}
                <span className="underline">irréversible</span>.
              </p>
              <ul className="text-xs text-amber-800 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <ArrowRight
                    size={14}
                    className="shrink-0 mt-0.5 text-amber-500"
                  />
                  <span>
                    <strong>{movementsCount}</strong> objet
                    {movementsCount > 1 ? 's' : ''} vont être déplacés dans le
                    stock réel.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={14} className="shrink-0 mt-0.5 text-amber-500" />
                  La logistique de l'événement sera{' '}
                  <strong>verrouillée définitivement</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <X size={14} className="shrink-0 mt-0.5 text-amber-500" />
                  Aucun retour en arrière ne sera possible sans intervention
                  manuelle en base de données.
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-500 font-medium text-center">
              Êtes-vous sûr de vouloir procéder au transfert global pour{' '}
              <strong>« {eventName} »</strong> ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-black text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Saisie du nom */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700">
                Pour confirmer, saisissez exactement le nom de l'événement :
              </p>
              <p className="text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 tracking-tight">
                « {eventName} »
              </p>
            </div>

            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Tapez le nom de l'événement..."
                className={`w-full px-5 py-4 rounded-2xl border-2 font-bold text-sm outline-none transition-all ${
                  inputName === ''
                    ? 'border-slate-200 bg-slate-50'
                    : nameMatches
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-red-300 bg-red-50 text-red-700'
                }`}
                onKeyDown={(e) =>
                  e.key === 'Enter' && nameMatches && handleConfirm()
                }
              />
              {inputName !== '' && !nameMatches && (
                <p className="text-[11px] text-red-500 font-bold ml-1">
                  Le nom ne correspond pas — vérifiez la casse et les espaces.
                </p>
              )}
              {nameMatches && (
                <p className="text-[11px] text-emerald-600 font-bold ml-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Nom validé
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setInputName('');
                }}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Retour
              </button>
              <button
                disabled={!nameMatches || isSubmitting}
                onClick={handleConfirm}
                className={`flex-[2] py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  nameMatches
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={16} /> Valider le transfert
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferValidationModal;
