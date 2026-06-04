import React from 'react';
import { Trash2, AlertCircle, Clock, User, Sparkles, Tag } from 'lucide-react';
import { supabase } from '../../api/supabase';
// Import de la constante centralisée
import { CATEGORIES as CATEGORIES_LIST } from '../../utils/constants';

const COLUMNS = [
  {
    id: 'todo',
    label: 'À Faire',
    color: 'bg-slate-100 border-slate-200 text-slate-600',
  },
  {
    id: 'doing',
    label: 'En Cours',
    color: 'bg-blue-50 border-blue-100 text-blue-600',
  },
  {
    id: 'waiting',
    label: 'En Attente',
    color: 'bg-orange-50 border-orange-100 text-orange-600',
  },
  {
    id: 'done',
    label: 'Terminé',
    color: 'bg-green-50 border-green-100 text-green-600',
  },
];

const ListView = ({
  activeTab,
  tasks,
  staff,
  events,
  viewFilter,
  isAdmin,
  onEditClick,
  handleAddStaff,
  newStaffName,
  setNewStaffName,
  fetchData,
}) => {
  const getDeadlineBadge = (deadline, status) => {
    if (!deadline || status === 'done') return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDate = new Date(deadline);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return {
        label: 'RETARD',
        icon: AlertCircle,
        class: 'bg-red-600 text-white animate-pulse shadow-sm shadow-red-100',
      };
    if (diffDays <= 7)
      return {
        label: 'PROCHE',
        icon: Clock,
        class: 'bg-orange-500 text-white shadow-sm shadow-orange-100',
      };
    return null;
  };

  const renderTaskRow = (task) => {
    const badge = getDeadlineBadge(task.deadline, task.status);
    const colInfo = COLUMNS.find((c) => c.id === task.status);

    return (
      <div
        key={task.id}
        onClick={() => isAdmin && onEditClick(task)}
        className="p-4 border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center cursor-pointer transition-colors"
      >
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-sm ${
                task.status === 'todo' && !task.assignee?.length
                  ? 'text-slate-400 italic'
                  : 'text-slate-700'
              }`}
            >
              {task.title}
            </span>
            {badge && (
              <span
                className={`px-2 py-0.5 rounded-md text-[7px] font-black flex items-center gap-1 ${badge.class}`}
              >
                <badge.icon size={8} /> {badge.label}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-1">
            {task.assignee?.map((a) => (
              <span
                key={a}
                className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider"
              >
                @{a}
              </span>
            ))}
            {task.deadline && (
              <span className="text-[8px] text-slate-400 font-medium italic">
                Échéance : {new Date(task.deadline).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>
        <span
          className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${colInfo?.color}`}
        >
          {colInfo?.label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-20">
      {/* FORMULAIRE AJOUT STAFF */}
      {isAdmin && activeTab === 'organizers' && (
        <form
          onSubmit={handleAddStaff}
          className="flex gap-2 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm w-fit mx-4"
        >
          <input
            type="text"
            placeholder="NOM DU RESPONSABLE..."
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black outline-none border-2 border-transparent focus:border-indigo-500 uppercase"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-indigo-700 transition-all"
          >
            AJOUTER
          </button>
        </form>
      )}

      <div className="space-y-4 px-4">
        {/* VUE RESPONSABLES */}
        {activeTab === 'organizers' && (
          <>
            {(viewFilter === 'all' || viewFilter === 'LIBRE') && (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6 text-left">
                <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                  <h3 className="font-black text-xs uppercase text-slate-400 flex items-center gap-2">
                    <User size={14} /> LIBRE / NON ASSIGNÉ
                  </h3>
                  <span className="bg-slate-200 text-slate-600 font-black px-3 py-1 rounded-full text-[10px]">
                    {
                      tasks.filter(
                        (t) => !t.assignee || t.assignee.length === 0
                      ).length
                    }
                  </span>
                </div>
                {tasks
                  .filter((t) => !t.assignee || t.assignee.length === 0)
                  .map(renderTaskRow)}
              </div>
            )}
            {staff.map((s) => {
              if (viewFilter !== 'all' && viewFilter !== s.name) return null;
              const groupTasks = tasks.filter((t) =>
                t.assignee?.includes(s.name)
              );
              if (groupTasks.length === 0 && viewFilter === 'all') return null;
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6 text-left"
                >
                  <div className="bg-indigo-50/30 px-6 py-3 border-b flex justify-between items-center">
                    <h3 className="font-black text-xs uppercase text-indigo-900 flex items-center gap-2">
                      <User size={14} /> {s.name}
                    </h3>
                    <div className="flex gap-4 items-center">
                      <span className="bg-indigo-600 text-white font-black px-3 py-1 rounded-full text-[10px]">
                        {groupTasks.length}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Supprimer ?')) {
                              await supabase
                                .from('staff')
                                .delete()
                                .eq('id', s.id);
                              fetchData();
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {groupTasks.map(renderTaskRow)}
                </div>
              );
            })}
          </>
        )}

        {/* VUE ÉVÉNEMENTS */}
        {activeTab === 'events_view' &&
          events.map((e) => {
            if (viewFilter !== 'all' && viewFilter !== e.name) return null;
            const groupTasks = tasks.filter((t) => t.event_name === e.name);
            if (groupTasks.length === 0 && viewFilter === 'all') return null;
            return (
              <div
                key={e.id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6 text-left"
              >
                <div className="bg-orange-50/30 px-6 py-3 border-b flex justify-between items-center">
                  <h3 className="font-black text-xs uppercase text-orange-900 flex items-center gap-2">
                    <Sparkles size={14} /> {e.name}
                  </h3>
                  <span className="bg-orange-500 text-white font-black px-3 py-1 rounded-full text-[10px]">
                    {groupTasks.length}
                  </span>
                </div>
                {groupTasks.map(renderTaskRow)}
              </div>
            );
          })}

        {/* VUE CATÉGORIES */}
        {activeTab === 'category_task' && (
          <>
            {(viewFilter === 'all' || viewFilter === 'SANS_CAT') && (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6 text-left">
                <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                  <h3 className="font-black text-xs uppercase text-slate-400 flex items-center gap-2">
                    <Tag size={14} /> SANS CATÉGORIE
                  </h3>
                  <span className="bg-slate-200 text-slate-600 font-black px-3 py-1 rounded-full text-[10px]">
                    {
                      tasks.filter(
                        (t) => !t.categories || t.categories.length === 0
                      ).length
                    }
                  </span>
                </div>
                {tasks
                  .filter((t) => !t.categories || t.categories.length === 0)
                  .map(renderTaskRow)}
              </div>
            )}
            {CATEGORIES_LIST.map((cat) => {
              if (viewFilter !== 'all' && viewFilter !== cat) return null;
              const groupTasks = tasks.filter((t) =>
                t.categories?.includes(cat)
              );
              if (groupTasks.length === 0 && viewFilter === 'all') return null;
              return (
                <div
                  key={cat}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6 text-left"
                >
                  <div className="bg-purple-50/30 px-6 py-3 border-b flex justify-between items-center">
                    <h3 className="font-black text-xs uppercase text-purple-900 italic tracking-wider flex items-center gap-2">
                      <Tag size={14} /> {cat}
                    </h3>
                    <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-full text-[10px]">
                      {groupTasks.length}
                    </span>
                  </div>
                  {groupTasks.map(renderTaskRow)}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default ListView;
