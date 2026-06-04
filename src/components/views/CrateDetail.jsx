import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Package,
  QrCode,
  Settings,
  Camera,
  Loader2,
  Warehouse,
  Check,
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';

const CrateDetail = ({
  crateInfo,
  objects,
  onBack,
  onObjectClick,
  onUpdateCrate,
  onUploadImage,
  isAdmin,
  warehouses = [],
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // ÉTAT LOCAL POUR LE SÉLECTEUR (C'est la clé pour la réactivité immédiate)
  const [localWarehouseId, setLocalWarehouseId] = useState(
    crateInfo?.warehouse_id || ''
  );

  // Synchronisation si crateInfo change depuis le parent
  useEffect(() => {
    setLocalWarehouseId(crateInfo?.warehouse_id || '');
  }, [crateInfo?.warehouse_id]);

  const crateContent = objects.filter(
    (obj) => Number(obj.crate) === Number(crateInfo.crate_number)
  );

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await onUploadImage(file);
      await onUpdateCrate(crateInfo.crate_number, { photo: publicUrl });
    } catch (err) {
      console.error('Erreur upload:', err);
      alert("Erreur lors de l'enregistrement de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleWarehouseChange = async (e) => {
    const newId = e.target.value;
    // 1. Mise à jour visuelle immédiate
    setLocalWarehouseId(newId);

    // 2. Envoi à la base de données
    try {
      await onUpdateCrate(crateInfo.crate_number, {
        warehouse_id: newId === '' ? null : newId,
      });
    } catch (err) {
      console.error('Erreur update warehouse:', err);
      // En cas d'erreur, on remet la valeur d'origine
      setLocalWarehouseId(crateInfo.warehouse_id || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 text-left animate-in fade-in duration-500">
      {/* HEADER NAVIGATION */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} /> Retour
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Caisse #{crateInfo.crate_number}
          </h1>
          <div className="h-1.5 w-12 bg-blue-600 rounded-full mx-auto mt-1"></div>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE : IMAGE & QR */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-3 rounded-[2.5rem] shadow-xl border border-slate-100 group relative overflow-hidden">
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100">
              <DisplayImage
                src={crateInfo.photo}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                size="text-7xl"
              />
            </div>

            <label className="absolute bottom-6 right-6 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl cursor-pointer hover:bg-blue-700 active:scale-95 transition-all z-10 border-4 border-white">
              {isUploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Camera size={24} />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between no-print">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">
                Identifiant
              </p>
              <p className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 inline-block tracking-tight">
                crate:{crateInfo.crate_number}
              </p>
            </div>
            <div className="bg-slate-50 p-2 rounded-2xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=crate:${crateInfo.crate_number}`}
                alt="QR"
                className="w-16 h-16 mix-blend-multiply"
              />
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : PARAMÈTRES */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Settings size={20} className="text-blue-600" /> Paramètres
            </h2>

            <div className="space-y-8">
              {/* SÉLECTEUR D'ENTREPÔT - UTILISE localWarehouseId */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                  Entrepôt affecté
                </label>
                <div className="relative">
                  <select
                    value={localWarehouseId}
                    onChange={handleWarehouseChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Non affecté</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        🏢 {w.name}
                      </option>
                    ))}
                  </select>
                  <Warehouse
                    size={20}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                  />
                </div>
              </div>

              {/* DESCRIPTIF */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                  Notes & Contenu
                </label>
                <textarea
                  placeholder="Notes sur la caisse..."
                  defaultValue={crateInfo.notes}
                  onBlur={(e) =>
                    onUpdateCrate(crateInfo.crate_number, {
                      notes: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 text-slate-700 font-medium h-48 resize-none outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LISTE CONTENU */}
      <div className="mt-12 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Objets{' '}
            <span className="text-blue-600 ml-2">({crateContent.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-slate-50">
          {crateContent.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onObjectClick(obj)}
              className="bg-white flex items-center gap-5 p-6 hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm shrink-0">
                <DisplayImage
                  src={obj.photo}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-lg truncate mb-1">
                  {obj.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                    Qté: {obj.quantity}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                      obj.state === 'À réparer'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {obj.state}
                  </span>
                </div>
              </div>
              <ChevronLeft
                size={24}
                className="rotate-180 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
              />
            </div>
          ))}
          {crateContent.length === 0 && (
            <div className="col-span-2 bg-white p-20 text-center text-slate-400 italic">
              Caisse vide
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrateDetail;
