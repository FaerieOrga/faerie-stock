import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Undo2,
  PackageSearch,
  ChevronRight,
  Package,
  Zap,
  History,
  User,
  Mail,
} from 'lucide-react';

const RentalLogisticsView = ({
  rentalRequests = [],
  contacts = [],
  objects = [],
  onApprove,
  onReject,
  onReturn,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'active' ou 'history'
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemAssignments, setItemAssignments] = useState({}); // { object_id: crate_number }
  const [globalCrate, setGlobalCrate] = useState('');

  // Filtrage des données selon les statuts
  const pendingRequests = rentalRequests.filter(
    (req) => req.status === 'pending'
  );
  const activeRentals = rentalRequests.filter(
    (req) => req.status === 'approved'
  );
  const finishedRentals = rentalRequests.filter(
    (req) => req.status === 'returned' || req.status === 'rejected'
  );

  const [returnMode, setReturnMode] = useState('location'); // 'location' | 'source' | 'other'

  const currentCrateOf = (item) =>
    objects.find((o) => Number(o.id) === Number(item.object_id))?.crate ?? '';
  const hasSource = (item) =>
    item.source_crate !== null && item.source_crate !== undefined;

  // Caisses proposées au retour selon le mode choisi
  const assignmentsFor = (req, mode, otherCrate = '') => {
    const result = {};
    req.rental_items?.forEach((item) => {
      if (mode === 'source' && hasSource(item)) {
        result[item.object_id] = String(item.source_crate);
      } else if (mode === 'other') {
        result[item.object_id] = otherCrate;
      } else {
        result[item.object_id] = String(currentCrateOf(item));
      }
    });
    return result;
  };

  const handleOpenProcess = (req) => {
    setSelectedRequestId(req.id);
    setGlobalCrate('');
    if (activeTab === 'active') {
      const mode = req.rental_items?.some(hasSource) ? 'source' : 'location';
      setReturnMode(mode);
      setItemAssignments(assignmentsFor(req, mode));
      return;
    }
    const initialAssignments = {};
    req.rental_items?.forEach((item) => {
      initialAssignments[item.object_id] = currentCrateOf(item) || '';
    });
    setItemAssignments(initialAssignments);
  };

  const chooseReturnMode = (req, mode) => {
    setReturnMode(mode);
    setItemAssignments(assignmentsFor(req, mode, globalCrate));
  };

  const applyGlobalCrate = (value) => {
    setGlobalCrate(value);
    const currentReq = rentalRequests.find((r) => r.id === selectedRequestId);
    if (!currentReq) return;

    const newAssignments = { ...itemAssignments };
    currentReq.rental_items.forEach((item) => {
      newAssignments[item.object_id] = value;
    });
    setItemAssignments(newAssignments);
  };

  // Prépare un mail de récapitulatif (mailto) à l'emprunteur
  // fromStock = true : caisse lue sur l'objet (cas du renvoi depuis l'onglet Retours)
  const openRecapMail = (req, fromStock = false) => {
    const contact = contacts.find((c) => c.id === req.contact_id);
    if (!contact?.email) {
      alert(
        "Location validée. Aucune adresse e-mail sur la fiche : récapitulatif non préparé."
      );
      return;
    }
    const fmt = (d) => {
      const dt = new Date(d);
      return isNaN(dt) ? d : dt.toLocaleDateString('fr-FR');
    };
    const lines = (req.rental_items || []).map((item) => {
      const obj = objects.find((o) => Number(o.id) === Number(item.object_id));
      const qty = Number(item.quantity) > 1 ? ` x${item.quantity}` : '';
      const crate = fromStock ? obj?.crate : itemAssignments[item.object_id];
      return `- ${obj?.name || `Objet #${item.object_id}`}${qty}${
        crate ? ` (caisse ${crate})` : ''
      }`;
    });
    const body = [
      `Bonjour ${contact.first_name || ''},`,
      '',
      'Votre location est confirmée. Voici le récapitulatif :',
      '',
      `Du ${fmt(req.start_date)} au ${fmt(req.end_date)}`,
      '',
      `Matériel (${lines.length} article${lines.length > 1 ? 's' : ''}) :`,
      ...lines,
      ...(req.notes ? ['', `Votre note : ${req.notes}`] : []),
      '',
      'Merci de prendre soin du matériel et de le rapporter à la date prévue.',
      '',
      'Cordialement,',
    ].join('\n');
    const subject = `Récapitulatif de votre location du ${fmt(
      req.start_date
    )} au ${fmt(req.end_date)}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Mail (mailto) prévenant l'emprunteur que sa demande est refusée
  const openRejectMail = (req, reason) => {
    const contact = contacts.find((c) => c.id === req.contact_id);
    if (!contact?.email) {
      alert(
        'Demande rejetée. Aucune adresse e-mail sur la fiche : mail non préparé.'
      );
      return;
    }
    const fmt = (d) => {
      const dt = new Date(d);
      return isNaN(dt) ? d : dt.toLocaleDateString('fr-FR');
    };
    const lines = (req.rental_items || []).map((item) => {
      const obj = objects.find((o) => Number(o.id) === Number(item.object_id));
      const qty = Number(item.quantity) > 1 ? ` x${item.quantity}` : '';
      return `- ${obj?.name || `Objet #${item.object_id}`}${qty}`;
    });
    const body = [
      `Bonjour ${contact.first_name || ''},`,
      '',
      `Nous sommes désolés : votre demande de location du ${fmt(
        req.start_date
      )} au ${fmt(req.end_date)} ne peut pas être acceptée.`,
      ...(reason ? ['', `Motif : ${reason}`] : []),
      '',
      'Matériel demandé :',
      ...lines,
      '',
      "N'hésitez pas à refaire une demande sur d'autres dates ou à nous contacter.",
      '',
      'Cordialement,',
    ].join('\n');
    const subject = `Votre demande de location du ${fmt(
      req.start_date
    )} au ${fmt(req.end_date)}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleReject = async (req) => {
    const ok = await onReject(req.id);
    if (!ok) return;
    setSelectedRequestId(null);
    const reason = window.prompt(
      'Motif du refus à indiquer dans le mail (optionnel) :',
      ''
    );
    openRejectMail(req, reason ? reason.trim() : '');
  };

  const confirmAction = async (reqId) => {
    const currentReq = rentalRequests.find((r) => r.id === reqId);
    const missingCrate = currentReq.rental_items.some(
      (item) => !itemAssignments[item.object_id]
    );

    if (missingCrate) {
      alert('Veuillez assigner une caisse à chaque objet.');
      return;
    }

    setIsProcessing(true);
    try {
      const updates = currentReq.rental_items.map((item) => ({
        object_id: item.object_id,
        target_crate: parseInt(itemAssignments[item.object_id]),
        return_crate: parseInt(itemAssignments[item.object_id]),
      }));

      if (activeTab === 'pending') {
        const result = await onApprove(reqId, updates);
        if (result?.success) openRecapMail(currentReq);
      } else {
        await onReturn(reqId, updates);
      }
      setSelectedRequestId(null);
    } catch (err) {
      alert('Une erreur est survenue.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Déterminer quelle liste afficher
  const getDisplayList = () => {
    if (activeTab === 'pending') return pendingRequests;
    if (activeTab === 'active') return activeRentals;
    return finishedRentals;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24 text-left animate-in fade-in duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 mb-6 font-bold hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 text-left uppercase tracking-tighter">
            Logistique
          </h2>
          <p className="text-slate-400 font-medium text-left">
            Gestion des flux et archives des locations
          </p>
        </div>

        {/* --- NAVIGATION PAR ONGLET --- */}
        <div className="flex bg-slate-100 p-1.5 rounded-[22px] overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('pending');
              setSelectedRequestId(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Départs{' '}
            {pendingRequests.length > 0 && (
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1 text-[9px]">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedRequestId(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Retours{' '}
            {activeRentals.length > 0 && (
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full ml-1 text-[9px]">
                {activeRentals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setSelectedRequestId(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={14} /> Historique
          </button>
        </div>
      </div>

      {getDisplayList().length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
          <PackageSearch size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold italic">
            Aucune donnée dans cette section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {getDisplayList().map((req) => {
            const contact = contacts.find((c) => c.id === req.contact_id);
            const isSelected = selectedRequestId === req.id;

            return (
              <div
                key={req.id}
                className={`bg-white rounded-[2.5rem] border-2 transition-all overflow-hidden ${
                  isSelected
                    ? 'border-blue-500 shadow-xl'
                    : 'border-slate-100 shadow-sm'
                } ${
                  activeTab === 'history' ? 'opacity-80 hover:opacity-100' : ''
                }`}
              >
                <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-left">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black ${
                        req.status === 'returned'
                          ? 'bg-green-50 text-green-600'
                          : req.status === 'rejected'
                          ? 'bg-red-50 text-red-600'
                          : activeTab === 'pending'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {req.rental_items?.length || 0}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 uppercase tracking-tight">
                        {contact
                          ? `${contact.last_name} ${contact.first_name}`
                          : 'Contact inconnu'}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase mt-0.5 tracking-tighter">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {req.start_date}{' '}
                          <ChevronRight size={10} /> {req.end_date}
                        </span>
                        {activeTab === 'history' && (
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              req.status === 'returned'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {req.status === 'returned' ? 'Terminé' : 'Rejeté'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenProcess(req)}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${
                      activeTab === 'history'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : activeTab === 'pending'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {activeTab === 'history'
                      ? 'Voir détails'
                      : activeTab === 'pending'
                      ? 'Détails Départ'
                      : 'Détails Retour'}
                  </button>
                </div>

                {isSelected && (
                  <div className="border-t border-slate-50 bg-slate-50/50 p-8 animate-in slide-in-from-top-4">
                    {/* CHOIX DE LA CAISSE DE RETOUR (onglet Retours) */}
                    {activeTab === 'active' && (
                      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-3xl text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-3">
                          Où ranger le matériel rendu ?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            ['location', 'Laisser dans la caisse de location'],
                            ['source', "Retour à la caisse d'origine"],
                            ['other', 'Autre caisse'],
                          ].map(([mode, label]) => {
                            const disabled =
                              mode === 'source' &&
                              !req.rental_items?.some(hasSource);
                            return (
                              <button
                                key={mode}
                                disabled={disabled}
                                onClick={() => chooseReturnMode(req, mode)}
                                title={
                                  disabled
                                    ? "Caisse d'origine inconnue pour cette location (validée avant la mise en place de l'historique)"
                                    : ''
                                }
                                className={`px-3 py-3 rounded-2xl text-xs font-black transition-all ${
                                  returnMode === mode
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-amber-100 hover:border-amber-300'
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        {returnMode === 'other' && (
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="N° de caisse pour tout le matériel"
                            value={globalCrate}
                            onChange={(e) => {
                              setGlobalCrate(e.target.value);
                              setItemAssignments(
                                assignmentsFor(req, 'other', e.target.value)
                              );
                            }}
                            className="mt-3 w-full p-3 rounded-2xl bg-white border border-amber-200 font-black text-center outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        )}
                        <p className="mt-3 text-[11px] text-amber-700/80">
                          Chaque caisse reste modifiable ligne par ligne
                          ci-dessous.
                        </p>
                      </div>
                    )}

                    {/* SECTION AFFECTATION GLOBALE (Seulement pour Départ) */}
                    {activeTab === 'pending' && (
                      <div className="mb-8 p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-white text-left">
                          <Zap
                            size={24}
                            className="fill-current text-yellow-300"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                              Gain de temps
                            </p>
                            <p className="font-bold text-sm">
                              Affecter une caisse globale
                            </p>
                          </div>
                        </div>
                        <div className="relative w-full md:w-48">
                          <input
                            type="number"
                            placeholder="N° Caisse..."
                            value={globalCrate}
                            onChange={(e) => applyGlobalCrate(e.target.value)}
                            className="w-full bg-white/20 border-2 border-white/20 rounded-2xl px-4 py-3 text-white placeholder:text-white/50 font-black focus:border-white outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {req.notes && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
                          Note de l'emprunteur
                        </p>
                        <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">
                          {req.notes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 mb-8">
                      {req.rental_items?.map((item) => {
                        const obj = objects.find(
                          (o) => Number(o.id) === Number(item.object_id)
                        );
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center shrink-0">
                                {obj?.photo && !obj.photo.includes('icon:') ? (
                                  <img
                                    src={obj.photo}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package
                                    size={24}
                                    className="text-slate-300"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-700 text-sm">
                                  {obj?.name || `ID: ${item.object_id}`}
                                  {item.quantity > 1 && (
                                    <span className="ml-2 text-blue-600 font-black">
                                      ×{item.quantity}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                  Caisse actuelle: {obj?.crate || '??'}
                                  {activeTab !== 'pending' &&
                                    (hasSource(item)
                                      ? ` · origine : ${item.source_crate}`
                                      : ' · origine inconnue')}
                                </p>
                              </div>
                            </div>

                            {activeTab !== 'history' && (
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-300 uppercase">
                                  Caisse :
                                </span>
                                <input
                                  type="number"
                                  value={itemAssignments[item.object_id] || ''}
                                  onChange={(e) =>
                                    setItemAssignments({
                                      ...itemAssignments,
                                      [item.object_id]: e.target.value,
                                    })
                                  }
                                  className={`w-20 border-none rounded-lg p-2 text-center font-black focus:ring-2 ${
                                    activeTab === 'pending'
                                      ? 'bg-blue-50 text-blue-600 focus:ring-blue-500'
                                      : 'bg-amber-50 text-amber-600 focus:ring-amber-500'
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      {activeTab !== 'history' ? (
                        <>
                          <button
                            onClick={() => confirmAction(req.id)}
                            disabled={isProcessing}
                            className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                              activeTab === 'pending'
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="animate-spin" />
                            ) : activeTab === 'pending' ? (
                              <>
                                <CheckCircle size={20} /> Approuver le départ
                              </>
                            ) : (
                              <>
                                <Undo2 size={20} /> Valider la réception
                              </>
                            )}
                          </button>
                          {activeTab === 'active' && (
                            <button
                              onClick={() => openRecapMail(req, true)}
                              title="Renvoyer le mail de récapitulatif"
                              className="px-5 bg-white text-blue-600 border-2 border-blue-100 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                              <Mail size={18} /> Récap
                            </button>
                          )}
                          {activeTab === 'pending' && (
                            <button
                              onClick={() => handleReject(req)}
                              className="flex-1 bg-white text-red-500 border-2 border-red-50 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                            >
                              Rejeter
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-center text-xs italic">
                          Dossier archivé - Lecture seule
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedRequestId(null)}
                        className="px-8 bg-slate-200 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RentalLogisticsView;
