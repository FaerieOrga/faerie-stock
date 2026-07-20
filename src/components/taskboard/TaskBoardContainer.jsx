import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { ITEM_STATES } from '../../utils/constants';

// Import des sous-composants
import TaskFilters from './TaskFilters';
import KanbanView from './KanbanView';
import ListView from './ListView';
import TaskModal from './TaskModal';
import CalendarView from './CalendarView';

const TaskBoardContainer = ({ isAdmin, isGuest, categories = [] }) => {
  // --- ÉTATS DES DONNÉES ---
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS UI ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
  const [newStaffName, setNewStaffName] = useState('');
  const [sortBy, setSortBy] = useState('urgency');

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
    related_object_id: null,
  });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: t } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: s } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      const { data: e } = await supabase
        .from('events')
        .select('*')
        .order('name');
      setTasks(t || []);
      setStaff(s || []);
      setEvents(e || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- POLLING TASKBOARD (30s) ---
  useEffect(() => {
    const INTERVAL_MS = 30_000;

    const tick = () => {
      if (!document.hidden) fetchData();
    };

    const timer = setInterval(tick, INTERVAL_MS);

    const onVisibilityChange = () => {
      if (!document.hidden) fetchData();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setViewFilter('all');
  }, [activeTab]);

  // --- LOGIQUE FILTRAGE & TRI ---
  const getFilteredTasks = () => {
    let filtered = tasks.filter((t) => {
      const search = searchTerm.toLowerCase();
      return (
        t.title?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        (Array.isArray(t.assignee) &&
          t.assignee.some((a) => a.toLowerCase().includes(search))) ||
        (Array.isArray(t.categories) &&
          t.categories.some((cat) => cat.toLowerCase().includes(search))) ||
        t.event_name?.toLowerCase().includes(search)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'alpha')
        return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'urgency') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return 0;
    });
  };

  // --- AUTOMATISATION STOCK & RÉPARATION ---
  const handleTaskCompletion = async (task, newStatus) => {
    if (newStatus !== 'done') return false;

    // Détection si c'est une tâche nécessitant automatisation
    const isStockTask =
      task.title?.toUpperCase().startsWith('[STOCK]') &&
      task.related_request_id;
    const isRepairTask =
      task.event_name === 'OBJETS A REPARER' && task.related_object_id;

    if (!isStockTask && !isRepairTask) return false;

    // --- POPUP DE VALIDATION ---
    const message = isStockTask
      ? `Confirmer la réception et l'ajout au stock pour : ${task.title} ?`
      : `Confirmer la réparation terminée de l'objet ? Il sera remis en état "Correct".`;

    if (!window.confirm(message)) {
      return 'CANCELLED'; // Signal spécifique pour l'annulation
    }

    // 1. CAS : STOCK
    if (isStockTask) {
      try {
        const { data: request } = await supabase
          .from('stock_requests')
          .select('*')
          .eq('id', task.related_request_id)
          .single();
        if (!request) return false;

        if (request.is_new_object) {
          const { error: insertError } = await supabase.from('objects').insert([
            {
              name: request.object_name,
              quantity: request.quantity,
              crate: parseInt(request.target_crate) || 0,
              category: Array.isArray(request.categories)
                ? request.categories[0]
                : request.categories,
              state: 'Neuf',
              notes: `Généré via tâche : ${task.title}`,
            },
          ]);
          if (insertError) throw insertError;
        } else {
          const { data: exObj } = await supabase
            .from('objects')
            .select('quantity')
            .eq('id', request.existing_object_id)
            .single();
          const { error: updateError } = await supabase
            .from('objects')
            .update({ quantity: (exObj?.quantity || 0) + request.quantity })
            .eq('id', request.existing_object_id);
          if (updateError) throw updateError;
        }
        await supabase
          .from('stock_requests')
          .update({ status: 'termine' })
          .eq('id', request.id);
        await supabase.from('tasks').delete().eq('id', task.id);
        alert(`✅ Stock mis à jour !`);
        return true;
      } catch (err) {
        console.error(err);
        alert(`❌ Échec de la mise à jour du stock : ${err.message}. La tâche reste en cours.`);
        return 'ERROR';
      }
    }

    // 2. CAS : RÉPARATION
    if (isRepairTask) {
      try {
        await supabase
          .from('objects')
          .update({ state: ITEM_STATES[2] }) // État "Correct"
          .eq('id', task.related_object_id);
        await supabase.from('tasks').delete().eq('id', task.id);
        alert(`✅ Objet réparé !`);
        return true;
      } catch (err) {
        console.error(err);
        alert(`❌ Échec de la réparation : ${err.message}. La tâche reste en cours.`);
        return 'ERROR';
      }
    }
    return false;
  };

  // --- GESTION DES ACTIONS ---
  const onDrop = async (e, newStatus, manualTaskId = null) => {
    if (e) e.preventDefault();
    const taskId = manualTaskId || e.dataTransfer.getData('taskId');
    const taskToUpdate = tasks.find(
      (t) => t.id.toString() === taskId.toString()
    );
    if (!taskToUpdate) return;

    const automationResult = await handleTaskCompletion(
      taskToUpdate,
      newStatus
    );

    if (automationResult === 'CANCELLED' || automationResult === 'ERROR') {
      // Si annulé ou en échec, on ne fait rien (la tâche reste dans sa colonne d'origine)
      return;
    }

    if (automationResult === true) {
      fetchData();
    } else {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      if (!error) fetchData();
    }
  };

  const handleSubmitTask = async (e) => {
    if (e) e.preventDefault();

    const payload = {
      ...formData,
      assignee: Array.isArray(formData.assignee) ? formData.assignee : [],
    };

    try {
      if (formData.status === 'done') {
        const automationResult = await handleTaskCompletion(
          { ...payload, id: editingId },
          'done'
        );

        if (automationResult === 'CANCELLED' || automationResult === 'ERROR') {
          // Si annulé ou en échec, on ne ferme pas la modale ni ne marque la tâche terminée
          return;
        }

        if (automationResult === true) {
          setShowModal(false);
          setEditingId(null);
          fetchData();
          return;
        }
      }

      if (editingId) {
        await supabase.from('tasks').update(payload).eq('id', editingId);
      } else {
        await supabase.from('tasks').insert([payload]);
      }

      setShowModal(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la tâche:', err);
    }
  };

  // ... (le reste du composant handleEditClick, handleAddStaff et le return restent identiques)
  const handleEditClick = (task) => {
    if (!isAdmin) return;
    setEditingId(task.id);
    setFormData({
      ...task,
      assignee: Array.isArray(task.assignee) ? task.assignee : [],
    });
    setShowModal(true);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    await supabase.from('staff').insert([{ name: newStaffName.trim() }]);
    setNewStaffName('');
    fetchData();
  };

  return (
    <div className="flex flex-col bg-slate-50 text-left relative">
      <div className="flex-none z-20 bg-white border-b border-slate-200">
        <TaskFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewFilter={viewFilter}
          setViewFilter={setViewFilter}
          staff={staff}
          events={events}
          tasks={tasks}
          categories={categories}
          isAdmin={isAdmin}
          setShowModal={setShowModal}
          setEditingId={setEditingId}
          setFormData={setFormData}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      <div className="p-4 bg-slate-50 pb-32">
        {activeTab === 'tasks' ? (
          <KanbanView
            tasks={getFilteredTasks()}
            onDrop={onDrop}
            onEditClick={handleEditClick}
            isGuest={isGuest}
            isAdmin={isAdmin}
          />
        ) : activeTab === 'calendar' ? (
          <CalendarView
            tasks={getFilteredTasks()}
            isAdmin={isAdmin}
            events={events}
            onEditClick={handleEditClick}
          />
        ) : (
          <ListView
            activeTab={activeTab}
            tasks={getFilteredTasks()}
            staff={staff}
            events={events}
            viewFilter={viewFilter}
            isAdmin={isAdmin}
            onEditClick={handleEditClick}
            handleAddStaff={handleAddStaff}
            newStaffName={newStaffName}
            setNewStaffName={setNewStaffName}
            fetchData={fetchData}
          />
        )}
      </div>

      {showModal && !isGuest && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden">
          <div className="h-[env(safe-area-inset-top)] bg-white w-full flex-none" />
          <div className="flex-1 overflow-hidden relative">
            <TaskModal
              editingId={editingId}
              formData={formData}
              setFormData={setFormData}
              staff={staff}
              events={events}
              onClose={() => {
                setShowModal(false);
                setEditingId(null);
              }}
              onSubmit={handleSubmitTask}
              onDelete={async () => {
                if (window.confirm('Supprimer ?')) {
                  await supabase.from('tasks').delete().eq('id', editingId);
                  setShowModal(false);
                  fetchData();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoardContainer;