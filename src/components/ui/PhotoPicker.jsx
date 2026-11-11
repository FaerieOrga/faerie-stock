import React, { useState } from 'react';
import { Camera, Image as ImageIcon, FolderOpen } from 'lucide-react';

/**
 * Bouton photo : propose "Prendre une photo" (appareil) ou "Choisir un fichier".
 * onChange reçoit l'évènement input (e.target.files[0]).
 * `className` : positionnement du conteneur ; `buttonClassName` : style du bouton.
 */
export default function PhotoPicker({
  onChange,
  disabled = false,
  className = '',
  buttonClassName = '',
  children,
}) {
  const [open, setOpen] = useState(false);

  const handle = (e) => {
    setOpen(false);
    onChange(e);
    // permet de re-sélectionner la même photo
    try {
      e.target.value = '';
    } catch (_) {}
  };

  return (
    <div className={`${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
      >
        {children || <Camera size={20} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-left">
            <label className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Camera size={18} className="text-blue-600" />
              Prendre une photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handle}
              />
            </label>
            <label className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer border-t border-slate-100">
              <FolderOpen size={18} className="text-blue-600" />
              Choisir un fichier
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handle}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
