import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Package,
  Box,
  MapPin,
  Calendar,
  Plus,
  Move,
  Trash2,
  CheckSquare,
  X,
  Square,
  QrCode,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';
import { cleanArray, isRentalOverdue } from '../../utils/formatters';

const StockHome = ({
  objects,
  rentals = [],
  cratesInfo,
  isAdmin,
  isGuest,
  onObjectClick,
  onAddClick,
  onOpenQR,
  onUpdateObject,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onBulkDelete,
  setShowTransferModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrate, setFilterCrate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('alpha-asc');
  const [activePicker, setActivePicker] = useState(null);
  const currentUrl = window.location.origin;

  // --- LOGIQUE DE FILTRAGE ET TRI ---
  const availableCategories = useMemo(() => {
    const cats = new Set();
    objects.forEach((obj) => cleanArray(obj.category).forEach((c) => c && cats.add(c)));
    return [...cats].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [objects]);

  const filteredObjects = useMemo(() => {
    return objects
      .filter((obj) => {
        const search = searchTerm.toLowerCase();
        const objCats = cleanArray(obj.category);
        const categoryMatch = objCats.some((c) =>
          c.toLowerCase().includes(search)
        );
        const matchSearch =
          (obj.name || '').toLowerCase().includes(search) ||
          (obj.crate || '').toString().includes(search) ||
          categoryMatch;
        const matchCrate =
          filterCrate === '' || (obj.crate || '').toString() === filterCrate;
        const matchCategory =
          filterCategory === '' || objCats.includes(filterCategory);
        return matchSearch && matchCrate && matchCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'alpha-asc')
          return (a.name || '').localeCompare(b.name || '');
        if (sortOrder === 'alpha-desc')
          return (b.name || '').localeCompare(a.name || '');
        if (sortOrder === 'crate') return (a.crate || 0) - (b.crate || 0);
        return 0;
      });
  }, [objects, searchTerm, filterCrate, filterCategory, sortOrder]);

  const overdueCount = rentals.filter((r) =>
    isRentalOverdue(r.return_date || r.returnDate)
  ).length;

  return (
    <div className="max-w-5xl mx-auto w-full pb-32 transition-all">
      {/* 1. BARRE DE RECHERCHE & FILTRES */}
      <div className="bg-white p-3 md:p-4 shadow-sm sticky top-[72px] z-20 no-print space-y-3">
        {!isGuest && overdueCount > 0 && (
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 font-bold animate-pulse text-xs md:text-sm">
            <AlertTriangle size={16} />
            <span>{overdueCount} objet(s) en retard !</span>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <input
            type="number"
            placeholder="Caisse"
            value={filterCrate}
            onChange={(e) => setFilterCrate(e.target.value)}
            className="w-16 md:w-20 px-2 py-2 rounded-xl bg-slate-100 border-none text-sm text-center font-bold outline-none"
          />
        </div>

        {/* FILTRE CATÉGORIES */}
        {availableCategories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setFilterCategory('')}
              className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                filterCategory === ''
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Tous
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat === filterCategory ? '' : cat)}
                className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          {isAdmin && (
            <button
              onClick={() => onSelectAll(filteredObjects)}
              className="text-[10px] md:text-xs font-black uppercase text-blue-600 tracking-tight"
            >
              {selectedIds.length === filteredObjects.length &&
              selectedIds.length > 0
                ? 'Tout décocher'
                : 'Tout sélectionner'}
            </button>
          )}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-[10px] md:text-xs bg-transparent border-none font-black uppercase text-slate-400 focus:ring-0 cursor-pointer"
          >
            <option value="alpha-asc">Nom A-Z</option>
            <option value="alpha-desc">Nom Z-A</option>
            <option value="crate">Par Caisse</option>
          </select>
        </div>
      </div>

      {/* 2. STATS RAPIDES (FONCTIONNALITÉ RESTAURÉE) */}
      <div className="p-4 grid grid-cols-4 gap-2 md:gap-3 no-print max-w-2xl mx-auto">
        <StatCard label="Objets" value={objects.length} color="text-blue-600" />
        <StatCard
          label="Caisses"
          value={[...new Set(objects.map((o) => o.crate))].length}
          color="text-green-600"
        />
        <StatCard
          label="Lieux"
          value={
            [...new Set(cratesInfo.map((c) => c.location))].filter(Boolean)
              .length
          }
          color="text-orange-600"
        />
        <StatCard
          label="Locs"
          value={rentals.length}
          color="text-purple-600"
          badge={overdueCount}
        />
      </div>

      {/* 3. LISTE DES OBJETS */}
      <div className="px-3 md:px-4 space-y-3 text-left">
        {filteredObjects.map((obj) => {
          // Ajout de la détection de location
          // On parcourt toutes les réservations pour voir si l'objet actuel est dans leurs items
          const activeRental = rentals?.find(
            (rental) =>
              // On vérifie que la réservation est validée ou en cours
              (rental.status === 'approved' ||
                rental.status === 'ongoing' ||
                rental.status === 'pending') &&
              // On cherche l'objet dans la liste des items de cette réservation
              rental.rental_items?.some(
                (item) => Number(item.object_id) === Number(obj.id)
              )
          );
          const isRented = !!activeRental;

          return (
            <div
              key={`${obj.id}-${obj.crate}`}
              className={`rounded-2xl shadow-sm p-3 md:p-4 flex items-start justify-between gap-3 transition-all cursor-pointer relative overflow-visible border-2 ${
                isRented
                  ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/10'
                  : 'bg-white border-slate-100'
              }`}
              onClick={() => onObjectClick(obj)}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(obj.id);
                    }}
                    className="mt-1 text-slate-300 hover:text-blue-600 shrink-0"
                  >
                    {selectedIds.includes(obj.id) ? (
                      <CheckSquare className="text-blue-600" size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                )}

                <DisplayImage
                  src={obj.photo}
                  className={`h-14 w-14 md:h-16 md:w-16 shadow-inner shrink-0 rounded-xl ${
                    isRented ? 'opacity-60' : ''
                  }`}
                  size="text-2xl"
                />

                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3
                      className={`font-bold truncate text-base md:text-lg leading-tight ${
                        isRented ? 'text-orange-900' : 'text-slate-800'
                      }`}
                    >
                      {obj.name}
                    </h3>
                    <span
                      className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase shrink-0 ${
                        obj.state === 'NEUF'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {obj.state}
                    </span>
                    {/* Badge de location intégré proprement */}
                    {isRented && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] md:text-[8px] font-black px-1.5 py-0.5 bg-orange-500 text-white rounded uppercase tracking-wider animate-pulse">
                          LOUÉ
                        </span>
                        {activeRental.return_date && (
                          <span className="text-[7px] md:text-[8px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                            Retour :{' '}
                            {new Date(
                              activeRental.return_date
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {cleanArray(obj.category).map((c) => (
                      <span
                        key={c}
                        onClick={(e) => { e.stopPropagation(); setFilterCategory(c === filterCategory ? '' : c); }}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase cursor-pointer transition-all ${
                          filterCategory === c
                            ? 'bg-blue-600 text-white'
                            : isRented
                            ? 'bg-orange-200/50 text-orange-700 hover:bg-orange-300/50'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div
                    className={`mt-2 text-[10px] md:text-xs font-bold ${
                      isRented ? 'text-orange-700/70' : 'text-slate-500'
                    }`}
                  >
                    Qté:{' '}
                    <span
                      className={
                        selectedIds.includes(obj.id)
                          ? 'text-blue-600 font-black'
                          : 'text-slate-900'
                      }
                    >
                      {obj.quantity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border group/qr ${
                    isRented
                      ? 'bg-orange-100/50 border-orange-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQR(e, 'object', obj.id, obj.name);
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `${currentUrl}/?item=${obj.id}`
                    )}`}
                    alt="QR"
                    className="w-8 h-8 md:w-20 md:h-20 mix-blend-multiply opacity-80"
                  />
                </div>

                <div
                  className="flex items-center gap-1 mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label
                    className={`text-[8px] md:text-[10px] font-black uppercase tracking-tighter ${
                      isRented ? 'text-orange-600/60' : 'text-slate-400'
                    }`}
                  >
                    Caisse
                  </label>
                  <input
                    type="number"
                    defaultValue={obj.crate}
                    onBlur={async (e) => {
                      const newValue = parseInt(e.target.value);
                      if (!isNaN(newValue) && newValue !== obj.crate) {
                        await onUpdateObject(obj.id, { crate: newValue });
                      }
                    }}
                    className={`hidden md:block w-14 px-1 py-1 text-center font-bold border-2 rounded-lg focus:ring-0 outline-none text-xs ${
                      isRented
                        ? 'bg-white border-orange-200 text-orange-900'
                        : 'bg-white border-slate-100 text-slate-800'
                    }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePicker(activePicker === obj.id ? null : obj.id);
                    }}
                    className={`md:hidden w-10 py-1.5 rounded-lg font-black text-[10px] shadow-inner ${
                      isRented
                        ? 'bg-orange-500 text-white shadow-orange-900/20'
                        : 'bg-slate-100 text-blue-600'
                    }`}
                  >
                    {obj.crate || 0}
                  </button>
                </div>
              </div>

              {activePicker === obj.id && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 bg-white z-[99] shadow-2xl rounded-2xl p-4 border-2 border-blue-500 animate-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-3 px-1 text-left">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">
                      Modifier la Caisse
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePicker(null);
                      }}
                      className="p-1 bg-slate-100 rounded-full text-slate-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <CratePicker
                    current={obj.crate || 0}
                    onSelect={async (val) => {
                      await onUpdateObject(obj.id, { crate: val });
                      setActivePicker(null);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOUTON AJOUT */}
      {!isGuest && (
        <button
          onClick={onAddClick}
          className="fixed bottom-6 right-6 bg-blue-600 text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 z-40 transition-transform active:scale-90"
        >
          <Plus size={28} className="md:hidden" />
          <Plus size={32} className="hidden md:block" />
        </button>
      )}

      {/* MENU CONTEXTUEL SÉLECTION (RESTAURÉ) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:w-auto bg-slate-900 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-between md:justify-start gap-3 md:gap-6 z-[100] animate-in slide-in-from-bottom-10">
          <div className="flex flex-col border-r border-slate-700 pr-3 md:pr-4 shrink-0">
            <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400">
              Sélection
            </span>
            <span className="text-xs md:text-sm font-bold">
              {selectedIds.length}{' '}
              <span className="hidden md:inline">objets</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-slate-800 rounded-lg transition-colors text-blue-400 font-bold text-[10px] md:text-sm shrink-0"
            >
              <Move size={16} /> Déplacer
            </button>
            <button
              onClick={() => onBulkDelete(selectedIds)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-[10px] md:text-sm transition-colors shrink-0 ${
                selectedIds.some((id) =>
                  rentals.some(
                    (r) => Number(r.objectId || r.object_id) === Number(id)
                  )
                )
                  ? 'opacity-50 cursor-not-allowed text-slate-500'
                  : 'hover:bg-red-900/30 text-red-400'
              }`}
            >
              <Trash2 size={16} /> Supprimer
            </button>
            <button
              onClick={() => onSelectAll([])}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CratePicker = ({ current, onSelect }) => {
  const crates = Array.from({ length: 101 }, (_, i) => i);
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-2 md:gap-3 overflow-x-auto py-4 px-6 no-scrollbar snap-x snap-mandatory">
        {crates.map((num) => (
          <button
            key={num}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(num);
            }}
            className={`flex-none w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-xl transition-all snap-center ${
              current === num
                ? 'bg-blue-600 text-white scale-110 shadow-lg'
                : 'bg-slate-50 text-slate-400 border border-slate-100'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};

const StatCard = ({ label, value, color, badge }) => (
  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-2 md:p-3 text-center border border-slate-50 relative">
    <div className={`text-sm md:text-xl font-black ${color}`}>{value}</div>
    <div className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-1">
      {label}
    </div>
    {badge > 0 && (
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] md:text-[9px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center border-2 border-white">
        {badge}
      </div>
    )}
  </div>
);

export default StockHome;