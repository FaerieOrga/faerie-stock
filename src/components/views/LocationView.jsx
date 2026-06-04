import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  CheckCircle2,
  ChevronRight,
  Map,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const LocationsView = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // États pour la création
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  // États pour l'édition
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;

    try {
      const { error } = await supabase
        .from('locations')
        .insert([{ name: newLocationName.trim() }]);

      if (error) throw error;

      setNewLocationName('');
      setIsAddModalOpen(false);
      fetchLocations();
    } catch (error) {
      alert("Erreur lors de l'ajout du lieu");
    }
  };

  const handleUpdateLocation = async (id) => {
    if (!editName.trim()) return;

    try {
      const { error } = await supabase
        .from('locations')
        .update({ name: editName.trim() })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      fetchLocations();
    } catch (error) {
      alert('Erreur lors de la modification');
    }
  };

  const handleDeleteLocation = async (id, name) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le lieu "${name}" ?`))
      return;

    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);

      if (error) throw error;
      fetchLocations();
    } catch (error) {
      alert(
        'Impossible de supprimer ce lieu (il est peut-être utilisé dans un événement).'
      );
    }
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic text-slate-900 tracking-tighter flex items-center gap-3">
            <Map size={36} className="text-indigo-600" />
            Gestion des Lieux
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
            Référentiel global des emplacements logistiques
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Nouveau Lieu
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Rechercher un lieu par son nom..."
          className="w-full pl-12 pr-4 py-5 bg-white border-none rounded-[1.5rem] shadow-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LOCATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center font-black text-slate-300 uppercase italic">
            Chargement...
          </div>
        ) : filteredLocations.length > 0 ? (
          filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4">
                    <MapPin size={20} />
                  </div>

                  {editingId === loc.id ? (
                    <div className="space-y-3">
                      <input
                        autoFocus
                        className="w-full bg-slate-50 border-2 border-indigo-200 rounded-xl px-3 py-2 font-bold outline-none"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateLocation(loc.id)}
                          className="flex-1 bg-emerald-500 text-white p-2 rounded-lg font-black uppercase text-[10px]"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-slate-100 text-slate-400 p-2 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-black text-xl text-slate-800 uppercase italic leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                        {loc.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(loc.id);
                            setEditName(loc.name);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 size={12} /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id, loc.name)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <ChevronRight
                  size={20}
                  className="text-slate-200 group-hover:text-indigo-200 mt-1"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="font-black text-slate-400 uppercase italic">
              Aucun lieu trouvé
            </p>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-left">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic text-slate-900">
                Nouveau Lieu
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
                  Nom de l'emplacement
                </label>
                <input
                  autoFocus
                  placeholder="Ex: Entrepôt Nord, Garage..."
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Créer l'emplacement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsView;
