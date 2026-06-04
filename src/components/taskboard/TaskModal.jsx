import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Users,
  Search,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { CATEGORIES as CATEGORIES_LIST } from '../../utils/constants';

const COLUMNS = [
  { id: 'todo', label: 'À Faire' },
  { id: 'doing', label: 'En Cours' },
  { id: 'waiting', label: 'En Attente' },
  { id: 'done', label: 'Terminé' },
];

const TaskModal = ({
  editingId,
  formData,
  setFormData,
  staff,
  events = [],
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [eventSearch, setEventSearch] = useState('');
  const [showEventList, setShowEventList] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowEventList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const toggleAssignee = (name) => {
    const current = formData.assignee || [];
    setFormData({
      ...formData,
      assignee: current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name],
    });
  };

  // --- LOGIQUE DE FILTRAGE DES ÉVÉNEMENTS ---
  const filteredEvents = events
    .filter((event) => {
      const isCurrentlySelected = formData.event_name === event.name;
      const searchLower = eventSearch.toLowerCase();
      const matchesSearch = event.name.toLowerCase().includes(searchLower);

      // 1. Toujours garder l'événement s'il est déjà sélectionné (sécurité édition)
      if (isCurrentlySelected) return matchesSearch;

      // 2. Préparer le filtre de date (-3 mois)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      const eventEnd = new Date(event.end_date || event.start_date);

      // 3. Déterminer si l'événement est valide temporellement
      // Est valide si : pas de date (permanent) OU date de fin >= il y a 3 mois
      const isDateValid =
        (!event.start_date && !event.end_date) || eventEnd >= threeMonthsAgo;

      // 4. On retourne vrai seulement si le texte correspond ET que la date est valide
      return matchesSearch && isDateValid;
    })
    .sort((a, b) => {
      // Tri : Permanents en premier, puis chronologique inverse
      if (!a.start_date && b.start_date) return -1;
      if (a.start_date && !b.start_date) return 1;
      return new Date(b.start_date) - new Date(a.start_date);
    });

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        {/* HEADER MODALE */}
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <h3 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900">
            {editingId ? 'ÉDITION' : 'NOUVELLE TÂCHE'}
          </h3>
          <div className="flex items-center gap-3">
            {editingId && (
              <button
                onClick={onDelete}
                className="p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={onSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Save size={18} /> ENREGISTRER
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form className="p-8 space-y-6 overflow-y-auto no-scrollbar pb-12">
          {/* TITRE */}
          <input
            required
            type="text"
            placeholder="TITRE DE LA MISSION..."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-5 border-2 border-slate-100 rounded-[1.25rem] font-black text-lg outline-none focus:border-indigo-500 uppercase placeholder:text-slate-300"
          />

          {/* NOTES */}
          <textarea
            placeholder="Notes et détails..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-5 border-2 border-slate-100 rounded-[1.25rem] h-32 outline-none focus:border-indigo-500 text-sm font-bold text-slate-600 resize-none"
          />

          {/* RESPONSABLES */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
              <Users size={14} /> Responsables
            </label>
            <div className="flex flex-wrap gap-2">
              {staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleAssignee(s.name)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                    formData.assignee?.includes(s.name)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-slate-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STATUT */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full p-4 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase bg-white outline-none text-indigo-600 cursor-pointer shadow-sm"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* PRIORITÉ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Priorité
              </label>
              <div className="flex gap-2">
                {[
                  {
                    id: 'high',
                    label: 'Urgent',
                    bg: 'bg-red-50 border-red-200 text-red-600',
                    active: 'bg-red-500 border-red-500 text-white',
                  },
                  {
                    id: 'medium',
                    label: 'Moyen',
                    bg: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                    active: 'bg-yellow-500 border-yellow-500 text-white',
                  },
                  {
                    id: 'low',
                    label: 'Bas',
                    bg: 'bg-slate-50 border-slate-200 text-slate-500',
                    active: 'bg-slate-400 border-slate-400 text-white',
                  },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.id })}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${
                      formData.priority === p.id ? p.active : p.bg
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ÉVÉNEMENT AVEC RECHERCHE FILTRÉE */}
            <div className="space-y-2 relative" ref={wrapperRef}>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                <Sparkles size={12} /> Événement / Organisation
              </label>

              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder={
                    formData.event_name || 'Chercher un événement...'
                  }
                  value={eventSearch}
                  onFocus={() => setShowEventList(true)}
                  onChange={(e) => {
                    setEventSearch(e.target.value);
                    setShowEventList(true);
                  }}
                  className="w-full pl-9 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase outline-none focus:border-indigo-500 placeholder:text-indigo-600 transition-all shadow-sm"
                />
              </div>

              {showEventList && (
                <div className="absolute top-full left-0 right-0 z-[110] mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl max-h-60 overflow-y-auto no-scrollbar py-2">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, event_name: '' });
                      setEventSearch('');
                      setShowEventList(false);
                    }}
                    className="px-4 py-2 text-[10px] font-black text-red-400 hover:bg-red-50 cursor-pointer uppercase border-b border-slate-50 mb-1"
                  >
                    -- Aucun lien --
                  </div>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => {
                          setFormData({ ...formData, event_name: event.name });
                          setEventSearch('');
                          setShowEventList(false);
                        }}
                        className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors ${
                          formData.event_name === event.name
                            ? 'bg-indigo-50'
                            : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black text-slate-700 uppercase">
                            {event.name}
                          </span>
                          {!event.start_date && (
                            <span className="text-[7px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                              Permanent
                            </span>
                          )}
                        </div>
                        {event.start_date && (
                          <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold mt-1 uppercase">
                            <Calendar size={8} />{' '}
                            {new Date(event.start_date).toLocaleDateString(
                              'fr-FR',
                              { month: 'short', year: 'numeric' }
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-[10px] text-slate-400 italic text-center uppercase">
                      Aucun événement récent trouvé
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">
                Début
              </span>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">
                Échéance
              </span>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* CATÉGORIES */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Catégories de mission
            </label>
            <div className="p-4 border-2 border-slate-100 rounded-[2rem] bg-white">
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      const current = formData.categories || [];
                      setFormData({
                        ...formData,
                        categories: current.includes(cat)
                          ? current.filter((c) => c !== cat)
                          : [...current, cat],
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all uppercase ${
                      formData.categories?.includes(cat)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 text-slate-400 border-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
