import React, { useState, useMemo } from 'react';
import {
  Package,
  QrCode,
  Search,
  Tag,
  Square,
  CheckSquare,
  MoveRight,
  Trash2,
  X,
  Settings, // Nouvel import pour le bouton admin
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';

const CategoryView = ({
  objects = [],
  onObjectClick,
  selectedIds = [],
  onSelectObject,
  onSelectAll,
  onOpenTransfer,
  onBulkRemove,
  setSelectedIds,
  isAdmin, // Ajouté : pour le bouton de gestion
  setCurrentView, // Ajouté : pour la redirection
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIQUE DE GROUPEMENT AVEC ÉCLATEMENT ET FILTRE ---
  const categoriesGrouped = useMemo(() => {
    const search = searchTerm.toLowerCase();

    const groups = objects.reduce((acc, obj) => {
      // 1. Extraction propre des catégories
      let rawCats = obj.category || 'Autre';
      if (typeof rawCats === 'string' && rawCats.startsWith('[')) {
        try {
          rawCats = JSON.parse(rawCats);
        } catch (e) {
          rawCats = [rawCats];
        }
      }
      const catList = Array.isArray(rawCats) ? rawCats : [rawCats];

      // 2. Éclatement : Un objet avec 2 catégories apparaît dans 2 groupes
      catList.forEach((cat) => {
        const cleanCat = typeof cat === 'string' ? cat : 'Autre';
        const matchesSearch =
          obj.name?.toLowerCase().includes(search) ||
          cleanCat.toLowerCase().includes(search) ||
          obj.crate?.toString().includes(search);

        if (matchesSearch) {
          if (!acc[cleanCat]) acc[cleanCat] = [];
          acc[cleanCat].push(obj);
        }
      });

      return acc;
    }, {});

    return Object.keys(groups)
      .sort()
      .map((name) => ({
        name,
        items: groups[name],
      }));
  }, [objects, searchTerm]);

  return (
    <div className="max-w-3xl mx-auto w-full pb-24 relative">
      {/* HEADER DE LA PAGE AVEC BOUTON DE GESTION ADMIN */}
      <div className="bg-white p-6 mb-4 rounded-b-[32px] shadow-sm border-b border-slate-100 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <Tag size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Catégories
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Organisation du stock
            </p>
          </div>
        </div>

        {/* BOUTON DE GESTION (Visible uniquement pour Admin) */}
        {isAdmin && (
          <button
            onClick={() => setCurrentView('category_manager')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-purple-600 transition-all active:scale-95"
          >
            <Settings size={14} />
            Gérer
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE FIXE (Ajustée sous le nouveau header) */}
      <div className="bg-white p-4 shadow-sm sticky top-[0px] z-20 no-print border-b border-slate-100 mb-2">
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un objet, une catégorie ou une caisse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-purple-500 text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {categoriesGrouped.length > 0 ? (
          categoriesGrouped.map((group) => {
            // Clés uniques pour tout le groupe actuel
            const groupKeys = group.items.map(
              (item) => `${item.id}-${group.name}`
            );
            const allInGroupSelected =
              groupKeys.length > 0 &&
              groupKeys.every((key) => selectedIds.includes(key));

            return (
              <div
                key={group.name}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* EN-TÊTE DE GROUPE */}
                <div className="p-4 flex justify-between items-center border-b border-slate-50 bg-slate-50/30">
                  <h3 className="font-bold text-purple-700 text-lg flex items-center gap-2">
                    <Tag size={16} /> {group.name} ({group.items.length})
                  </h3>
                  <button
                    onClick={() => onSelectAll(group)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    {allInGroupSelected
                      ? 'Tout désélectionner'
                      : 'Tout sélectionner'}
                  </button>
                </div>

                {/* LISTE DES OBJETS DANS CETTE CATÉGORIE */}
                <div className="divide-y divide-slate-50">
                  {group.items.map((obj) => {
                    const uniqueKey = `${obj.id}-${group.name}`;
                    const isSelected = selectedIds.includes(uniqueKey);

                    return (
                      <div
                        key={uniqueKey}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => onObjectClick(obj)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectObject(uniqueKey);
                          }}
                          className="text-slate-300 hover:text-blue-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="text-blue-600" size={22} />
                          ) : (
                            <Square size={22} />
                          )}
                        </button>

                        <div className="h-12 w-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          {obj.photo ? (
                            <DisplayImage
                              src={obj.photo}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package
                              size={20}
                              className="text-slate-300 mx-auto mt-3"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 truncate">
                              {obj.name}
                            </h4>
                            <QrCode size={12} className="text-slate-300" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Caisse: #{obj.crate} | {obj.state || 'Neuf'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-slate-400 italic">
            <Search size={40} className="mx-auto mb-4 opacity-20" />
            <p>Aucun objet ou catégorie ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

      {/* BARRE D'ACTION FLOTTANTE */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-[100] animate-in fade-in slide-in-from-bottom-4 no-print">
          <div className="flex flex-col border-r border-slate-700 pr-4">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Sélection
            </span>
            <span className="text-sm font-bold">
              {selectedIds.length} objets
            </span>
          </div>
          <button
            onClick={() => onOpenTransfer()}
            className="flex items-center gap-2 text-xs font-bold hover:text-blue-400 transition-colors"
          >
            <MoveRight size={16} /> DÉPLACER
          </button>

          <button
            onClick={() => onBulkRemove()}
            className="flex items-center gap-2 text-xs font-bold hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} /> SUPPRIMER
          </button>

          <button
            onClick={() => setSelectedIds([])}
            className="ml-4 p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
