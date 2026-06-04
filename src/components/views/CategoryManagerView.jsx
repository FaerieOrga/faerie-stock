import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Search,
  XCircle,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const CategoryManagerView = ({ categories = [], onBack, onRefresh }) => {
  const [newCat, setNewCat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour l'édition
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // --- FILTRAGE ET TRI ---
  const filteredCategories = useMemo(() => {
    return [...categories]
      .filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchTerm]);

  // AJOUTER
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCat.trim() }]);
      if (error) throw error;
      setNewCat('');
      onRefresh();
    } catch (err) {
      alert("Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  // MODIFIER (UPDATE)
  const handleUpdate = async (id) => {
    if (!editValue.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: editValue.trim() })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      onRefresh();
    } catch (err) {
      alert('Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUPPRIMER
  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Supprimer cette catégorie ? (Cela ne supprimera pas les objets associés)'
      )
    ) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) onRefresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-300 pb-20">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 mb-6 font-bold hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="bg-white rounded-[32px] shadow-xl p-6 sm:p-8 border border-slate-100 text-left">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Tag className="text-blue-600" /> Gestionnaire
          </h2>
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {categories.length} Catégories
          </span>
        </div>

        {/* AJOUT — formulaire en colonne sur mobile, ligne sur sm+ */}
        <div className="mb-8 p-4 bg-slate-50 rounded-[24px] border border-slate-100">
          <form
            onSubmit={handleAdd}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Nouvelle catégorie..."
              className="flex-1 min-w-0 px-5 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-bold"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg active:scale-95 transition-all font-bold text-sm whitespace-nowrap"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Ajouter
            </button>
          </form>
        </div>

        {/* RECHERCHE */}
        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>

        {/* LISTE AVEC ÉDITION */}
        <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-white p-3 px-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-all"
            >
              {editingId === cat.id ? (
                // MODE ÉDITION
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-1 rounded-lg border-2 border-blue-400 font-bold text-slate-700 outline-none"
                  />
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg shrink-0"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                // MODE AFFICHAGE — boutons toujours visibles sur mobile
                <>
                  <span className="font-bold text-slate-700 flex-1 min-w-0 truncate mr-2">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditValue(cat.name);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerView;
