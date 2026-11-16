import React, { useEffect, useState } from 'react';
import { History, ArrowRight } from 'lucide-react';
import { fetchCrateHistory } from '../../utils/crateHistory';

const crateLabel = (n) => (Number(n) === 0 ? 'Vrac' : `Caisse ${n}`);

/** Derniers changements de caisse d'un objet */
const CrateHistory = ({ objectId, refreshKey }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchCrateHistory(objectId).then(({ data, error }) => {
      if (!alive) return;
      setRows(data);
      setUnavailable(!!error);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [objectId, refreshKey]);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 text-left">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
        <History size={14} /> Historique des caisses
      </h3>
      {loading ? (
        <p className="text-xs text-slate-400">Chargement…</p>
      ) : unavailable ? (
        <p className="text-xs text-slate-400">Historique indisponible.</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-slate-400">
          Aucun déplacement enregistré pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                {crateLabel(r.from_crate)}
                <ArrowRight size={14} className="text-slate-300" />
                {crateLabel(r.to_crate)}
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(r.created_at).toLocaleString('fr-FR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
                {r.reason ? ` · ${r.reason}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CrateHistory;
