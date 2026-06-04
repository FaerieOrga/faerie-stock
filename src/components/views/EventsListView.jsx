import React, { useState } from 'react';
import {
  Package,
  ClipboardList,
  ChevronRight,
  Search,
  Plus,
  Calendar,
  Edit2,
  X,
  Layers,
} from 'lucide-react';
import { supabase } from '../../api/supabase';
import AddEventForm from '../forms/AddEventForm';

// --- MODALE DE MODIFICATION COMPLÈTE ---
const EditEventModal = ({ onClose, onSubmit, initialData }) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const [formData, setFormData] = useState({
    id: initialData.id,
    name: initialData.name,
    start_date: formatDateForInput(initialData.start_date),
    end_date: formatDateForInput(initialData.end_date),
    display_mode: initialData.display_mode || 'logistics',
  });

  const isLogistics = formData.display_mode === 'logistics';

  const handleLocalSubmit = () => {
    if (!formData.name) return alert('Le nom est obligatoire');

    // Validation des dates si mode logistique
    if (isLogistics && formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        return alert(
          'La date de fin ne peut pas être antérieure à la date de début'
        );
      }
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 text-left">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black uppercase italic text-slate-800 tracking-tighter">
            Modifier l'Événement
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* NOM */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">
              Nom
            </label>
            <input
              type="text"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* TYPE D'AFFICHAGE */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest ml-1">
              Type d'organisation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, display_mode: 'logistics' })
                }
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  isLogistics
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                <Package size={24} />
                <span className="text-[10px] font-black uppercase">
                  Logistique
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, display_mode: 'kanban' })
                }
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  !isLogistics
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-500'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                <ClipboardList size={24} />
                <span className="text-[10px] font-black uppercase">
                  Organisation
                </span>
              </button>
            </div>
          </div>

          {/* DATES (Conditionnel) */}
          {isLogistics && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                  Début
                </label>
                <input
                  type="date"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
                  Fin
                </label>
                <input
                  type="date"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <button
            onClick={handleLocalSubmit}
            className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

// --- VUE PRINCIPALE ---
const EventsListView = ({
  events,
  onSelectEvent,
  isAdmin,
  fetchData,
  onAddEvent,
}) => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const now = new Date();

  const handleUpdate = async (data) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: data.name,
          start_date:
            data.display_mode === 'logistics' ? data.start_date : null,
          end_date: data.display_mode === 'logistics' ? data.end_date : null,
          display_mode: data.display_mode,
        })
        .eq('id', data.id);

      if (error) throw error;
      setEditingEvent(null);
      if (fetchData) await fetchData();
    } catch (err) {
      alert('Erreur lors de la mise à jour : ' + err.message);
    }
  };

  const filteredAndSortedEvents = events
    .filter((ev) => {
      const isPast = ev.end_date && new Date(ev.end_date) < now;
      const matchesSearch = ev.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const isLogistics = ev.display_mode === 'logistics' || !ev.display_mode;
      const matchesTab =
        activeTab === 'active'
          ? isLogistics
            ? !ev.end_date || !isPast
            : true
          : isLogistics && ev.end_date && isPast;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (a.display_mode !== b.display_mode)
        return a.display_mode === 'logistics' ? -1 : 1;
      const dateA = a.start_date
        ? new Date(a.start_date)
        : activeTab === 'active'
        ? new Date('9999-12-31')
        : new Date('1970-01-01');
      const dateB = b.start_date
        ? new Date(b.start_date)
        : activeTab === 'active'
        ? new Date('9999-12-31')
        : new Date('1970-01-01');
      return activeTab === 'active' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 min-h-screen bg-slate-50">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={18} /> Nouveau
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-1 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'active'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-400'
          }`}
        >
          Actifs
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`pb-2 px-1 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'archived'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-400'
          }`}
        >
          Historique
        </button>
      </div>

      <div className="space-y-3">
        {filteredAndSortedEvents.map((ev) => {
          const isKanban = ev.display_mode === 'kanban';
          return (
            <div
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isKanban
                    ? 'bg-emerald-50 text-emerald-500'
                    : 'bg-indigo-50 text-indigo-500'
                }`}
              >
                {isKanban ? <ClipboardList size={24} /> : <Package size={24} />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter truncate">
                    {ev.name}
                  </h3>
                </div>
                {!isKanban ? (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Calendar size={12} />
                    {ev.start_date
                      ? `${new Date(
                          ev.start_date
                        ).toLocaleDateString()} > ${new Date(
                          ev.end_date
                        ).toLocaleDateString()}`
                      : 'Pas de dates'}
                  </div>
                ) : (
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    Tableau Kanban
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEvent(ev);
                  }}
                  className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <ChevronRight
                  size={20}
                  className="text-slate-200 group-hover:text-indigo-300 transition-colors"
                />
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <AddEventForm
          onCancel={() => setShowAddModal(false)}
          onAdd={async (data) => {
            console.log('donnés recues de la modale');
            if (onAddEvent) {
              console.log('Appel de la fonction parente (App.js)...');
              await onAddEvent(data); // C'EST ICI QUE CA BLOQUAIT
            } else {
              console.error(
                '❌ ERREUR : La prop onAddEvent est undefined dans EventsListView'
              );
            }
            setShowAddModal(false);
          }}
        />
      )}

      {editingEvent && (
        <EditEventModal
          initialData={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
};

export default EventsListView;
