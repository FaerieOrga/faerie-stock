import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUSES = [
  { id: 'todo' },
  { id: 'doing' },
  { id: 'waiting' },
  { id: 'done' },
];

const TaskCard = ({ task, onDrop, onEditClick, isGuest, isAdmin }) => {
  return (
    <div
      draggable={!isGuest}
      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
      onClick={() => isAdmin && onEditClick(task)}
      className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3 relative group cursor-grab active:cursor-grabbing"
    >
      <div className="flex md:hidden justify-between items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const idx = STATUSES.findIndex((c) => c.id === task.status);
            if (idx > 0) onDrop(null, STATUSES[idx - 1].id, task.id);
          }}
          className={`p-2 rounded-full bg-slate-50 border border-slate-100 ${
            task.status === 'todo' ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <span className="text-[7px] font-black uppercase text-indigo-300 italic">
          Déplacer
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const idx = STATUSES.findIndex((c) => c.id === task.status);
            if (idx < STATUSES.length - 1)
              onDrop(null, STATUSES[idx + 1].id, task.id);
          }}
          className={`p-2 rounded-full bg-slate-50 border border-slate-100 ${
            task.status === 'done' ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
