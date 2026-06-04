import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const CalendarView = ({ tasks, events = [], isAdmin, onEditClick }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // --- LOGIQUE COMMUNE ---
  const getDeadlineStatus = (deadline, status) => {
    if (status === 'done') return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (new Date(deadline) - now) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0)
      return { label: 'RETARD', class: 'bg-red-600 text-white border-red-700' };
    if (diffDays <= 7)
      return {
        label: 'PROCHE',
        class: 'bg-orange-500 text-white border-orange-600',
      };
    return null;
  };

  // Détection des événements pour un jour précis
  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter((event) => {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date || event.start_date); // Gestion si pas de date de fin
      const d = new Date(day);
      d.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });
  };

  // --- LOGIQUE MODE GRILLE (CALENDRIER) ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Ajustement pour commencer par Lundi
    const startingPoint = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startingPoint; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const changeMonth = (offset) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    );
  };

  // --- LOGIQUE MODE LISTE ---
  const tasksWithDeadlines = tasks
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const groupedByMonth = tasksWithDeadlines.reduce((acc, task) => {
    const date = new Date(task.deadline);
    const monthYear = date
      .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      .toUpperCase();
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(task);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full space-y-4 px-2 md:px-4 pb-20">
      {/* BARRE D'OUTILS CALENDRIER */}
      <div className="flex items-center justify-between bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-black text-slate-700 text-sm min-w-[140px] text-center uppercase tracking-tighter">
            {currentMonth.toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            <CalendarIcon size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* AFFICHAGE GRILLE CALENDRIER */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
              <div
                key={d}
                className="py-2 text-[10px] font-black text-slate-400 text-center uppercase tracking-widest"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 overflow-y-auto no-scrollbar">
            {getDaysInMonth(currentMonth).map((day, i) => {
              if (!day)
                return (
                  <div
                    key={`empty-${i}`}
                    className="border-b border-r border-slate-50 min-h-[100px] bg-slate-50/30"
                  />
                );

              const dayTasks = tasks.filter(
                (t) =>
                  t.deadline &&
                  new Date(t.deadline).toDateString() === day.toDateString()
              );
              const dayEvents = getEventsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={day.toISOString()}
                  className={`border-b border-r border-slate-100 min-h-[110px] p-1 transition-colors hover:bg-slate-50/50 ${
                    isToday ? 'bg-indigo-50/20' : ''
                  }`}
                >
                  <span
                    className={`inline-block w-6 h-6 text-center leading-6 text-[11px] font-black rounded-lg mb-1 ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  <div className="space-y-1">
                    {/* AFFICHAGE DES ÉVÉNEMENTS (Bannières) */}
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-[7px] px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-sm font-black uppercase truncate leading-tight flex items-center gap-0.5"
                        title={`Événement : ${event.name}`}
                      >
                        <Sparkles size={8} className="shrink-0" />
                        <span className="truncate">{event.name}</span>
                      </div>
                    ))}

                    {/* AFFICHAGE DES TÂCHES (Deadlines) */}
                    {dayTasks.map((t) => {
                      const status = getDeadlineStatus(t.deadline, t.status);
                      return (
                        <div
                          key={t.id}
                          onClick={() => isAdmin && onEditClick(t)}
                          className={`text-[8px] p-1 rounded-md font-bold truncate cursor-pointer shadow-sm border ${
                            status
                              ? status.class
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* AFFICHAGE MODE LISTE (Design historique) */
        <div className="space-y-6 overflow-y-auto no-scrollbar pb-10 text-left">
          {Object.entries(groupedByMonth).map(([month, monthTasks]) => (
            <div key={month} className="space-y-3">
              <h3 className="font-black text-indigo-900/40 text-[10px] tracking-widest uppercase pl-4 italic">
                {month}
              </h3>
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                {monthTasks.map((t) => {
                  const badge = getDeadlineStatus(t.deadline, t.status);
                  const date = new Date(t.deadline);
                  return (
                    <div
                      key={t.id}
                      onClick={() => isAdmin && onEditClick(t)}
                      className="p-4 border-b border-slate-50 hover:bg-slate-50 flex items-center gap-4 cursor-pointer transition-all"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[45px] h-[45px] bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] font-black text-indigo-400 uppercase leading-none">
                          {date.toLocaleDateString('fr-FR', {
                            weekday: 'short',
                          })}
                        </span>
                        <span className="text-base font-black text-slate-700 leading-tight">
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">
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
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                          {t.assignee?.join(' / ') || 'Libre'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
