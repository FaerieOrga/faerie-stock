import React from 'react';
import {
  Search,
  Layout,
  Users,
  Sparkles,
  Tag,
  Plus,
  Calendar,
} from 'lucide-react';
import { CATEGORIES as CATEGORIES_LIST } from '../../utils/constants';

const TaskFilters = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  viewFilter,
  sortBy,
  setSortBy,
  setViewFilter,
  staff,
  events,
  isAdmin,
  setShowModal,
  setEditingId,
  setFormData,
}) => {
  const handleAddNewTask = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      categories: [],
      priority: 'medium',
      assignee: [],
    });
    setShowModal(true);
  };

  return (
    <div className="bg-white border-b shrink-0 z-20 shadow-sm p-4 space-y-4">
      {/* NAVIGATION PAR ONGLETS */}
      <nav className="flex bg-slate-100 p-1 rounded-2xl">
        {[
          { id: 'tasks', label: 'Tâches', icon: Layout },
          { id: 'organizers', label: 'Responsables', icon: Users },
          { id: 'events_view', label: 'Événements', icon: Sparkles },
          { id: 'calendar', label: 'Calendrier', icon: Calendar },
          { id: 'category_task', label: 'Catégories', icon: Tag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={15} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* BARRE DE RECHERCHE ET FILTRES DYNAMIQUES */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Chercher partout (titre, responsable, catégorie...)"
            value={searchTerm}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none text-sm font-bold placeholder:text-slate-400 focus:bg-slate-200 transition-colors"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'tasks' ? (
          /* SYSTÈME DE TRI (Uniquement pour le Kanban) */
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            <option value="urgency">▲ TRI : URGENCE</option>
            <option value="deadline">📅 TRI : ÉCHÉANCE</option>
            <option value="alpha">A-Z TRI : NOM</option>
          </select>
        ) : (
          <select
            value={viewFilter}
            onChange={(e) => setViewFilter(e.target.value === '' ? 'all' : e.target.value)}
            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors"
          >
            {activeTab === 'organizers' && [
              <option key="libre" value="LIBRE">
                LIBRE / NON ASSIGNÉ
              </option>,
              ...staff.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name.toUpperCase()}
                </option>
              )),
            ]}
            {activeTab === 'events_view' && [
              <option key="all" value="">TOUS LES ÉVÉNEMENTS</option>,
              ...events.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name.toUpperCase()}
                </option>
              ))
            ]}
            {activeTab === 'category_task' &&
              CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
          </select>
        )}

        {/* BOUTON AJOUT RAPIDE (UNIQUEMENT VUE TÂCHES) */}
        {isAdmin && activeTab === 'tasks' && (
          <button
            onClick={handleAddNewTask}
            className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
            title="Nouvelle tâche"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;