import React, { useState } from 'react';

const STATUSES = [
  {
    id: 'todo',
    label: 'À faire',
    icon: '○',
    color: '#888780',
    bg: '#F1EFE8',
    border: '#888780',
  },
  {
    id: 'doing',
    label: 'En cours',
    icon: '◕',
    color: '#185FA5',
    bg: '#E6F1FB',
    border: '#378ADD',
  },
  {
    id: 'waiting',
    label: 'Attente',
    icon: '◷',
    color: '#854F0B',
    bg: '#FAEEDA',
    border: '#EF9F27',
  },
  {
    id: 'done',
    label: 'Terminé',
    icon: '●',
    color: '#3B6D11',
    bg: '#EAF3DE',
    border: '#639922',
  },
];

const PRIORITIES = {
  high: { label: 'Urgent', bg: '#FCEBEB', color: '#A32D2D' },
  medium: { label: 'Moyen', bg: '#FAEEDA', color: '#854F0B' },
  low: { label: 'Bas', bg: '#F1EFE8', color: '#5F5E5A' },
};

const StatusPicker = ({ currentStatus, taskId, onDrop, disabled }) => {
  const [open, setOpen] = useState(false);
  const current = STATUSES.find((s) => s.id === currentStatus) || STATUSES[0];

  if (disabled) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          padding: '3px 10px',
          borderRadius: 20,
          background: current.bg,
          color: current.color,
          border: `0.5px solid ${current.border}`,
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 13 }}>{current.icon}</span>
        {current.label}
      </span>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          padding: '3px 10px',
          borderRadius: 20,
          background: current.bg,
          color: current.color,
          border: `0.5px solid ${current.border}`,
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 13 }}>{current.icon}</span>
        {current.label}
        <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 998,
            }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '110%',
              left: 0,
              zIndex: 999,
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              minWidth: 140,
            }}
          >
            {STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onDrop(null, s.id, taskId);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: s.id === currentStatus ? 500 : 400,
                  color:
                    s.id === currentStatus
                      ? s.color
                      : 'var(--color-text-primary)',
                  background: s.id === currentStatus ? s.bg : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                }}
              >
                <span style={{ fontSize: 15, color: s.color }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PostItCard = ({ task, onDrop, onEditClick, isGuest, isAdmin }) => {
  const status = STATUSES.find((s) => s.id === task.status) || STATUSES[0];
  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;

  const isOverdue =
    task.deadline &&
    task.status !== 'done' &&
    new Date(task.deadline) < new Date();

  const isCloseSoon =
    task.deadline &&
    task.status !== 'done' &&
    !isOverdue &&
    Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)) <=
      7;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        })
      : null;

  return (
    <div
      draggable={!isGuest}
      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
      onClick={() => isAdmin && onEditClick(task)}
      style={{
        background: 'var(--color-background-primary)',
        borderRadius: 16,
        border: '0.5px solid var(--color-border-tertiary)',
        borderTop: `5px solid ${status.border}`,
        borderLeft: `2px solid ${status.border}40`,
        borderRight: `2px solid ${status.border}40`,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: isAdmin ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* BADGE RETARD */}
      {isOverdue && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: '#E24B4A',
            color: '#fff',
            fontSize: 9,
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: 20,
            letterSpacing: '0.05em',
          }}
        >
          RETARD
        </span>
      )}
      {isCloseSoon && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: '#EF9F27',
            color: '#fff',
            fontSize: 9,
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: 20,
          }}
        >
          BIENTÔT
        </span>
      )}

      {/* PRIORITÉ */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          padding: '2px 9px',
          borderRadius: 20,
          background: priority.bg,
          color: priority.color,
          width: 'fit-content',
        }}
      >
        {priority.label}
      </span>

      {/* TITRE */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          lineHeight: 1.45,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {task.title}
      </p>

      {/* DESCRIPTION */}
      {task.description && (
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </p>
      )}

      {/* ÉVÉNEMENT */}
      {task.event_name && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            fontWeight: 500,
            color: '#534AB7',
            background: '#EEEDFE',
            padding: '3px 9px',
            borderRadius: 20,
            width: 'fit-content',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: 11 }}>✦</span>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.event_name}
          </span>
        </div>
      )}

      {/* FOOTER : dates + assignés + statut */}
      <div
        style={{
          borderTop: '0.5px solid var(--color-border-tertiary)',
          paddingTop: 10,
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* DATES */}
        {(task.start_date || task.deadline) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {task.start_date && (
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 11 }}>▶</span>
                {formatDate(task.start_date)}
              </span>
            )}
            {task.start_date && task.deadline && (
              <span
                style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}
              >
                →
              </span>
            )}
            {task.deadline && (
              <span
                style={{
                  fontSize: 10,
                  color: isOverdue
                    ? '#A32D2D'
                    : isCloseSoon
                    ? '#854F0B'
                    : 'var(--color-text-tertiary)',
                  fontWeight: isOverdue || isCloseSoon ? 500 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 11 }}>⏱</span>
                {formatDate(task.deadline)}
              </span>
            )}
          </div>
        )}

        {/* ASSIGNÉS */}
        {task.assignee && task.assignee.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {task.assignee.map((name, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: 'var(--color-background-secondary)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 11 }}>◉</span> {name}
              </span>
            ))}
          </div>
        )}

        {/* STATUT PICKER */}
        <div
          style={{ display: 'flex', justifyContent: 'flex-end' }}
          onClick={(e) => e.stopPropagation()}
        >
          <StatusPicker
            currentStatus={task.status}
            taskId={task.id}
            onDrop={onDrop}
            disabled={isGuest || !isAdmin}
          />
        </div>
      </div>
    </div>
  );
};

const KanbanView = ({ tasks, onDrop, onEditClick, isGuest, isAdmin }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 18,
        padding: '4px 2px 80px',
      }}
    >
      {tasks.length === 0 ? (
        <div
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--color-text-tertiary)',
            fontSize: 14,
          }}
        >
          Aucune tâche à afficher
        </div>
      ) : (
        tasks.map((task) => (
          <PostItCard
            key={task.id}
            task={task}
            onDrop={onDrop}
            onEditClick={onEditClick}
            isGuest={isGuest}
            isAdmin={isAdmin}
          />
        ))
      )}
    </div>
  );
};

export default KanbanView;
