import { supabase } from '../api/supabase';

/**
 * Historique des changements de caisse des objets (table object_crate_history).
 * Une erreur d'écriture (table absente, droits) ne bloque jamais l'action principale.
 *
 * entries : [{ object_id, from_crate, to_crate, reason, rental_request_id? }]
 */
export const logCrateMoves = async (entries) => {
  const rows = (entries || [])
    .filter(
      (e) =>
        e &&
        e.object_id != null &&
        Number(e.from_crate ?? 0) !== Number(e.to_crate ?? 0)
    )
    .map((e) => ({
      object_id: e.object_id,
      from_crate: e.from_crate ?? 0,
      to_crate: e.to_crate ?? 0,
      reason: e.reason || null,
      rental_request_id: e.rental_request_id || null,
    }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('object_crate_history').insert(rows);
  if (error) console.warn('Historique des caisses non enregistré :', error.message);
};

export const fetchCrateHistory = async (objectId, limit = 20) => {
  const { data, error } = await supabase
    .from('object_crate_history')
    .select('*')
    .eq('object_id', objectId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { data: [], error };
  return { data: data || [], error: null };
};
