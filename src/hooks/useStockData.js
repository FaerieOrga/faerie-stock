import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { compressImage } from '../utils/formatters';
import { checkObjectAvailability } from '../utils/availability';

export function useStockData(isAuthenticated) {
  const [objects, setObjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [cratesInfo, setCratesInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);

  // --- FETCH DATA PRINCIPAL (Nettoyé du rental_history) ---
  const fetchData = useCallback(async () => {
    if (!supabase || !isAuthenticated) return;
    setLoading(true);
    try {
      const [
        { data: o },
        { data: reqs },
        { data: c },
        { data: ev },
        { data: cats },
        { data: w },
        { data: ctcts },
      ] = await Promise.all([
        supabase.from('objects').select('*'),
        supabase
          .from('rental_requests')
          .select('*, rental_items(*)')
          .order('created_at', { ascending: false }),
        supabase.from('crates').select('*'),
        supabase.from('events').select('*'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('warehouses').select('*').order('name'),
        supabase.from('contacts').select('*').order('last_name'),
      ]);

      if (o) setObjects(o);
      if (reqs) setRentalRequests(reqs);
      if (c) setCratesInfo(c);
      if (ev) setEvents(ev);
      if (cats) setCategories(cats);
      if (w) setWarehouses(w);
      if (ctcts) setContacts(ctcts);
    } catch (e) {
      console.error('Erreur fetchData:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- POLLING TEMPS RÉEL (30s) ---
  // Supabase Realtime nécessite la réplication activée.
  // En alternative, on poll toutes les 30 secondes.
  // L'onglet inactif (document.hidden) est ignoré pour économiser les requêtes.
  useEffect(() => {
    if (!isAuthenticated) return;

    const INTERVAL_MS = 30_000; // 30 secondes

    const tick = () => {
      if (!document.hidden) fetchData();
    };

    const timer = setInterval(tick, INTERVAL_MS);

    // Quand l'utilisateur revient sur l'onglet, on rafraîchit immédiatement
    const onVisibilityChange = () => {
      if (!document.hidden) fetchData();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuthenticated, fetchData]);

  // --- LOGIQUE DE DISPONIBILITÉ ---
  const getAvailableObjects = (startDate, endDate) => {
    if (!startDate || !endDate)
      return objects.map((obj) => ({ ...obj, isAvailable: true }));

    return objects.map((obj) => ({
      ...obj,
      isAvailable: checkObjectAvailability(
        obj.id,
        startDate,
        endDate,
        rentalRequests,
        events
      ),
    }));
  };

  // --- GESTION DU PANIER / DEMANDE DE LOCATION ---
  const submitRentalRequest = async (requestData) => {
    setLoading(true);
    console.log('Données reçues pour insertion :', requestData);

    try {
      // 1. Insertion de la demande principale
      const { data: request, error: reqError } = await supabase
        .from('rental_requests')
        .insert([
          {
            contact_id: requestData.contact_id,
            start_date: requestData.start_date,
            end_date: requestData.end_date,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (reqError) {
        console.error('ERREUR ETAPE 1 (rental_requests):', reqError);
        throw reqError;
      }

      console.log('Demande créée avec ID:', request.id);

      // 2. Préparation des items
      const itemsToInsert = requestData.items.map((item) => ({
        request_id: request.id,
        // On extrait l'id que l'objet soit déjà un objet {object_id: X} ou juste un ID X
        object_id: parseInt(item.object_id || item),
      }));

      // 3. Insertion des items
      const { error: itemError } = await supabase
        .from('rental_items')
        .insert(itemsToInsert);

      if (itemError) {
        console.error('ERREUR ETAPE 2 (rental_items):', itemError);
        throw itemError;
      }

      console.log('Succès total !');
      await fetchData();
      return { success: true };
    } catch (err) {
      // C'EST CE MESSAGE QUI NOUS DIRA TOUT :
      console.error("DÉTAIL COMPLET DE L'ERREUR :", err);
      alert(`Détail technique : ${err.message} (Code: ${err.code})`);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // --- LOGISTIQUE : RETOUR DE MATÉRIEL ---
  const returnRentalRequest = async (requestId, itemsToReturn) => {
    setLoading(true);
    try {
      for (const item of itemsToReturn) {
        await supabase
          .from('objects')
          .update({ crate: parseInt(item.return_crate) })
          .eq('id', item.object_id);
      }

      const { error: updateError } = await supabase
        .from('rental_requests')
        .update({ status: 'returned' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('Erreur retour:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // --- LOGISTIQUE : APPROBATION DÉPART ---
  const approveRentalRequest = async (requestId, itemUpdates) => {
    setLoading(true);
    try {
      for (const update of itemUpdates) {
        await supabase
          .from('objects')
          .update({ crate: update.target_crate })
          .eq('id', update.object_id);
      }

      const { error } = await supabase
        .from('rental_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('Erreur approbation:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // --- FONCTIONS STOCK STANDARD ---
  const addObject = async (newObject) => {
    setLoading(true);
    try {
      const payload = {
        ...newObject,
        crate: parseInt(newObject.crate) || 0,
        category: Array.isArray(newObject.category)
          ? newObject.category[0]
          : newObject.category,
      };

      const { error } = await supabase.from('objects').insert([payload]);
      if (error) throw error;

      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('Erreur addObject:', err);
      alert(`Erreur : ${err.message}`);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateObject = async (id, ups) => {
    try {
      const { error } = await supabase.from('objects').update(ups).eq('id', id);
      if (error) throw error;
      setObjects((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, ...ups } : obj))
      );
      return { error: null };
    } catch (error) {
      await fetchData();
      return { error };
    }
  };

  const bulkUpdateObjects = async (ids, field, value) => {
    try {
      const { data, error } = await supabase
        .from('objects')
        .update({ [field]: value })
        .in('id', ids); // Utilise .in() pour mettre à jour une liste d'IDs

      if (error) throw error;

      // On rafraîchit les données locales après modification
      await fetchData();

      return { success: true, data };
    } catch (err) {
      console.error('Erreur bulkUpdate:', err);
      return { success: false, error: err.message };
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('stock-images').upload(fileName, compressed);
      const { data } = supabase.storage
        .from('stock-images')
        .getPublicUrl(fileName);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const updateCrate = async (crateNum, updates) => {
    try {
      const { error } = await supabase
        .from('crates')
        .upsert(
          { crate_number: crateNum, ...updates },
          { onConflict: 'crate_number' }
        );
      if (error) throw error;
      setCratesInfo((prev) =>
        prev.map((c) =>
          c.crate_number === crateNum ? { ...c, ...updates } : c
        )
      );
      return { success: true };
    } catch (err) {
      await fetchData();
      return { error: err };
    }
  };

  const bulkDeleteObjects = async (ids) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('objects').delete().in('id', ids);
      if (error) throw error;
      setObjects((prev) =>
        prev.filter((obj) => !ids.map(Number).includes(Number(obj.id)))
      );
      return { success: true };
    } catch (err) {
      await fetchData();
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteObject = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('objects').delete().eq('id', id);
      if (error) throw error;
      setObjects((prev) => prev.filter((obj) => Number(obj.id) !== Number(id)));
      return { success: true };
    } catch (err) {
      await fetchData();
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    objects,
    events,
    cratesInfo,
    warehouses,
    categories,
    contacts,
    rentalRequests,
    loading,
    uploading,
    fetchData,
    getAvailableObjects,
    submitRentalRequest,
    approveRentalRequest,
    returnRentalRequest,
    bulkUpdateObjects,
    updateCrate,
    updateObject,
    uploadImage,
    bulkDeleteObjects,
    deleteObject,
    addObject,
  };
}
