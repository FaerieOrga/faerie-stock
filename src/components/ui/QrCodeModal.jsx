import React from 'react';
import { X } from 'lucide-react';

/**
 * Modale d'affichage du QR Code
 * @param {Object} data - Contient { type, id, label }
 * @param {Function} onClose - Fonction pour fermer la modale
 */
export const QrCodeModal = ({ data, onClose }) => {
  if (!data) return null;

  // Construction de l'URL cible (Caisse ou Objet)
  const targetUrl = `${window.location.origin}?${data.type}=${data.id}`;
  const currentUrl = window.location.origin;
  const qrValue =
    data.type === 'object'
      ? `${currentUrl}/?item=${data.id}`
      : `${currentUrl}/?crate=${data.id}`;

  // URL de l'API de génération de QR Code
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrValue
  )}`;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-slate-800">{data.label}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              QR Code {data.type === 'crate' ? 'Caisse' : 'Objet'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-4 border-slate-50 inline-block my-6 shadow-inner">
          <img
            src={qrImageUrl}
            alt={`QR Code pour ${data.label}`}
            className="w-48 h-48 object-contain"
          />
        </div>

        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Scannez ce code pour accéder directement à la fiche détaillée.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-black hover:bg-slate-200 transition-colors active:scale-95"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
