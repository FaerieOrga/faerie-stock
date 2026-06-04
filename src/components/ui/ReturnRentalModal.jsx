import React, { useState } from 'react';
import { X, Box, RotateCcw, User } from 'lucide-react';
import DisplayImage from './DisplayImage';

const ReturnRentalModal = ({ rental, onClose, onConfirm }) => {
  const [returnCrate, setReturnCrate] = useState('');

  if (!rental) return null;

  const handleValidate = (e) => {
    e.preventDefault();
    console.log('Modal: Clic valider', {
      rentalId: rental.id,
      crate: returnCrate,
    });
    if (!returnCrate) return alert('Veuillez indiquer un numéro de caisse.');
    onConfirm(rental, returnCrate);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm">
            <RotateCcw size={18} className="text-blue-600" /> Retour matériel
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleValidate} className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <DisplayImage
              src={rental.photo}
              className="h-14 w-14 shadow-sm"
              size="text-xl"
            />
            <div className="min-w-0">
              <div className="font-bold text-slate-800 truncate">
                {rental.objectName || rental.object_name}
              </div>
              <div className="text-xs text-blue-600 font-medium italic">
                Loué par {rental.renter}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
              <Box size={12} /> Caisse de destination
            </label>
            <input
              type="number"
              required
              autoFocus
              value={returnCrate}
              onChange={(e) => setReturnCrate(e.target.value)}
              placeholder="Ex: 12"
              className="w-full px-4 py-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-blue-500 outline-none font-black text-2xl text-blue-600 text-center"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRentalModal;
