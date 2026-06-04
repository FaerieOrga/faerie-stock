import React, { useState } from 'react';
import {
  Search,
  Calendar,
  User,
  AlertCircle,
  History,
  ArrowRight,
  Clock,
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';
import { cleanDate, isRentalOverdue } from '../../utils/formatters';

const RentalView = ({
  rentals = [],
  rentalHistory = [],
  isGuest,
  onRentalClick,
  isAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // --- FILTRAGE DES LOCATIONS ACTIVES ---
  const filteredRentals = rentals.filter(
    (r) =>
      (r.objectName || r.object_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (r.renter || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- FILTRAGE DE L'HISTORIQUE ---
  const filteredHistory = rentalHistory.filter(
    (h) =>
      (h.objectName || h.object_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (h.renter || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto w-full pb-24">
      {/* --- BARRE DE RECHERCHE & TOGGLE --- */}
      <div className="bg-white p-4 shadow-sm sticky top-[72px] z-20 no-print space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher un loueur ou un objet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setShowHistory(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              !showHistory
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-500'
            }`}
          >
            <Calendar size={16} /> Actives ({rentals.length})
          </button>
          <button
            onClick={() => {
              !isGuest ? setShowHistory(true) : '';
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              showHistory
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-500'
            }`}
          >
            <History size={16} /> Historique ({rentalHistory.length})
          </button>
        </div>
      </div>

      <div className="p-4">
        {!showHistory ? (
          /* --- LISTE DES LOCATIONS ACTIVES --- */
          <div className="space-y-3">
            {filteredRentals.length > 0 ? (
              filteredRentals.map((rental) => {
                const isOverdue = isRentalOverdue(
                  rental.returnDate || rental.return_date
                );
                return (
                  <div
                    key={rental.id}
                    onClick={() => onRentalClick && onRentalClick(rental)}
                    className={`bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 cursor-pointer border-l-4 transition-all active:scale-[0.98] ${
                      isOverdue
                        ? 'border-red-500 bg-red-50/30'
                        : 'border-blue-500'
                    }`}
                  >
                    <DisplayImage
                      src={rental.photo}
                      className="h-16 w-16 shrink-0 shadow-sm"
                      size="text-3xl"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 truncate">
                          {rental.objectName || rental.object_name}
                        </h3>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase animate-pulse">
                            <AlertCircle size={12} /> Retard
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 font-medium mt-1">
                        <User size={14} className="text-slate-400" />{' '}
                        {rental.renter}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Retour :{' '}
                          {cleanDate(rental.returnDate || rental.return_date) ||
                            '?'}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 italic">
                Aucune location en cours
              </div>
            )}
          </div>
        ) : (
          /* --- LISTE DE L'HISTORIQUE --- */
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 opacity-75 border border-slate-100"
                >
                  <DisplayImage
                    src={item.photo}
                    className="h-12 w-12 shrink-0 grayscale"
                    size="text-2xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-700 text-sm truncate">
                      {item.objectName || item.object_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Loué par : <strong>{item.renter}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                      Rendu le{' '}
                      {new Date(
                        item.actualReturnDate || item.actual_return_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 italic">
                Aucun historique disponible
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalView;
