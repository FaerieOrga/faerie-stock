import React, { useState, useEffect } from 'react';
import { Calendar, User, X, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../../api/supabase'; // Importez votre instance supabase

const RentModal = ({ object, rentals = [], onClose, onConfirm, loading }) => {
  const [renter, setRenter] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [eventPeriods, setEventPeriods] = useState([]); // Nouvel état pour les événements

  // 1. Charger les dates où l'objet est utilisé dans un événement
  useEffect(() => {
    const fetchEventOccupations = async () => {
      if (!object?.id) return;

      const { data, error } = await supabase
        .from('event_objects')
        .select(
          `
          event_id,
          events (
            name,
            start_date,
            end_date
          )
        `
        )
        .eq('object_id', object.id);

      if (!error && data) {
        // On transforme les données pour correspondre au format des périodes
        const periods = data
          .filter((item) => item.events) // Sécurité si un event est supprimé
          .map((item) => ({
            start: new Date(item.events.start_date),
            end: new Date(item.events.end_date),
            label: item.events.name,
            type: 'Événement',
          }));
        setEventPeriods(periods);
      }
    };

    fetchEventOccupations();
  }, [object.id]);

  if (!object || !object.id || !object.name) return null;

  // 2. Fusionner les locations (rentals) et les événements (eventPeriods)
  const occupiedPeriods = [
    ...rentals
      .filter((r) => r.object_id === object.id || r.object_name === object.name)
      .map((r) => ({
        start: new Date(r.start_date),
        end: new Date(r.return_date),
        label: r.renter || 'Location',
        type: 'Location',
      })),
    ...eventPeriods,
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!renter || !returnDate)
      return alert('Veuillez remplir tous les champs');

    const start = new Date(startDate);
    const end = new Date(returnDate);

    // --- AJOUT DE LA VALIDATION DES DATES ---
    if (end < start) {
      return alert(
        'La date de retour ne peut pas être antérieure à la date de début.'
      );
    }
    // ----------------------------------------

    // Vérification de chevauchement sur la liste fusionnée
    const conflict = occupiedPeriods.find((period) => {
      return start <= period.end && end >= period.start;
    });

    if (conflict) {
      return alert(
        `Attention : Cet objet est déjà réservé par un ${conflict.type} (${conflict.label}) sur cette période !`
      );
    }

    onConfirm({
      renter,
      return_date: returnDate,
      object_id: object.id,
      object_name: object.name,
      start_date: startDate,
      photo: object.photo,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 no-print text-left">
      <div
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">
            Louer l'objet
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-600 uppercase mb-1">
            Objet sélectionné
          </p>
          <p className="text-lg font-black text-slate-800">{object.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1 mb-1">
              <User size={12} /> Nom du locataire
            </label>
            <input
              required
              type="text"
              value={renter}
              onChange={(e) => setRenter(e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full px-4 py-4 border-2 border-slate-100 rounded-2xl font-bold bg-slate-50 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">
                Début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-3 border-2 border-slate-100 rounded-xl font-bold bg-slate-50 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">
                Fin prévue
              </label>
              <input
                required
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-3 border-2 border-slate-100 rounded-xl font-bold bg-slate-50 text-xs outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1">
              <Calendar size={12} /> Calendrier des réservations
            </p>

            {occupiedPeriods.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {occupiedPeriods.map((period, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-white p-2 rounded-xl border border-slate-100 text-[10px]"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`font-black uppercase ${
                          period.type === 'Événement'
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}
                      >
                        {period.type}
                      </span>
                      <span className="text-slate-400">{period.label}</span>
                    </div>
                    <span className="text-slate-600 font-bold">
                      Du {period.start.toLocaleDateString()} au{' '}
                      {period.end.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                <CheckCircle size={12} /> Disponible immédiatement
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={20} />
                  Valider la sortie
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentModal;
