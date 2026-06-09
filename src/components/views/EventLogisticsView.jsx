import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  MapPin,
  Box,
  Plus,
  Trash2,
  Search,
  ArrowRight,
  CheckCircle2,
  X,
  ChevronRight,
  Check,
  Info,
  ListFilter,
  Eye,
  Settings,
  ClipboardList,
  Calendar,
  Layout,
  ArrowLeftRight,
  LogOut,
  CheckCircle,
  Loader2,
  Lock,
  Users,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const EventLogisticsView = ({
  selectedEvent,
  objects = [], // Table globale objects
  onBack,
  fetchData,
}) => {
  const [activeTab, setActiveTab] = useState('visualisation');
  const [locations, setLocations] = useState([]);
  const [allGlobalLieux, setAllGlobalLieux] = useState([]);
  const [allGlobalCrates, setAllGlobalCrates] = useState([]);
  const [crates, setCrates] = useState([]);
  const [eventItems, setEventItems] = useState([]);
  // IDs des caisses occupées par d'autres événements aux mêmes dates
  const [occupiedCrateIdsAtDates, setOccupiedCrateIdsAtDates] = useState([]);

  const [isEventValidated, setIsEventValidated] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [allStaff, setAllStaff] = useState([]);

  // États UI
  const [searchInCrateModal, setSearchInCrateModal] = useState('');
  const [searchCrateOrObject, setSearchCrateOrObject] = useState('');
  const [searchStock, setSearchStock] = useState('');
  const [showAddObjectResults, setShowAddObjectResults] = useState(false);
  const [showAvailableStock, setShowAvailableStock] = useState(false);
  const [selectedLocId, setSelectedLocId] = useState(null);

  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isCrateModalOpen, setIsCrateModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const [pendingCrate, setPendingCrate] = useState(null);
  const [selectedObjectIds, setSelectedObjectIds] = useState([]);
  const [repliSelection, setRepliSelection] = useState({});

  // 1. CHARGEMENT GLOBAL
  const loadAllData = async () => {
    if (!selectedEvent) return;
    try {
      // Étape A : Trouver les événements qui chevauchent les dates de l'événement actuel
      // Logique : (StartA <= EndB) AND (EndA >= StartB)
      const { data: overlappingEvents } = await supabase
        .from('events')
        .select('id')
        .neq('id', selectedEvent.id) // Exclure l'événement actuel
        .lte('start_date', selectedEvent.end_date)
        .gte('end_date', selectedEvent.start_date);

      const eventIds = overlappingEvents?.map((e) => e.id) || [];

      // Étape B : Charger le reste des données en parallèle
      const [
        resStaff,
        resEventLocs,
        resGlobalLocs,
        resGlobalCrates,
        resCrates,
        resItems,
        resEventStatus,
        resOccupiedCrates,
      ] = await Promise.all([
        supabase.from('staff').select('*').order('name'),
        supabase
          .from('event_locations')
          .select('*')
          .eq('event_id', selectedEvent.id),
        supabase.from('locations').select('id, name').order('name'),
        supabase
          .from('crates')
          .select('*')
          .order('crate_number', { ascending: true }),
        supabase
          .from('event_crates')
          .select('*')
          .eq('event_id', selectedEvent.id),
        supabase
          .from('event_objects')
          .select(`*, objects(*)`)
          .eq('event_id', selectedEvent.id),
        supabase
          .from('events')
          .select('is_logistics_validated')
          .eq('id', selectedEvent.id)
          .single(),
        // On récupère les caisses utilisées uniquement par les événements en conflit de date
        eventIds.length > 0
          ? supabase
              .from('event_crates')
              .select('original_crate_id')
              .in('event_id', eventIds)
          : Promise.resolve({ data: [] }),
      ]);

      setAllStaff(resStaff.data || []);
      setLocations(resEventLocs.data || []);
      setAllGlobalLieux(resGlobalLocs.data || []);
      setAllGlobalCrates(resGlobalCrates.data || []);
      setCrates(resCrates.data || []);
      setEventItems(resItems.data || []);
      setIsEventValidated(resEventStatus.data?.is_logistics_validated || false);

      const occupiedIds =
        resOccupiedCrates.data?.map((c) => c.original_crate_id) || [];
      setOccupiedCrateIdsAtDates(occupiedIds);

      if (resEventLocs.data?.length === 0 && activeTab === 'visualisation')
        setActiveTab('config');
      if (resEventLocs.data?.length > 0 && selectedLocId === null)
        setSelectedLocId(resEventLocs.data[0].id);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedEvent]);

  // 2. FILTRAGES
  const unassignedStock = useMemo(() => {
    const eventObjectIds = eventItems.map((ei) => ei.object_id);
    return objects.filter((obj) => !eventObjectIds.includes(obj.id));
  }, [objects, eventItems]);

  const availableGlobalLieux = useMemo(() => {
    const currentLocIds = locations.map((loc) => loc.location_id);
    return allGlobalLieux.filter((gl) => !currentLocIds.includes(gl.id));
  }, [allGlobalLieux, locations]);

  const filteredCrates = useMemo(() => {
    let result = crates;
    if (!searchCrateOrObject && selectedLocId)
      result = result.filter((c) => c.location_id === selectedLocId);
    return result;
  }, [crates, selectedLocId, searchCrateOrObject]);

  const filteredModalCrates = useMemo(() => {
    const currentCrateIdsInThisEvent = crates.map((c) => c.original_crate_id);

    // 1. On filtre les caisses réelles de la base
    const filteredRealCrates = allGlobalCrates.filter((gc) => {
      const isNotAlreadyInEvent = !currentCrateIdsInThisEvent.includes(gc.id);
      const isNotOccupied = !occupiedCrateIdsAtDates.includes(gc.id);
      const matchesSearch =
        !searchInCrateModal ||
        gc.crate_number?.toString().includes(searchInCrateModal);

      return isNotAlreadyInEvent && isNotOccupied && matchesSearch;
    });

    // 2. On crée une caisse virtuelle "VRAC" (Caisse #0)
    const vracCrate = {
      id: 'vrac-virtual', // ID unique pour React
      crate_number: 0,
      crate_label: 'VRAC / ZONE DE TRI',
      is_virtual: true,
    };

    // 3. On l'ajoute au début de la liste si elle correspond à la recherche
    const showVrac =
      !searchInCrateModal ||
      '0'.includes(searchInCrateModal) ||
      'vrac'.includes(searchInCrateModal.toLowerCase());

    return showVrac ? [vracCrate, ...filteredRealCrates] : filteredRealCrates;
  }, [allGlobalCrates, crates, occupiedCrateIdsAtDates, searchInCrateModal]);

  // 3. LOGIQUE DES MOUVEMENTS (AVEC TRI PAR CAISSE D'ORIGINE)
  const movements = useMemo(() => {
    const usedCrateGlobalIds = crates.map((ec) => ec.original_crate_id);
    const availableRepliCrates = allGlobalCrates.filter(
      (gc) => !usedCrateGlobalIds.includes(gc.id)
    );

    const sortByOrigin = (a, b) => {
      if (a.origin === 'Vrac') return -1;
      if (b.origin === 'Vrac') return 1;
      return parseInt(a.origin) - parseInt(b.origin);
    };

    const incoming = eventItems
      .map((item) => ({
        ...item,
        origin: item.objects?.crate || 'Vrac',
        targetCrate: crates.find((c) => c.id === item.crate_id),
        targetLabel:
          crates.find((c) => c.id === item.crate_id)?.crate_label ||
          'À assigner',
        isDefault: !item.crate_id,
      }))
      .sort(sortByOrigin);

    const outgoing = [];
    crates.forEach((eventCrate) => {
      const globalCrate = allGlobalCrates.find(
        (gc) => gc.id === eventCrate.original_crate_id
      );
      if (globalCrate) {
        objects
          .filter((obj) => obj.crate === globalCrate.crate_number)
          .forEach((obj) => {
            if (!eventItems.some((ei) => ei.object_id === obj.id)) {
              outgoing.push({
                id: obj.id,
                name: obj.name,
                origin: globalCrate.crate_number,
              });
            }
          });
      }
    });

    return {
      incoming,
      outgoing: outgoing.sort(sortByOrigin),
      availableRepliCrates,
    };
  }, [eventItems, crates, allGlobalCrates, objects]);

  const isTransferReady = useMemo(() => {
    if (isEventValidated || isTransferring) return false;
    return (
      movements.incoming.every((m) => m.is_prepared) && eventItems.length > 0
    );
  }, [movements, eventItems, isTransferring, isEventValidated]);

  // --- ACTIONS ---

  const handleRepliValidation = async (objectId) => {
    const targetCrateId = repliSelection[objectId];
    if (!targetCrateId) {
      alert('Choisissez une destination.');
      return;
    }
    const targetCrate = allGlobalCrates.find(
      (c) => c.id === parseInt(targetCrateId)
    );
    try {
      await supabase
        .from('objects')
        .update({ crate: targetCrate.crate_number })
        .eq('id', objectId);
      await loadAllData();
      if (fetchData) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmGlobalTransfer = async () => {
    if (
      !window.confirm(
        'Confirmer le transfert global ? Cela verrouillera la logistique.'
      )
    )
      return;
    setIsTransferring(true);
    try {
      const updates = movements.incoming.map((item) => {
        const targetCrateNumber = item.targetCrate?.crate_label.replace(
          'Caisse ',
          ''
        );
        return supabase
          .from('objects')
          .update({ crate: targetCrateNumber })
          .eq('id', item.object_id);
      });
      await Promise.all([
        ...updates,
        supabase
          .from('events')
          .update({ is_logistics_validated: true })
          .eq('id', selectedEvent.id),
      ]);
      alert('Stock réel mis à jour et logistique verrouillée.');
      await loadAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsTransferring(false);
    }
  };

  const togglePreparedIn = async (item) => {
    if (isEventValidated) return;
    try {
      await supabase
        .from('event_objects')
        .update({ is_prepared: !item.is_prepared })
        .eq('id', item.id);
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const removeObjectFromEvent = async (item) => {
    if (isEventValidated || !window.confirm(`Supprimer l'objet ?`)) return;
    try {
      await supabase
        .from('objects')
        .update({ crate: null })
        .eq('id', item.object_id);
      await supabase.from('event_objects').delete().eq('id', item.id);
      loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAndAddLocation = async () => {
    if (!newLocationName.trim()) return;
    const { data: gData } = await supabase
      .from('locations')
      .insert([{ name: newLocationName.trim() }])
      .select()
      .single();
    await supabase.from('event_locations').insert([
      {
        event_id: selectedEvent.id,
        event_specific_name: gData.name,
        location_id: gData.id,
      },
    ]);
    setIsLocModalOpen(false);
    setNewLocationName('');
    loadAllData();
  };

  const startAssignCrate = (globalCrate) => {
    const stockIds = objects
      .filter(
        (o) =>
          o.crate === globalCrate.crate_number &&
          !eventItems.some((ei) => ei.object_id === o.id)
      )
      .map((o) => o.id);
    setPendingCrate(globalCrate);
    setSelectedObjectIds(stockIds);
  };

  const confirmAssignCrate = async () => {
    try {
      // 1. Déterminer si on importe le VRAC virtuel
      const isVrac = pendingCrate.id === 'vrac-virtual';

      // 2. Préparer les données de la caisse pour Supabase
      const crateToInsert = {
        event_id: selectedEvent.id,
        location_id: selectedLocId,
        crate_label: isVrac ? 'VRAC' : `Caisse ${pendingCrate.crate_number}`,
        // On met null si c'est du vrac, sinon l'ID réel de la caisse
        original_crate_id: isVrac ? null : pendingCrate.id,
      };

      const { data: newCrate, error: crateError } = await supabase
        .from('event_crates')
        .insert([crateToInsert])
        .select()
        .single();

      if (crateError) throw crateError;
      if (!newCrate)
        throw new Error("La caisse d'événement n'a pas pu être créée.");

      // 3. Insérer les objets sélectionnés liés à cette caisse
      if (selectedObjectIds.length > 0) {
        const objectsToInsert = selectedObjectIds.map((id) => ({
          event_id: selectedEvent.id,
          object_id: id,
          crate_id: newCrate.id, // Utilise l'ID de la ligne créée juste au-dessus
          is_prepared: false,
        }));

        const { error: objectsError } = await supabase
          .from('event_objects')
          .insert(objectsToInsert);

        if (objectsError) throw objectsError;
      }

      // 4. Nettoyage de l'interface et rechargement
      setIsCrateModalOpen(false);
      setPendingCrate(null);
      setSelectedObjectIds([]); // Vide la sélection pour le prochain import
      await loadAllData();
    } catch (error) {
      console.error("Erreur détaillée lors de l'import :", error);
      alert(`Erreur d'importation : ${error.message}`);
    }
  };
  const deleteCrate = async (id) => {
    await supabase.from('event_crates').delete().eq('id', id);
    loadAllData();
  };
  const deleteLocation = async (id) => {
    await supabase.from('event_locations').delete().eq('id', id);
    if (selectedLocId === id) setSelectedLocId(null);
    loadAllData();
  };
  const addObject = async (id) => {
    await supabase
      .from('event_objects')
      .insert([{ event_id: selectedEvent.id, object_id: id }]);
    loadAllData();
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen text-left relative">
      {/* MODAL LIEU */}
      {isLocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black uppercase italic mb-6 text-slate-900 text-left">
              Nouveau Lieu
            </h2>
            <input
              autoFocus
              className="w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 font-bold mb-4 outline-none focus:border-indigo-500"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
            />
            <button
              onClick={handleCreateAndAddLocation}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs"
            >
              Créer et ajouter
            </button>
            <button
              onClick={() => setIsLocModalOpen(false)}
              className="w-full mt-2 text-slate-400 font-bold uppercase text-[10px]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* MODAL CAISSE */}
      {isCrateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase italic text-slate-900">
                {pendingCrate
                  ? `Importation : Caisse #${pendingCrate.crate_number}`
                  : 'Choisir une caisse disponible'}
              </h2>
              <X
                className="cursor-pointer text-slate-400"
                onClick={() => {
                  setIsCrateModalOpen(false);
                  setPendingCrate(null);
                }}
              />
            </div>
            {!pendingCrate ? (
              <>
                <div className="relative mb-6">
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none ring-2 ring-slate-100 focus:ring-indigo-500"
                    placeholder="Numéro de caisse..."
                    value={searchInCrateModal}
                    onChange={(e) => setSearchInCrateModal(e.target.value)}
                  />
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
                  {filteredModalCrates.map((gc) => {
                    const stockItems = objects.filter(
                      (o) => o.crate === gc.crate_number
                    );
                    const availableItems = stockItems.filter(
                      (o) => !eventItems.some((ei) => ei.object_id === o.id)
                    );
                    return (
                      <div
                        key={gc.id}
                        onClick={() => startAssignCrate(gc)}
                        className="p-5 bg-white border-2 border-slate-100 rounded-[2rem] cursor-pointer hover:border-indigo-600 transition-all flex flex-col group text-left"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-sm uppercase group-hover:text-indigo-600">
                            Caisse #{gc.crate_number ?? 0}
                          </span>
                          <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">
                            {availableItems.length} dispo
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 border-t pt-3 border-slate-50">
                          {stockItems.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 truncate"
                            >
                              <div
                                className={`w-1 h-1 rounded-full ${
                                  eventItems.some(
                                    (ei) => ei.object_id === item.id
                                  )
                                    ? 'bg-slate-200'
                                    : 'bg-indigo-300'
                                }`}
                              />
                              {item.name}
                            </div>
                          ))}
                          {stockItems.length > 5 && (
                            <p className="text-[8px] text-slate-300 pl-2">
                              +{stockItems.length - 5} autres...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full text-left">
                <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
                  {objects
                    .filter(
                      (o) =>
                        o.crate === pendingCrate.crate_number &&
                        !eventItems.some((ei) => ei.object_id === o.id)
                    )
                    .map((obj) => (
                      <div
                        key={obj.id}
                        onClick={() =>
                          setSelectedObjectIds((prev) =>
                            prev.includes(obj.id)
                              ? prev.filter((i) => i !== obj.id)
                              : [...prev, obj.id]
                          )
                        }
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedObjectIds.includes(obj.id)
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-slate-100'
                        }`}
                      >
                        <span className="font-bold text-xs">{obj.name}</span>
                        {selectedObjectIds.includes(obj.id) && (
                          <Check size={16} className="text-indigo-600" />
                        )}
                      </div>
                    ))}
                </div>
                <button
                  onClick={confirmAssignCrate}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg"
                >
                  Importer la sélection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start border-b pb-6">
        <div className="text-left">
          <button
            onClick={onBack}
            className="text-[10px] font-black uppercase text-indigo-600 mb-2 flex items-center gap-1 hover:translate-x-[-4px] transition-all"
          >
            <ArrowRight size={12} className="rotate-180" /> Retour
          </button>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-black uppercase italic text-slate-900 tracking-tighter">
              {selectedEvent.name}
            </h1>
            {isEventValidated && (
              <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-2 font-black text-[10px] uppercase shadow-sm">
                <Lock size={14} /> Logistique Validée
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-xl">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-600">
                Du {new Date(selectedEvent.start_date).toLocaleDateString()} au{' '}
                {new Date(selectedEvent.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-xl">
              <Layout size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-600">
                Mode : {selectedEvent.display_mode}
              </span>
            </div>
          </div>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm">
          <button
            onClick={() => setActiveTab('visualisation')}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all ${
              activeTab === 'visualisation'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400'
            }`}
          >
            <Eye size={14} /> Visualisation
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all ${
              activeTab === 'config'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400'
            }`}
          >
            <Settings size={14} /> Config
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all ${
              activeTab === 'scenario'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400'
            }`}
          >
            <ClipboardList size={14} /> Scénario
          </button>
          <button
            onClick={() => setActiveTab('responsables')}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all ${
              activeTab === 'responsables'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400'
            }`}
          >
            <Users size={14} /> Responsables
          </button>
        </div>
      </div>

      {/* VUE 1 : VISUALISATION */}
      {activeTab === 'visualisation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left animate-in fade-in duration-500">
          {locations.map((loc) => {
            const locCrates = crates.filter((c) => c.location_id === loc.id);
            return (
              <div
                key={loc.id}
                className="bg-white rounded-[2.5rem] p-8 border shadow-sm"
              >
                <h3 className="font-black text-lg uppercase italic text-slate-800 mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-indigo-600" />{' '}
                  {loc.event_specific_name}
                </h3>
                <div className="space-y-4">
                  {locCrates.map((crate) => (
                    <div
                      key={crate.id}
                      className="bg-slate-50 p-4 rounded-3xl border text-left"
                    >
                      <p className="font-black text-xs uppercase italic text-slate-700 mb-2 flex items-center gap-2">
                        <Box size={14} className="text-amber-500" />{' '}
                        {crate.crate_label}
                      </p>
                      <div className="space-y-1 pl-6 border-l-2">
                        {eventItems
                          .filter((i) => i.crate_id === crate.id)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="text-[11px] font-bold text-slate-500"
                            >
                              • {item.objects?.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VUE 2 : CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left h-[600px] animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6 text-left">
              <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                <MapPin size={14} /> 1. Lieux
              </h3>
              {!isEventValidated && (
                <Plus
                  className="cursor-pointer text-indigo-600"
                  onClick={() => setIsLocModalOpen(true)}
                />
              )}
            </div>
            {!isEventValidated && (
              <select
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase outline-none mb-4 cursor-pointer"
                onChange={async (e) => {
                  const l = allGlobalLieux.find(
                    (gl) => gl.id === e.target.value
                  );
                  if (l) {
                    await supabase.from('event_locations').insert([
                      {
                        event_id: selectedEvent.id,
                        event_specific_name: l.name,
                        location_id: l.id,
                      },
                    ]);
                    loadAllData();
                  }
                }}
                value=""
              >
                <option value="">+ STOCK GLOBAL</option>
                {availableGlobalLieux.map((gl) => (
                  <option key={gl.id} value={gl.id}>
                    {gl.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex-1 overflow-y-auto space-y-2">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer ${
                    selectedLocId === loc.id
                      ? 'border-indigo-600 bg-indigo-50/30'
                      : 'bg-slate-50'
                  }`}
                >
                  <span className="font-black text-xs uppercase">
                    {loc.event_specific_name}
                  </span>
                  {!isEventValidated && (
                    <Trash2
                      size={14}
                      className="text-slate-300 hover:text-red-500 cursor-pointer"
                      onClick={() => deleteLocation(loc.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
              <Box size={14} /> 2. Caisses
            </h3>
            {!isEventValidated && (
              <button
                onClick={() => setIsCrateModalOpen(true)}
                className="w-full p-4 mb-4 bg-amber-50 text-amber-700 border-2 border-dashed border-amber-200 rounded-2xl font-black text-[10px] uppercase hover:bg-amber-100 transition-all"
              >
                <Plus size={16} /> Affecter du stock
              </button>
            )}
            <div className="flex-1 overflow-y-auto space-y-4">
              {filteredCrates.map((crate) => {
                const itemsInCrate = eventItems.filter(
                  (i) => i.crate_id === crate.id
                );
                return (
                  <div
                    key={crate.id}
                    className="bg-white rounded-3xl border shadow-sm overflow-hidden hover:border-amber-400 transition-all"
                  >
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                      <p className="font-black text-xs uppercase italic text-slate-800">
                        {crate.crate_label}
                      </p>
                      {!isEventValidated && (
                        <Trash2
                          size={14}
                          className="text-slate-300 hover:text-red-500 cursor-pointer"
                          onClick={() => deleteCrate(crate.id)}
                        />
                      )}
                    </div>
                    <div className="p-3 space-y-1 text-left">
                      {itemsInCrate.map((item) => (
                        <div
                          key={item.id}
                          className="text-[10px] font-bold text-slate-500 truncate flex items-center gap-1.5"
                        >
                          • {item.objects?.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                <Package size={14} /> 3. Inventaire
              </h3>
              {!isEventValidated && (
                <button
                  onClick={() => setShowAvailableStock(!showAvailableStock)}
                  className={`p-2 rounded-xl transition-all ${
                    showAvailableStock
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <ListFilter size={16} />
                </button>
              )}
            </div>
            {showAvailableStock ? (
              <div className="flex-1 overflow-y-auto space-y-2">
                {unassignedStock.map((obj) => (
                  <div
                    key={obj.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-2xl group"
                  >
                    <p className="font-bold text-[11px] text-slate-700">
                      {obj.name}
                    </p>
                    <button
                      onClick={() => addObject(obj.id)}
                      className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {!isEventValidated && (
                  <div className="relative mb-4 text-left">
                    <input
                      className="w-full pl-8 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold outline-none"
                      placeholder="Chercher un objet..."
                      value={searchStock}
                      onChange={(e) => {
                        setSearchStock(e.target.value);
                        setShowAddObjectResults(true);
                      }}
                    />
                    <Search
                      size={12}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    {showAddObjectResults && searchStock && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden text-left">
                        {objects
                          .filter((o) =>
                            o.name
                              .toLowerCase()
                              .includes(searchStock.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((obj) => (
                            <div
                              key={obj.id}
                              onClick={() => {
                                addObject(obj.id);
                                setShowAddObjectResults(false);
                                setSearchStock('');
                              }}
                              className="p-3 hover:bg-indigo-50 cursor-pointer font-bold text-[11px] border-b"
                            >
                              {obj.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                {eventItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-2xl border group text-left"
                  >
                    <div className="flex justify-between mb-2">
                      <p className="font-bold text-slate-800 text-[11px] truncate flex-1">
                        {item.objects?.name}
                      </p>
                      {!isEventValidated && (
                        <Trash2
                          size={14}
                          className="text-slate-300 hover:text-red-600 cursor-pointer"
                          onClick={() => removeObjectFromEvent(item)}
                        />
                      )}
                    </div>
                    <select
                      disabled={isEventValidated}
                      className="w-full bg-white border-none text-[9px] font-black uppercase p-2 rounded-lg outline-none ring-1 ring-slate-100 cursor-pointer"
                      value={item.crate_id || ''}
                      onChange={async (e) => {
                        await supabase
                          .from('event_objects')
                          .update({ crate_id: e.target.value || null })
                          .eq('id', item.id);
                        loadAllData();
                      }}
                    >
                      <option value="">📦 Choisir caisse</option>
                      {crates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.crate_label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VUE 3 : SCÉNARIO */}
      {activeTab === 'scenario' && (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
          {isTransferReady && (
            <button
              disabled={isTransferring}
              onClick={confirmGlobalTransfer}
              className="w-full p-6 rounded-[2rem] font-black uppercase italic shadow-xl transition-all flex items-center justify-between border-2 border-emerald-500 bg-emerald-50 text-emerald-900 active:scale-95"
            >
              <div className="flex items-center gap-4 text-left">
                {isTransferring ? (
                  <Loader2
                    size={24}
                    className="animate-spin text-emerald-600"
                  />
                ) : (
                  <CheckCircle size={24} className="text-emerald-600" />
                )}
                <div>
                  <h3 className="font-black uppercase text-sm">
                    Valider et verrouiller le transfert global
                  </h3>
                  <p className="text-[10px] opacity-60">
                    Mise à jour définitive du stock réel
                  </p>
                </div>
              </div>
              <ChevronRight size={20} />
            </button>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-2">
                <ArrowLeftRight size={14} /> Mouvements Requis
              </h3>
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase italic">
                  Entrées (Vers Évènement) :
                </p>
                {movements.incoming
                  .filter((m) => !m.is_prepared)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="bg-white p-5 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex-1 text-left">
                        <h4 className="font-black text-sm uppercase italic text-slate-800 mb-2">
                          {m.objects?.name}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase">
                          <span className="px-2 py-1 bg-slate-100 rounded-lg tracking-tighter">
                            DE : {m.origin}
                          </span>
                          <ArrowRight size={14} className="text-indigo-600" />
                          <span
                            className={`px-2 py-1 rounded-lg tracking-tighter ${
                              m.isDefault
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            DEST : {m.targetLabel}
                          </span>
                        </div>
                      </div>
                      {!isEventValidated && (
                        <button
                          onClick={() => togglePreparedIn(m)}
                          className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        >
                          <Check size={24} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  ))}
                <p className="text-[9px] font-black text-rose-400 uppercase italic mt-8 border-t pt-6">
                  Sorties (Repli permanent hors Event) :
                </p>
                {movements.outgoing.map((m) => (
                  <div
                    key={m.id}
                    className="bg-rose-50/30 p-5 rounded-[2rem] border-2 border-rose-100 flex items-center justify-between text-left"
                  >
                    <div className="text-left flex-1">
                      <h4 className="font-black text-sm uppercase italic text-rose-900 mb-2">
                        {m.name}
                      </h4>
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-[10px] font-black text-rose-500 uppercase">
                          SORTIE DE : {m.origin}
                        </span>
                        <LogOut size={14} className="text-rose-400" />
                        {!isEventValidated && (
                          <select
                            className="bg-white text-rose-600 text-[10px] font-black p-2 rounded-xl outline-none border border-rose-200 cursor-pointer"
                            value={repliSelection[m.id] || ''}
                            onChange={(e) =>
                              setRepliSelection({
                                ...repliSelection,
                                [m.id]: e.target.value,
                              })
                            }
                          >
                            <option value="">Repli vers...</option>
                            {movements.availableRepliCrates.map((gc) => (
                              <option key={gc.id} value={gc.id}>
                                Vers #{gc.crate_number}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    {!isEventValidated && (
                      <button
                        onClick={() => handleRepliValidation(m.id)}
                        className="p-4 bg-white text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <Check size={24} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-2">
                <CheckCircle2 size={14} /> Objets en Place
              </h3>
              <div className="grid gap-3">
                {movements.incoming
                  .filter((m) => m.is_prepared)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-100 p-5 rounded-[2rem] flex items-center justify-between grayscale opacity-60 text-left"
                    >
                      <div className="text-left">
                        <h4 className="font-black text-sm uppercase italic text-slate-500 line-through">
                          {m.objects?.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          Installé dans : {m.targetLabel}
                        </p>
                      </div>
                      {!isEventValidated && (
                        <button
                          onClick={() => togglePreparedIn(m)}
                          className="p-4 bg-emerald-500 text-white rounded-2xl shadow-sm"
                        >
                          <CheckCircle2 size={24} />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE 4 : RESPONSABLES PAR CAISSE */}
      {activeTab === 'responsables' && (
        <div className="space-y-6 animate-in fade-in duration-500 text-left">
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
            Affectez un responsable à chaque caisse de l'événement
          </p>
          {crates.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
              <Users className="mx-auto text-slate-200 mb-3" size={40} />
              <p className="text-slate-400 font-bold text-sm">Aucune caisse configurée</p>
              <p className="text-xs text-slate-300 mt-1">Ajoutez des caisses dans l'onglet Config.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crates.map((crate) => {
                const assignedStaff = allStaff.find((s) => s.id === crate.staff_id);
                const itemsInCrate = eventItems.filter((i) => i.crate_id === crate.id);
                return (
                  <div key={crate.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className={`p-5 border-b flex items-center justify-between ${
                      assignedStaff ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div>
                        <p className="font-black text-sm uppercase italic text-slate-800">{crate.crate_label}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{itemsInCrate.length} objet{itemsInCrate.length > 1 ? 's' : ''}</p>
                      </div>
                      {assignedStaff && (
                        <div className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-xl">
                          <Users size={12} />
                          <span className="text-[10px] font-black">{assignedStaff.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Responsable</label>
                      <select
                        value={crate.staff_id || ''}
                        disabled={isEventValidated}
                        onChange={async (e) => {
                          const staffId = e.target.value ? parseInt(e.target.value) : null;
                          await supabase
                            .from('event_crates')
                            .update({ staff_id: staffId })
                            .eq('id', crate.id);
                          loadAllData();
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 font-bold text-sm outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">— Non assigné —</option>
                        {allStaff.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    {itemsInCrate.length > 0 && (
                      <div className="px-4 pb-4 space-y-1 border-t border-slate-50 pt-3">
                        {itemsInCrate.slice(0, 4).map((item) => (
                          <div key={item.id} className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate">
                            <div className="w-1 h-1 rounded-full bg-indigo-200 shrink-0" />
                            {item.objects?.name}
                          </div>
                        ))}
                        {itemsInCrate.length > 4 && (
                          <p className="text-[9px] text-slate-300 pl-2.5">+{itemsInCrate.length - 4} autres...</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventLogisticsView;