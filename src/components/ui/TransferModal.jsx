import React, { useState, useEffect } from 'react';
import { Box, Tag, X, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

const TransferModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  mode,
  loading,
}) => {
  const [value, setValue] = useState('');
  const isCategoryMode = mode === 'byCategory';

  // On remet le champ à vide dès qu'on ouvre la modale
  useEffect(() => {
    if (isOpen) setValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 no-print">
      <div
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            {isCategoryMode ? (
              <Tag size={20} className="text-blue-600" />
            ) : (
              <Box size={20} className="text-blue-600" />
            )}
            {isCategoryMode ? 'Changer Catégorie' : 'Changer Caisse'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info sélection */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium">
            Vous allez déplacer{' '}
            <span className="font-black underline">{selectedCount}</span>{' '}
            objet(s).
          </p>
        </div>

        {/* Formulaire dynamique */}
        <div className="space-y-4 mb-8">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
            {isCategoryMode
              ? 'Nouvelle catégorie'
              : 'Numéro de la nouvelle caisse'}
          </label>

          {isCategoryMode ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-4 border-2 border-slate-100 rounded-2xl text-lg font-bold bg-slate-50 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Choisir...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ex: 14"
              className="w-full px-4 py-4 border-2 border-slate-100 rounded-2xl text-2xl font-black text-center text-blue-600 bg-slate-50 focus:border-blue-500 outline-none transition-all"
              autoFocus
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(value)}
            disabled={loading || !value}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} />
                Confirmer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
