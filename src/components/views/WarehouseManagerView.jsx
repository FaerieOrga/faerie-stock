import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Search,
  Pencil,
  Check,
  X,
  MapPinned,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const WarehouseManagerView = ({ warehouses = [], onBack, onRefresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la création
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // États pour l'édition
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({ name: '', address: '' });

  // Filtrage
  const filteredWarehouses = useMemo(() => {
    return [...warehouses]
      .filter(
        (w) =>
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (w.address || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [warehouses, searchTerm]);

  // AJOUTER
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert([{ name: newName.trim(), address: newAddress.trim() }]);

      if (error) throw error;
      setNewName('');
      setNewAddress('');
      onRefresh();
    } catch (err) {
      alert("Erreur lors de l'ajout de l'entrepôt");
    } finally {
      setIsSubmitting(false);
    }
  };

  // MODIFIER
  const handleUpdate = async (id) => {
    if (!editValue.name.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('warehouses')
        .update({
          name: editValue.name.trim(),
          address: editValue.address.trim(),
        })
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
        "Supprimer cet entrepôt ? Les caisses associées n'auront plus d'entrepôt affecté."
      )
    ) {
      const { error } = await supabase.from('warehouses').delete().eq('id', id);
      if (!error) onRefresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-300 pb-20 text-left">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 mb-6 font-bold hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} /> Retour au stock
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl p-6 md:p-10 border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Warehouse className="text-blue-600" size={28} /> Gestion des
            Entrepôts
          </h2>
          <span className="bg-blue-50 text-blue-600 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
            {warehouses.length} Sites
          </span>
        </div>

        {/* SECTION NOUVEL ENTREPÔT */}
        <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block ml-1">
            Enregistrer un nouveau bâtiment
          </label>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom (ex: Hangar Principal)"
                className="flex-1 px-5 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Adresse ou Zone"
                className="flex-1 px-5 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center min-w-[60px]"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Plus size={24} />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RECHERCHE */}
        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer les entrepôts..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>

        {/* LISTE DES ENTREPÔTS */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredWarehouses.map((w) => (
            <div
              key={w.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 group hover:border-blue-200 hover:shadow-md transition-all"
            >
              {editingId === w.id ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={editValue.name}
                      onChange={(e) =>
                        setEditValue({ ...editValue, name: e.target.value })
                      }
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-blue-400 font-bold text-slate-700"
                    />
                    <button
                      onClick={() => handleUpdate(w.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editValue.address}
                    onChange={(e) =>
                      setEditValue({ ...editValue, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Modifier l'adresse..."
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <Warehouse size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{w.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                        <MapPinned size={12} /> {w.address || 'Aucune adresse'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(w.id);
                        setEditValue({
                          name: w.name,
                          address: w.address || '',
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredWarehouses.length === 0 && (
            <div className="text-center py-10 text-slate-400 italic">
              Aucun entrepôt trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagerView;
