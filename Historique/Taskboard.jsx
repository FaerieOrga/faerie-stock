import React, { useState, useEffect } from 'react';
import { ITEM_STATES } from '../../utils/constants';
import {
  Plus,
  Trash2,
  X,
  Save,
  Search,
  User,
  Calendar,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layout,
  Users,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const COLUMNS = [
  {
    id: 'todo',
    label: 'À Faire',
    color: 'bg-slate-100 border-t-4 border-t-slate-400',
  },
  {
    id: 'doing',
    label: 'En Cours',
    color: 'bg-blue-50 border-t-4 border-t-blue-500',
  },
  {
    id: 'waiting',
    label: 'En Attente',
    color: 'bg-orange-50 border-t-4 border-t-orange-400',
  },
  {
    id: 'done',
    label: 'Terminé',
    color: 'bg-green-50 border-t-4 border-t-green-500',
  },
];

const PRIORITIES = {
  high: { label: 'Urgent', color: 'bg-red-50 text-red-500 border-red-100' },
  medium: {
    label: 'Moyen',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  },
  low: { label: 'Bas', color: 'bg-slate-50 text-slate-500 border-slate-100' },
};

const CATEGORIES_LIST = [
  'Accessoire',
  'Arme',
  'Armure/Bouclier',
  'Autre',
  'Bibliothèque/Archives',
  'Bijoux/Parures',
  'Bivouac',
  'Bureau',
  'Chapeau/coiffe',
  'Compta/Tréso',
  'Communication',
  'Consommable',
  'Costume',
  'Craft',
  'Cuisine',
  'Déco/Décorum',
  'Documentation',
  'Élec/Son',
  'Éclairage',
  'Forge/Atelier',
  'Forgeron',
  'Grimoire/Livres',
  'Hygiène',
  'Infirmerie',
  'Jeu',
  'Logistique',
  'Maquillage/Prothèses',
  'Masque',
  'Monnaie/Économie',
  'Organisation',
  'Parking',
  'Outil',
  'Premiers soins',
  'Rangement',
  'Sécurité',
  'Signalétique',
  'Stockage',
  'Taverne/Auberge',
  'Véhicule',
].sort();

const TaskBoard = ({ isAdmin, isGuest }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
  const [newStaffName, setNewStaffName] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: [],
    deadline: '',
    start_date: '',
    event_name: '',
    categories: [],
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: t } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    const { data: s } = await supabase.from('staff').select('*').order('name');
    const { data: e } = await supabase.from('events').select('*').order('name');
    setTasks(t || []);
    setStaff(s || []);
    setEvents(e || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    setViewFilter('all');
  }, [activeTab]);

  // LOGIQUE DES BADGES DE TEMPS
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
        class: 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-200',
      };
    if (diffDays <= 7)
      return {
        label: 'PROCHE',
        icon: Clock,
        class: 'bg-orange-500 text-white shadow-lg shadow-orange-200',
      };
    return null;
  };

  const onDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const onDragOver = (e) => e.preventDefault();

  const onDrop = async (e, newStatus, manualTaskId = null) => {
    if (e) e.preventDefault();
    const taskId = manualTaskId || e.dataTransfer.getData('taskId');
    const taskToUpdate = tasks.find(
      (t) => t.id.toString() === taskId.toString()
    );
    if (!taskToUpdate) return;

    if (
      newStatus === 'done' &&
      taskToUpdate.event_name === 'OBJETS A REPARER' &&
      taskToUpdate.related_object_id
    ) {
      try {
        await supabase
          .from('objects')
          .update({ state: ITEM_STATES[2] })
          .eq('id', taskToUpdate.related_object_id);
        await supabase.from('tasks').delete().eq('id', taskId);
        fetchData();
        return;
      } catch (err) {
        console.error(err);
      }
    }
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);
    if (!error) fetchData();
  };

  const handleSubmitTask = async (e) => {
    if (e) e.preventDefault();
    const payload = {
      ...formData,
      assignee: Array.isArray(formData.assignee) ? formData.assignee : [],
    };
    if (editingId)
      await supabase.from('tasks').update(payload).eq('id', editingId);
    else await supabase.from('tasks').insert([payload]);
    setShowModal(false);
    setEditingId(null);
    fetchData();
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    await supabase.from('staff').insert([{ name: newStaffName.trim() }]);
    setNewStaffName('');
    fetchData();
  };

  const handleDeleteTask = async () => {
    if (!editingId || !window.confirm('Supprimer ?')) return;
    await supabase.from('tasks').delete().eq('id', editingId);
    setShowModal(false);
    setEditingId(null);
    fetchData();
  };

  const toggleAssignee = (name) => {
    const current = formData.assignee || [];
    setFormData({
      ...formData,
      assignee: current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name],
    });
  };

  const getFilteredTasks = () => {
    return tasks.filter((t) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        t.title?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        (t.assignee &&
          Array.isArray(t.assignee) &&
          t.assignee.some((a) => a.toLowerCase().includes(search))) ||
        (t.categories &&
          Array.isArray(t.categories) &&
          t.categories.some((cat) => cat.toLowerCase().includes(search))) ||
        t.event_name?.toLowerCase().includes(search);

      if (!matchesSearch) return false;
      return true;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 overflow-hidden text-left">
      {/* HEADER FIXE */}
      <div className="bg-white border-b shrink-0 z-20 shadow-sm p-4 space-y-4">
        <nav className="flex bg-slate-100 p-1 rounded-2xl max-w-xl">
          {[
            { id: 'tasks', label: 'TÂCHES', icon: Layout },
            { id: 'organizers', label: 'RESPONSABLES', icon: Users },
            { id: 'events_view', label: 'ÉVÉNEMENTS', icon: Sparkles },
            { id: 'category_task', label: 'CATÉGORIES', icon: Tag },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Chercher partout..."
              value={searchTerm}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none text-sm font-bold"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={viewFilter}
            onChange={(e) => setViewFilter(e.target.value)}
            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm"
          >
            <option value="all">VOIR TOUT</option>
            {activeTab === 'organizers' && [
              <option key="libre" value="LIBRE">
                LIBRE
              </option>,
              ...staff.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              )),
            ]}
            {activeTab === 'events_view' &&
              events.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name}
                </option>
              ))}
            {activeTab === 'category_task' &&
              CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
          {isAdmin && activeTab === 'tasks' && (
            <button
              onClick={() => {
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
              }}
              className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {activeTab === 'tasks' ? (
          <div className="flex gap-4 h-full overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
                className={`flex flex-col min-w-[85vw] md:min-w-[320px] rounded-[2rem] border-2 h-full shrink-0 snap-center ${col.color}`}
              >
                <div className="p-4 flex justify-between items-center bg-inherit rounded-t-[2rem]">
                  <h2 className="font-black uppercase text-[10px] text-slate-600 tracking-widest">
                    {col.label}
                  </h2>
                  <span className="bg-white/50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    {
                      getFilteredTasks().filter((t) => t.status === col.id)
                        .length
                    }
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
                  {getFilteredTasks()
                    .filter((t) => t.status === col.id)
                    .map((task) => {
                      const badge = getDeadlineBadge(
                        task.deadline,
                        task.status
                      );
                      return (
                        <div
                          key={task.id}
                          draggable={!isGuest}
                          onDragStart={(e) => onDragStart(e, task.id)}
                          onClick={() =>
                            isAdmin &&
                            (setEditingId(task.id),
                            setFormData({
                              ...task,
                              assignee: Array.isArray(task.assignee)
                                ? task.assignee
                                : [],
                            }),
                            setShowModal(true))
                          }
                          className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3 relative"
                        >
                          {badge && (
                            <div
                              className={`absolute -top-2 -right-1 flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black z-10 ${badge.class}`}
                            >
                              <badge.icon size={10} /> {badge.label}
                            </div>
                          )}
                          <span
                            className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase w-fit block ${
                              PRIORITIES[task.priority]?.color
                            }`}
                          >
                            {PRIORITIES[task.priority]?.label}
                          </span>
                          <h3 className="font-black text-slate-800 text-sm leading-tight">
                            {task.title}
                          </h3>
                          <div className="pt-2 border-t border-slate-50 space-y-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 italic">
                              <Calendar size={12} />
                              <span>
                                {task.deadline
                                  ? new Date(task.deadline).toLocaleDateString(
                                      'fr-FR'
                                    )
                                  : '??'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {task.assignee?.length > 0 ? (
                                task.assignee.map((name, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black border border-indigo-100 uppercase"
                                  >
                                    <User size={10} /> {name}
                                  </div>
                                ))
                              ) : (
                                <div className="text-[9px] font-black uppercase text-slate-300 italic">
                                  Libre
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {task.categories?.map((cat) => (
                                <span
                                  key={cat}
                                  className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                            {task.event_name && (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-indigo-50 text-indigo-500 text-[10px] font-black uppercase w-fit">
                                <Sparkles size={12} /> {task.event_name}
                              </div>
                            )}
                            {task.description && (
                              <div className="bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 text-[10px] text-slate-500 italic">
                                📝 {task.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* RESTAURATION DE LA COHÉRENCE UI POUR LES AUTRES VUES */
          <div className="flex flex-col gap-6 h-full pb-20">
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
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase"
                >
                  AJOUTER
                </button>
              </form>
            )}

            <div className="space-y-4 px-4">
              {/* LOGIQUE RESPONSABLES */}
              {activeTab === 'organizers' && (
                <>
                  {(viewFilter === 'all' || viewFilter === 'LIBRE') && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
                      <div className="bg-slate-50 px-6 py-3 border-b flex justify-between">
                        <h3 className="font-black text-xs uppercase text-slate-400">
                          👤 LIBRE / NON ASSIGNÉ
                        </h3>
                        <span className="bg-slate-200 text-slate-600 font-black px-3 py-1 rounded-full text-[10px]">
                          {
                            getFilteredTasks().filter(
                              (t) => !t.assignee || t.assignee.length === 0
                            ).length
                          }
                        </span>
                      </div>
                      {getFilteredTasks()
                        .filter((t) => !t.assignee || t.assignee.length === 0)
                        .map((t) => {
                          const badge = getDeadlineBadge(t.deadline, t.status);
                          return (
                            <div
                              key={t.id}
                              onClick={() =>
                                isAdmin &&
                                (setEditingId(t.id),
                                setFormData({ ...t, assignee: [] }),
                                setShowModal(true))
                              }
                              className="p-4 border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-slate-400 italic">
                                  {t.title}
                                </span>
                                {badge && (
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[7px] font-black ${badge.class}`}
                                  >
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 rounded-lg">
                                {COLUMNS.find((c) => c.id === t.status)?.label}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  {staff.map((s) => {
                    if (viewFilter !== 'all' && viewFilter !== s.name)
                      return null;
                    const stTasks = getFilteredTasks().filter((t) =>
                      t.assignee?.includes(s.name)
                    );
                    if (stTasks.length === 0 && viewFilter === 'all')
                      return null;
                    return (
                      <div
                        key={s.id}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6"
                      >
                        <div className="bg-indigo-50/30 px-6 py-3 border-b flex justify-between items-center">
                          <h3 className="font-black text-xs uppercase text-indigo-900">
                            👤 {s.name}
                          </h3>
                          <div className="flex gap-4 items-center">
                            <span className="bg-indigo-600 text-white font-black px-3 py-1 rounded-full text-[10px]">
                              {stTasks.length}
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
                                className="text-slate-300 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        {stTasks.map((t) => {
                          const badge = getDeadlineBadge(t.deadline, t.status);
                          return (
                            <div
                              key={t.id}
                              onClick={() =>
                                isAdmin &&
                                (setEditingId(t.id),
                                setFormData({
                                  ...t,
                                  assignee: Array.isArray(t.assignee)
                                    ? t.assignee
                                    : [],
                                }),
                                setShowModal(true))
                              }
                              className="p-4 border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-slate-700">
                                  {t.title}
                                </span>
                                {badge && (
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[7px] font-black ${badge.class}`}
                                  >
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 rounded-lg">
                                {COLUMNS.find((c) => c.id === t.status)?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}

              {/* LOGIQUE ÉVÉNEMENTS */}
              {activeTab === 'events_view' &&
                events.map((e) => {
                  if (viewFilter !== 'all' && viewFilter !== e.name)
                    return null;
                  const evTasks = getFilteredTasks().filter(
                    (t) => t.event_name === e.name
                  );
                  if (evTasks.length === 0 && viewFilter === 'all') return null;
                  return (
                    <div
                      key={e.id}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6"
                    >
                      <div className="bg-orange-50/30 px-6 py-3 border-b flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase text-orange-900">
                          ✨ {e.name}
                        </h3>
                        <span className="bg-orange-500 text-white font-black px-3 py-1 rounded-full text-[10px]">
                          {evTasks.length}
                        </span>
                      </div>
                      {evTasks.map((t) => {
                        const badge = getDeadlineBadge(t.deadline, t.status);
                        return (
                          <div
                            key={t.id}
                            onClick={() =>
                              isAdmin &&
                              (setEditingId(t.id),
                              setFormData({
                                ...t,
                                assignee: Array.isArray(t.assignee)
                                  ? t.assignee
                                  : [],
                              }),
                              setShowModal(true))
                            }
                            className="p-4 border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-700">
                                  {t.title}
                                </span>
                                {badge && (
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[7px] font-black ${badge.class}`}
                                  >
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 mt-1">
                                {t.assignee?.map((a) => (
                                  <span
                                    key={a}
                                    className="text-[8px] font-bold text-slate-400 uppercase"
                                  >
                                    @{a}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 rounded-lg">
                              {COLUMNS.find((c) => c.id === t.status)?.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

              {/* LOGIQUE CATÉGORIES */}
              {activeTab === 'category_task' && (
                <>
                  {(viewFilter === 'all' || viewFilter === 'SANS_CAT') && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
                      <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase text-slate-400">
                          🏷️ SANS CATÉGORIE
                        </h3>
                        <span className="bg-slate-200 text-slate-600 font-black px-3 py-1 rounded-full text-[10px]">
                          {
                            getFilteredTasks().filter(
                              (t) => !t.categories || t.categories.length === 0
                            ).length
                          }
                        </span>
                      </div>
                      {getFilteredTasks()
                        .filter(
                          (t) => !t.categories || t.categories.length === 0
                        )
                        .map((t) => {
                          const badge = getDeadlineBadge(t.deadline, t.status);
                          return (
                            <div
                              key={t.id}
                              onClick={() =>
                                isAdmin &&
                                (setEditingId(t.id),
                                setFormData({
                                  ...t,
                                  assignee: Array.isArray(t.assignee)
                                    ? t.assignee
                                    : [],
                                }),
                                setShowModal(true))
                              }
                              className="p-4 border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-slate-700">
                                  {t.title}
                                </span>
                                {badge && (
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[7px] font-black ${badge.class}`}
                                  >
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 rounded-lg">
                                {COLUMNS.find((c) => c.id === t.status)?.label}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  {CATEGORIES_LIST.map((cat) => {
                    if (viewFilter !== 'all' && viewFilter !== cat) return null;
                    const catTasks = getFilteredTasks().filter((t) =>
                      t.categories?.includes(cat)
                    );
                    if (catTasks.length === 0 && viewFilter === 'all')
                      return null;
                    return (
                      <div
                        key={cat}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6"
                      >
                        <div className="bg-purple-50/30 px-6 py-3 border-b flex justify-between items-center">
                          <h3 className="font-black text-xs uppercase text-purple-900 italic tracking-wider">
                            🏷️ {cat}
                          </h3>
                          <span className="bg-purple-600 text-white font-black px-3 py-1 rounded-full text-[10px]">
                            {catTasks.length}
                          </span>
                        </div>
                        {catTasks.map((t) => {
                          const badge = getDeadlineBadge(t.deadline, t.status);
                          return (
                            <div
                              key={t.id}
                              onClick={() =>
                                isAdmin &&
                                (setEditingId(t.id),
                                setFormData({
                                  ...t,
                                  assignee: Array.isArray(t.assignee)
                                    ? t.assignee
                                    : [],
                                }),
                                setShowModal(true))
                              }
                              className="p-4 border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                            >
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-700">
                                    {t.title}
                                  </span>
                                  {badge && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[7px] font-black ${badge.class}`}
                                    >
                                      {badge.label}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                  {t.assignee?.join(' / ') || 'LIBRE'}
                                </span>
                              </div>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                                  COLUMNS.find((c) => c.id === t.status)?.color
                                }`}
                              >
                                {COLUMNS.find((c) => c.id === t.status)?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALE D'ÉDITION MULTI-ASSIGNATION */}
      {showModal && !isGuest && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <h3 className="font-black text-2xl uppercase italic text-slate-900">
                ÉDITION
              </h3>
              <div className="flex items-center gap-3">
                {editingId && (
                  <button
                    onClick={handleDeleteTask}
                    className="p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button
                  onClick={handleSubmitTask}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center gap-2"
                >
                  <Save size={18} /> ENREGISTRER
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2.5 bg-slate-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <form className="p-8 space-y-6 overflow-y-auto no-scrollbar pb-12">
              <input
                required
                type="text"
                placeholder="TITRE..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-5 border-2 rounded-[1.25rem] font-black text-lg outline-none focus:border-indigo-500 uppercase"
              />
              <textarea
                placeholder="Notes..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-5 border-2 rounded-[1.25rem] h-32 outline-none focus:border-indigo-500 text-sm font-bold text-slate-600"
              />
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
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
                          : 'bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-4 border-2 rounded-2xl font-black text-xs uppercase outline-none text-indigo-600"
                >
                  {COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label.toUpperCase()}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.event_name}
                  onChange={(e) =>
                    setFormData({ ...formData, event_name: e.target.value })
                  }
                  className="w-full p-4 border-2 rounded-2xl font-black text-xs uppercase outline-none text-indigo-600"
                >
                  <option value="">-- ÉVÉNEMENT --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="p-4 border-2 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="p-4 border-2 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div className="p-4 border-2 rounded-[2rem] bg-white">
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
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
