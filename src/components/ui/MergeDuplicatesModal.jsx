import React, { useState } from 'react';
import { X, Loader2, Merge, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../../api/supabase';

/** Clé d'identité : même nom (sans tenir compte de la casse ni des espaces) et même état */
export const sameObjectKey = (o) =>
  `${(o.name || '').trim().toLowerCase()}|${o.state || ''}`;

export const findDuplicates = (object, objects = []) =>
  objects.filter(
    (o) =>
      Number(o.id) !== Number(object.id) &&
      sameObjectKey(o) === sameObjectKey(object)
  );

/**
 * Regroupe des fiches identiques dans la fiche courante :
 * les quantités s'additionnent, les liens (locations, événements, tâches,
 * demandes d'achat) sont repointés vers la fiche courante, puis les autres fiches sont supprimées.
 */
const MergeDuplicatesModal = ({ object, duplicates, onClose, onDone }) => {
  const [selected, setSelected] = useState(duplicates.map((d) => d.id));
  const [saving, setSaving] = useState(false);

  const toMerge = duplicates.filter((d) => selected.includes(d.id));
  const newQty =
    (Number(object.quantity) || 0) +
    toMerge.reduce((acc, d) => acc + (Number(d.quantity) || 0), 0);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleConfirm = async () => {
    if (toMerge.length === 0) return;
    if (
      !window.confirm(
        `Regrouper ${toMerge.length} fiche(s) dans celle-ci (caisse ${
          object.crate || 0
        }) ? Les autres fiches seront supprimées.`
      )
    )
      return;

    setSaving(true);
    const ids = toMerge.map((d) => d.id);
    try {
      // 1. Repointer les références vers la fiche conservée
      const relinks = [
        ['rental_items', 'object_id'],
        ['event_objects', 'object_id'],
        ['tasks', 'related_object_id'],
        ['stock_requests', 'existing_object_id'],
      ];
      for (const [table, column] of relinks) {
        const { error } = await supabase
          .from(table)
          .update({ [column]: object.id })
          .in(column, ids);
        if (error)
          throw new Error(
            `Mise à jour de ${table} impossible (${error.message}). Rien n'a été supprimé.`
          );
      }

      // 2. Additionner les quantités sur la fiche conservée
      const { error: updateError } = await supabase
        .from('objects')
        .update({ quantity: newQty })
        .eq('id', object.id);
      if (updateError) throw updateError;

      // 3. Supprimer les fiches regroupées
      const { error: deleteError } = await supabase
        .from('objects')
        .delete()
        .in('id', ids);
      if (deleteError) {
        alert(
          `La quantité a été regroupée (${newQty}), mais les autres fiches n'ont pas pu être supprimées (${deleteError.message}). Supprimez-les à la main.`
        );
      }

      await onDone?.();
      onClose();
    } catch (err) {
      alert(`Erreur lors du regroupement : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-900/50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Merge size={20} className="text-blue-600" /> Regrouper
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Fiches « {object.name} » à l'état {object.state || '—'}. Les fiches
          cochées sont fusionnées dans celle-ci, qui reste dans la caisse{' '}
          {object.crate || 0}.
        </p>

        <div className="p-3 mb-2 rounded-xl bg-blue-50 border border-blue-100 flex justify-between text-sm font-bold text-blue-700">
          <span>Cette fiche · caisse {object.crate || 0}</span>
          <span>{object.quantity}</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {duplicates.map((d) => {
            const on = selected.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggle(d.id)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-bold transition-all ${
                  on
                    ? 'border-blue-300 bg-white text-slate-700'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  {on ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : (
                    <Square size={18} />
                  )}
                  Caisse {d.crate || 0}
                </span>
                <span>{d.quantity}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between text-sm font-bold">
          <span className="text-slate-500">Quantité après regroupement</span>
          <span className="text-green-600">{newQty}</span>
        </div>

        <button
          onClick={handleConfirm}
          disabled={toMerge.length === 0 || saving}
          className="mt-5 w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            `Regrouper ${toMerge.length} fiche(s)`
          )}
        </button>
      </div>
    </div>
  );
};

export default MergeDuplicatesModal;
