import React, { useState } from 'react';
import {
  Camera,
  Save,
  Minus,
  PlusCircle,
  FileText,
  Box,
  Warehouse,
  ArrowLeft,
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';
import CategoryMultiSelect from './CategoryMultiSelect';
import { ITEM_STATES } from '../../utils/constants';

const AddObjectForm = ({
  onAdd,
  onCancel,
  onUploadImage,
  uploading,
  warehouses = [],
}) => {
  const [newObject, setNewObject] = useState({
    name: '',
    photo: 'icon:box',
    quantity: 1,
    state: 'Neuf',
    crate: '',
    category: ['Autre'],
    notes: '',
    warehouse_id: '',
  });

  const isVrac =
    newObject.crate === '' ||
    newObject.crate === '0' ||
    parseInt(newObject.crate) === 0;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await onUploadImage(file);
      setNewObject((prev) => ({ ...prev, photo: url }));
    } catch (err) {
      alert("Erreur lors de l'upload de l'image");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const crateValue = parseInt(newObject.crate) || 0;
    const objectToSend = {
      ...newObject,
      crate: crateValue,
      quantity: parseInt(newObject.quantity) || 1,
      // N'envoyer warehouse_id que si l'objet est en vrac et qu'un entrepôt est sélectionné
      warehouse_id: crateValue === 0 ? newObject.warehouse_id || null : null,
    };
    onAdd(objectToSend);
  };

  return (
    <div className="max-w-xl mx-auto w-full p-4 pb-32 animate-in fade-in slide-in-from-bottom-4">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
          Nouvel objet
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PHOTO */}
        <div className="bg-white rounded-[32px] shadow-sm p-8 text-center border border-slate-100 relative overflow-hidden group">
          <div className="relative inline-block">
            <DisplayImage
              src={newObject.photo}
              className="h-40 w-40 mx-auto shadow-2xl ring-4 ring-slate-50 rounded-[28px] object-cover"
              size="text-6xl"
            />
            <label
              className={`absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-90 transition-all ${
                uploading ? 'opacity-50 animate-pulse' : ''
              }`}
            >
              <Camera size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Identité Visuelle
          </p>
        </div>

        {/* INFORMATIONS ESSENTIELLES */}
        <div className="bg-white rounded-[28px] shadow-sm p-6 space-y-5 border border-slate-100">
          {/* NOM */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
              Nom de l'objet
            </label>
            <input
              type="text"
              required
              value={newObject.name}
              onChange={(e) =>
                setNewObject((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Armure de plates..."
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 placeholder:text-slate-300 transition-all"
            />
          </div>

          {/* CAISSE + ÉTAT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                Emplacement (Caisse)
              </label>
              <div className="relative">
                <Box
                  className="absolute left-4 top-4 text-slate-300"
                  size={18}
                />
                <input
                  type="number"
                  required
                  value={newObject.crate}
                  onChange={(e) =>
                    setNewObject((prev) => ({
                      ...prev,
                      crate: e.target.value,
                      // Réinitialiser l'entrepôt si on quitte le vrac
                      warehouse_id:
                        parseInt(e.target.value) !== 0 ? '' : prev.warehouse_id,
                    }))
                  }
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                État Initial
              </label>
              <select
                value={newObject.state}
                onChange={(e) =>
                  setNewObject((prev) => ({ ...prev, state: e.target.value }))
                }
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 appearance-none cursor-pointer"
              >
                {ITEM_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ENTREPÔT — visible uniquement si vrac (crate = 0) */}
          {isVrac && warehouses.length > 0 && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-black text-blue-500 uppercase ml-1 tracking-wider flex items-center gap-1.5">
                <Warehouse size={12} /> Entrepôt (objet en vrac)
              </label>
              <select
                value={newObject.warehouse_id}
                onChange={(e) =>
                  setNewObject((prev) => ({
                    ...prev,
                    warehouse_id: e.target.value,
                  }))
                }
                className="w-full px-5 py-4 rounded-2xl bg-blue-50 border-2 border-blue-100 focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 appearance-none cursor-pointer"
              >
                <option value="">Non assigné</option>
                {[...warehouses]
                  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      🏢 {w.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* QUANTITÉ */}
        <div className="bg-white rounded-[28px] shadow-sm p-6 flex items-center justify-between border border-slate-100">
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">Quantité</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              Unités disponibles
            </span>
          </div>
          <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-2xl">
            <button
              type="button"
              onClick={() =>
                setNewObject((prev) => ({
                  ...prev,
                  quantity: Math.max(1, prev.quantity - 1),
                }))
              }
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-600 shadow-sm active:scale-90 transition-all"
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            <span className="text-2xl font-black w-8 text-center text-slate-800">
              {newObject.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setNewObject((prev) => ({
                  ...prev,
                  quantity: prev.quantity + 1,
                }))
              }
              className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 active:scale-90 transition-all"
            >
              <PlusCircle size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* CATÉGORIES */}
        <div className="bg-white rounded-[28px] shadow-sm p-6 space-y-4 border border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
            Classification (Catégories)
          </label>
          <CategoryMultiSelect
            selected={newObject.category}
            onChange={(cats) =>
              setNewObject((prev) => ({ ...prev, category: cats }))
            }
            isGuest={false}
          />
        </div>

        {/* NOTES */}
        <div className="bg-white rounded-[28px] shadow-sm p-6 space-y-3 border border-slate-100">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
            <FileText size={14} /> Notes & Observations
          </div>
          <textarea
            value={newObject.notes}
            onChange={(e) =>
              setNewObject((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Détails, fragilité, provenance, kit complet..."
            rows={3}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-sm italic font-medium text-slate-600"
          />
        </div>

        {/* ACTIONS */}
        <div className="fixed bottom-6 left-4 right-4 max-w-xl mx-auto flex gap-3 no-print z-50">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} /> Enregistrer l'objet
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddObjectForm;
