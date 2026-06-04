import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../api/supabase';
import { Tag, X, Check, Loader2, Search } from 'lucide-react';

const CategoryMultiSelect = ({ selected = [], onChange, isGuest = false }) => {
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- SÉCURITÉ : FORCE LE FORMAT TABLEAU ---
  const safeSelected = Array.isArray(selected)
    ? selected
    : selected
    ? [selected]
    : [];

  // 1. Charger les catégories depuis la BDD
  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });

        if (!error && data) {
          setAvailableCategories(data.map((c) => c.name));
        }
      } catch (err) {
        console.error('Erreur chargement catégories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  // 2. Filtrer les catégories en fonction de la recherche
  const filteredCategories = useMemo(() => {
    return availableCategories.filter((cat) =>
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCategories, searchTerm]);

  const toggleCategory = (catName) => {
    if (isGuest) return;
    const newSelected = safeSelected.includes(catName)
      ? safeSelected.filter((c) => c !== catName)
      : [...safeSelected, catName];
    onChange(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-3 font-bold uppercase">
        <Loader2 size={14} className="animate-spin text-blue-600" />
        Initialisation des catégories...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* --- BARRE DE RECHERCHE --- */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
          size={16}
        />
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* --- RÉSULTAT DES SÉLECTIONS (Badge flottant) --- */}
      {safeSelected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50/30 rounded-2xl border border-blue-100/50">
          {safeSelected.map((cat) => (
            <span
              key={`selected-${cat}`}
              onClick={() => toggleCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[11px] font-black cursor-pointer hover:bg-red-500 transition-all active:scale-95 shadow-sm shadow-blue-200"
            >
              {cat} <X size={12} />
            </span>
          ))}
        </div>
      )}

      {/* --- GRILLE DE SÉLECTION FILTRÉE --- */}
      <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1 custom-scrollbar">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => {
            const isSel = safeSelected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                disabled={isGuest}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isSel
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                } ${
                  isGuest ? 'cursor-not-allowed opacity-60' : 'active:scale-95'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSel && <Check size={12} strokeWidth={4} />}
                  {cat}
                </div>
              </button>
            );
          })
        ) : (
          <div className="w-full py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Aucun résultat pour "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
          {safeSelected.length} catégorie(s) sélectionnée(s)
        </p>
        {searchTerm && (
          <span className="text-[10px] text-blue-500 font-black uppercase">
            {filteredCategories.length} trouvé(s)
          </span>
        )}
      </div>
    </div>
  );
};

export default CategoryMultiSelect;
