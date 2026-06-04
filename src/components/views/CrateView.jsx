import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  QrCode,
  Settings,
  CheckSquare,
  Square,
  Move,
  Trash2,
  X,
  Info,
  Camera,
  Loader2,
  Warehouse,
  ShoppingCart,
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';
import { supabase } from '../../api/supabase';

const CrateView = ({
  objects,
  cratesInfo,
  rentals = [], // Reçu depuis App.js
  isAdmin,
  isGuest,
  onOpenCrateDetail,
  onOpenQR,
  onUpdateCrate,
  onBulkDelete,
  setShowTransferModal,
  onObjectClick,
  selectedIds = [],
  warehouses = [],
  onToggleSelect,
  onSelectAll,
  onUploadImage,
}) => {
  const [crateSearchTerm, setCrateSearchTerm] = useState('');
  const [crateSortOrder, setCrateSortOrder] = useState('asc');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('ALL');
  const [uploadingCrate, setUploadingCrate] = useState(null);
  const currentUrl = window.location.origin;

  // --- LOGIQUE DE FILTRAGE DES CAISSES (CORRIGÉE) ---
  const filteredCrateNums = useMemo(() => {
    const search = crateSearchTerm.toLowerCase();

    // On part des numéros de caisses issus des objets
    const crateNumsSet = new Set(
      objects.map((o) =>
        o.crate === null || o.crate === undefined || o.crate === 0 ? 0 : o.crate
      )
    );

    // On ajoute aussi les caisses connues dans cratesInfo appartenant
    // à l'entrepôt sélectionné, même si elles n'ont pas encore d'objets
    if (selectedWarehouseId !== 'ALL') {
      cratesInfo
        .filter((i) => i.warehouse_id === selectedWarehouseId)
        .forEach((i) => crateNumsSet.add(i.crate_number));
    }

    const uniqueCrates = [...crateNumsSet];

    return uniqueCrates
      .filter((c) => {
        const isVrac = c === 0;
        const info = isVrac
          ? null
          : cratesInfo.find((i) => i.crate_number === c);
        const warehouse = isVrac
          ? null
          : warehouses.find((w) => w.id === info?.warehouse_id);

        if (selectedWarehouseId !== 'ALL') {
          if (isVrac) {
            // Pour le vrac : on vérifie si au moins un objet en vrac
            // appartient à l'entrepôt sélectionné via son propre warehouse_id
            const hasVracObjectInWarehouse = objects.some(
              (obj) =>
                (obj.crate === 0 ||
                  obj.crate === null ||
                  obj.crate === undefined) &&
                obj.warehouse_id === selectedWarehouseId
            );
            if (!hasVracObjectInWarehouse) return false;
          } else {
            if (info?.warehouse_id !== selectedWarehouseId) return false;
          }
        }

        const crateLabel = isVrac ? 'objets en vrac' : `caisse #${c}`;
        const crateMatches =
          crateLabel.includes(search) ||
          (info?.location || '').toLowerCase().includes(search) ||
          (info?.notes || '').toLowerCase().includes(search) ||
          (warehouse?.name || '').toLowerCase().includes(search);

        if (crateMatches) return true;

        const hasMatchingObject = objects.some((obj) => {
          const isSameCrate = isVrac
            ? obj.crate === 0 || obj.crate === null || obj.crate === undefined
            : obj.crate === c;

          return isSameCrate && obj.name?.toLowerCase().includes(search);
        });

        return hasMatchingObject;
      })
      .sort((a, b) => {
        if (crateSortOrder === 'asc') return a - b;
        return b - a;
      });
  }, [
    objects,
    cratesInfo,
    warehouses,
    crateSearchTerm,
    crateSortOrder,
    selectedWarehouseId,
  ]);

  // --- HANDLER UPLOAD PHOTO (ORIGINAL) ---
  const handleCratePhotoUpload = async (e, crateNum) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCrate(crateNum);
    try {
      const publicUrl = await onUploadImage(file);
      const { error } = await supabase
        .from('crates')
        .upsert(
          { crate_number: crateNum, photo: publicUrl },
          { onConflict: 'crate_number' }
        );

      if (error) throw error;
      if (onUpdateCrate) onUpdateCrate(crateNum, { photo: publicUrl });
    } catch (err) {
      alert("Erreur lors de l'enregistrement de la photo");
    } finally {
      setUploadingCrate(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-24 text-left">
      {/* --- BARRE DE RECHERCHE & FILTRES (ORIGINALE) --- */}
      <div className="bg-white p-4 shadow-sm sticky top-[72px] z-20 no-print space-y-3 border-b border-slate-100">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-[2]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Caisse, objet, descriptif..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
              value={crateSearchTerm}
              onChange={(e) => setCrateSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative flex-1">
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-blue-50 border-none text-blue-700 text-sm font-black uppercase tracking-tighter focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="ALL">📍 Tous les sites</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  🏢 {w.name}
                </option>
              ))}
            </select>
            <Warehouse
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
            />
          </div>

          <select
            value={crateSortOrder}
            onChange={(e) => setCrateSortOrder(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 border-none text-xs font-black text-slate-600 focus:ring-2 focus:ring-blue-500 uppercase"
          >
            <option value="asc">N° 1-9</option>
            <option value="desc">N° 9-1</option>
          </select>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {filteredCrateNums.map((crateNum) => {
          const isVracGroup = crateNum === 0;
          const search = crateSearchTerm.toLowerCase();
          const info = isVracGroup
            ? null
            : cratesInfo.find((c) => c.crate_number === crateNum);
          const warehouse = isVracGroup
            ? null
            : warehouses.find((w) => w.id === info?.warehouse_id);

          const crateMatchesHeader =
            (isVracGroup ? 'objets en vrac' : `caisse #${crateNum}`).includes(
              search
            ) ||
            (info?.location || '').toLowerCase().includes(search) ||
            (info?.notes || '').toLowerCase().includes(search) ||
            (warehouse?.name || '').toLowerCase().includes(search);

          const crateObjects = objects
            .filter((obj) => {
              const isSameCrate = isVracGroup
                ? obj.crate === 0 ||
                  obj.crate === null ||
                  obj.crate === undefined
                : obj.crate === crateNum;
              if (!isSameCrate) return false;
              // Pour le vrac, on filtre aussi par entrepôt si un filtre est actif
              if (isVracGroup && selectedWarehouseId !== 'ALL') {
                if (obj.warehouse_id !== selectedWarehouseId) return false;
              }
              return (
                crateMatchesHeader || obj.name?.toLowerCase().includes(search)
              );
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

          if (crateObjects.length === 0) return null;

          // DÉTECTION LOCATION POUR LA CAISSE
          const isCrateRented = crateObjects.some((obj) => {
            return rentals.some((rental) => {
              const isStatusActive = ['approved', 'ongoing'].includes(
                rental.status
              );
              const hasObject = rental.rental_items?.some(
                (item) => Number(item.object_id) === Number(obj.id)
              );
              return isStatusActive && hasObject;
            });
          });

          const isAllInCrateSelected =
            crateObjects.length > 0 &&
            crateObjects.every((obj) => selectedIds.includes(obj.id));

          return (
            <div
              key={isVracGroup ? 'vrac-section' : `crate-${crateNum}`}
              className={`bg-white rounded-[2rem] shadow-sm border overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md ${
                isCrateRented
                  ? 'border-orange-400 ring-2 ring-orange-400/10'
                  : isVracGroup
                  ? 'border-dashed border-slate-300'
                  : 'border-slate-100'
              }`}
            >
              {/* PHOTO (ORIGINALE) */}
              {!isVracGroup && (
                <div className="relative w-full md:w-48 h-48 md:h-auto bg-slate-100 shrink-0 border-r border-slate-50">
                  <DisplayImage
                    src={info?.photo}
                    className={`w-full h-full object-cover ${
                      isCrateRented ? 'opacity-60' : ''
                    }`}
                    size="text-5xl"
                  />
                  {isCrateRented && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <ShoppingCart size={40} className="text-orange-500/30" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 flex flex-col">
                <div
                  className={`p-5 flex justify-between items-start ${
                    isCrateRented
                      ? 'bg-orange-50/50'
                      : isVracGroup
                      ? 'bg-slate-50/80'
                      : 'bg-slate-50/30'
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer group"
                    onClick={() => !isVracGroup && onOpenCrateDetail(crateNum)}
                  >
                    <div className="flex items-center gap-3">
                      <h3
                        className={`font-black text-xl tracking-tight ${
                          isCrateRented
                            ? 'text-orange-900'
                            : isVracGroup
                            ? 'text-slate-500'
                            : 'text-slate-900 group-hover:text-blue-600'
                        } transition-colors`}
                      >
                        {isVracGroup
                          ? '📦 Objets en vrac'
                          : `Caisse #${crateNum}`}
                      </h3>
                      {isCrateRented && (
                        <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                          LOUÉ
                        </span>
                      )}
                      {!isVracGroup && (
                        <Settings
                          size={16}
                          className="text-slate-300 group-hover:text-blue-400"
                        />
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {warehouse && (
                        <div className="flex items-center gap-1.5 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-sm">
                          <Warehouse size={10} /> {warehouse.name}
                        </div>
                      )}
                      {info?.location && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-black uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          <MapPin size={10} /> {info.location}
                        </div>
                      )}
                    </div>
                    {info?.notes && !isVracGroup && (
                      <p className="mt-3 text-xs text-slate-500 font-medium italic line-clamp-2">
                        {info.notes}
                      </p>
                    )}
                  </div>

                  <div className="md:hidden ml-4">
                    {!isVracGroup && (
                      <button
                        onClick={(e) =>
                          onOpenQR(e, 'crate', crateNum, `Caisse #${crateNum}`)
                        }
                        className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400"
                      >
                        <QrCode size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* OBJETS (ORIGINAL) */}
                <div className="p-3 space-y-1.5 flex-1">
                  <div className="flex justify-end px-2 mb-1 no-print">
                    {isAdmin && (
                      <button
                        onClick={() => onSelectAll(crateObjects)}
                        className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest"
                      >
                        {isAllInCrateSelected
                          ? 'Désélectionner'
                          : 'Sélect. tout'}
                      </button>
                    )}
                  </div>

                  {crateObjects.map((obj) => {
                    const isObjRented = rentals.some(
                      (r) =>
                        (r.status === 'approved' || r.status === 'ongoing') &&
                        r.rental_items?.some(
                          (item) => Number(item.object_id) === Number(obj.id)
                        )
                    );

                    return (
                      <div
                        key={obj.id}
                        className={`flex items-center gap-4 p-2.5 rounded-2xl transition-all cursor-pointer group ${
                          isObjRented ? 'bg-orange-50/40' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => onObjectClick(obj)}
                      >
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSelect(obj.id);
                            }}
                            className="text-slate-200 group-hover:text-slate-400"
                          >
                            {selectedIds.includes(obj.id) ? (
                              <CheckSquare
                                size={20}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={20} />
                            )}
                          </button>
                        )}
                        <DisplayImage
                          src={obj.photo}
                          className={`h-11 w-11 shrink-0 rounded-xl shadow-sm object-cover ${
                            isObjRented ? 'opacity-60' : ''
                          }`}
                          size="text-xl"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div
                            className={`text-sm font-bold truncate tracking-tight ${
                              isObjRented ? 'text-orange-900' : 'text-slate-800'
                            }`}
                          >
                            {obj.name}
                            {isObjRented && (
                              <span className="ml-2 text-[7px] text-orange-500 uppercase font-black">
                                LOUÉ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-600">
                              Qté: {obj.quantity}
                            </span>
                            <span
                              className={
                                obj.state === 'À réparer'
                                  ? 'text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md'
                                  : ''
                              }
                            >
                              {obj.state}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR DESKTOP (ORIGINAL) */}
              {!isVracGroup && (
                <div className="hidden md:flex flex-col items-center justify-center bg-slate-50/50 border-l border-slate-100 p-8 min-w-[180px] group/qr-container">
                  <div
                    className="bg-white p-4 rounded-[1.5rem] shadow-sm group-hover/qr-container:shadow-xl group-hover/qr-container:-translate-y-1 transition-all cursor-pointer"
                    onClick={(e) =>
                      onOpenQR(e, 'crate', crateNum, `Caisse #${crateNum}`)
                    }
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `${currentUrl}/?crate=${crateNum}`
                      )}`}
                      alt="QR"
                      className="w-24 h-24 mix-blend-multiply"
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase mt-4 tracking-widest opacity-60">
                    Caisse {crateNum}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BARRE SÉLECTION (ORIGINALE) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 z-[100] animate-in slide-in-from-bottom-10 no-print">
          <div className="flex flex-col border-r border-slate-700 pr-4 text-left">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Sélection
            </span>
            <span className="text-sm font-bold">
              {selectedIds.length} objets
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-blue-400 font-bold text-sm"
            >
              <Move size={18} /> Déplacer
            </button>
            <button
              onClick={() => onBulkDelete(selectedIds)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-900/30 rounded-xl text-red-400 font-bold text-sm"
            >
              <Trash2 size={18} /> Supprimer
            </button>
            <button
              onClick={() => onSelectAll([])}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrateView;
