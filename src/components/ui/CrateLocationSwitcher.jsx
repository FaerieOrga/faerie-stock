import React, { useState } from 'react';

/**
 * Composant permettant de changer le lieu d'une caisse.
 * Supporte la sélection dans une liste existante ou la création d'un nouveau lieu.
 */
export const CrateLocationSwitcher = ({
  crateNum,
  currentLocation,
  knownLocations = [],
  onUpdate,
  isGuest,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(currentLocation || '');

  // Si invité, on n'affiche rien ou juste le texte (lecture seule)
  if (isGuest) return null;

  // --- MODE ÉDITION (Input libre) ---
  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="mt-2 px-2">
        <input
          autoFocus
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => {
            onUpdate(crateNum, { location: tempValue });
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdate(crateNum, { location: tempValue });
              setIsEditing(false);
            }
          }}
          className="w-full text-[10px] text-center border-2 border-blue-500 rounded-lg px-1 py-1 focus:outline-none bg-white font-bold text-blue-800 shadow-sm"
          placeholder="Nom du lieu..."
        />
      </div>
    );
  }

  // --- MODE SÉLECTION (Menu déroulant) ---
  return (
    <div onClick={(e) => e.stopPropagation()} className="mt-2 px-2">
      <select
        value={currentLocation || ''}
        onChange={(e) => {
          if (e.target.value === '__NEW__') {
            setTempValue('');
            setIsEditing(true);
          } else {
            onUpdate(crateNum, { location: e.target.value });
          }
        }}
        className="w-full text-[10px] text-center border border-slate-200 rounded-lg px-1 py-1 focus:border-blue-500 bg-white font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <option value="" className="text-slate-400 italic">
          📍 Non défini
        </option>
        {knownLocations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
        <option disabled>──────────</option>
        <option value="__NEW__" className="font-bold text-blue-600">
          ✨ Nouveau lieu...
        </option>
      </select>
    </div>
  );
};
