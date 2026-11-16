import React, { useMemo, useState } from 'react';
import { X, Plus, Trash2, Loader2, Split } from 'lucide-react';
import { supabase } from '../../api/supabase';
import { getRentedQuantity } from '../../utils/availability';

/**
 * Répartit la quantité d'un objet sur plusieurs caisses.
 * La première ligne reste la fiche d'origine (les locations y restent liées),
 * chaque ligne suivante crée une nouvelle fiche identique avec sa caisse et sa quantité.
 */
const SplitQuantityModal = ({ object, rentals = [], onClose, onDone }) => {
  const total = Number(object.quantity) || 0;
  const [rows, setRows] = useState([
    { crate: String(object.crate ?? 0), qty: String(total) },
    { crate: '', qty: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const reserved = getRentedQuantity(object.id, rentals, [
    'pending',
    'approved',
    'ongoing',
  ]);

  const parsed = rows.map((r) => ({
    crate: r.crate === '' ? NaN : parseInt(r.crate, 10),
    qty: parseInt(r.qty, 10),
  }));
  const sum = parsed.reduce((acc, r) => acc + (r.qty || 0), 0);

  const error = useMemo(() => {
    if (rows.length < 2) return 'Ajoutez au moins une autre caisse.';
    if (parsed.some((r) => Number.isNaN(r.crate) || r.crate < 0))
      return 'Chaque ligne doit avoir un numéro de caisse (0 = vrac).';
    if (parsed.some((r) => !(r.qty >= 1)))
      return 'Chaque ligne doit avoir une quantité d’au moins 1.';
    const crates = parsed.map((r) => r.crate);
    if (new Set(crates).size !== crates.length)
      return 'Une même caisse apparaît deux fois.';
    if (sum !== total)
      return `Le total réparti (${sum}) doit être égal à la quantité (${total}).`;
    if (parsed[0].qty < reserved)
      return `${reserved} unité(s) sont réservées en location : la première ligne doit en garder au moins ${reserved}.`;
    return null;
  }, [rows, parsed, sum, total, reserved]);

  const setRow = (i, field, value) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );

  const handleConfirm = async () => {
    if (error) return;
    setSaving(true);
    try {
      const { id, created_at, ...base } = object;
      const newObjects = parsed.slice(1).map((r) => ({
        ...base,
        crate: r.crate,
        quantity: r.qty,
        warehouse_id: r.crate === 0 ? object.warehouse_id ?? null : null,
      }));

      const { error: insertError } = await supabase
        .from('objects')
        .insert(newObjects);
      if (insertError) throw insertError;

      const first = parsed[0];
      const { error: updateError } = await supabase
        .from('objects')
        .update({
          crate: first.crate,
          quantity: first.qty,
          ...(first.crate !== 0 ? { warehouse_id: null } : {}),
        })
        .eq('id', object.id);
      if (updateError) {
        alert(
          `Les nouvelles fiches ont été créées, mais la fiche d'origine n'a pas pu être mise à jour (${updateError.message}). Corrigez sa quantité à la main.`
        );
      }

      await onDone?.();
      onClose();
    } catch (err) {
      alert(`Erreur lors de la répartition : ${err.message}`);
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
            <Split size={20} className="text-blue-600" /> Répartir
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          {object.name} : {total} unité(s) à répartir entre plusieurs caisses.
          Chaque ligne en plus crée une fiche séparée.
        </p>

        <div className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
          <span>Caisse</span>
          <span>Quantité</span>
          <span />
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={r.crate}
                placeholder="N°"
                onFocus={(e) => e.target.select()}
                onChange={(e) => setRow(i, 'crate', e.target.value)}
                className="p-3 bg-slate-50 rounded-xl text-center font-black outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={r.qty}
                placeholder="Qté"
                onFocus={(e) => e.target.select()}
                onChange={(e) => setRow(i, 'qty', e.target.value)}
                className="p-3 bg-slate-50 rounded-xl text-center font-black outline-none focus:ring-2 focus:ring-blue-500"
              />
              {i === 0 ? (
                <span
                  className="flex items-center justify-center text-[9px] font-black uppercase text-slate-300"
                  title="Fiche d'origine"
                >
                  Orig.
                </span>
              ) : (
                <button
                  onClick={() =>
                    setRows((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="flex items-center justify-center text-slate-300 hover:text-red-500 rounded-xl"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setRows((prev) => [...prev, { crate: '', qty: '' }])}
          className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-600"
        >
          <Plus size={16} /> Ajouter une caisse
        </button>

        <div className="mt-5 flex items-center justify-between text-sm font-bold">
          <span className="text-slate-500">Total réparti</span>
          <span className={sum === total ? 'text-green-600' : 'text-amber-600'}>
            {sum} / {total}
          </span>
        </div>

        {error && (
          <p className="mt-3 text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!!error || saving}
          className="mt-5 w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : 'Répartir'}
        </button>
      </div>
    </div>
  );
};

export default SplitQuantityModal;
