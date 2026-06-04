import React from 'react';
import {
  ArrowLeft,
  Camera,
  Trash2,
  Calendar,
  Minus,
  Plus,
  FileText,
  QrCode,
  Warehouse,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';
import CategoryMultiSelect from '../forms/CategoryMultiSelect';
import { ITEM_STATES } from '../../utils/constants';
import { supabase } from '../../api/supabase';

const ObjectDetail = ({
  object,
  onBack,
  onUpdate,
  onDelete,
  onRent,
  onOpenQR,
  onUploadImage,
  isGuest,
  isAdmin,
  uploading,
  warehouses = [],
}) => {
  if (!object) return null;

  const [localNotes, setLocalNotes] = React.useState(object.notes || '');

  // --- ÉTATS ÉDITION NOM ---
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editName, setEditName] = React.useState(object.name || '');

  const currentUrl = window.location.origin;

  // --- LOGIQUE DE NETTOYAGE DES CATÉGORIES ---
  const getCleanCategories = (rawCategories) => {
    if (!rawCategories) return [];
    if (Array.isArray(rawCategories)) return rawCategories;
    if (typeof rawCategories === 'string' && rawCategories.startsWith('[')) {
      try {
        const parsed = JSON.parse(rawCategories);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return [rawCategories.replace(/[\[\]"]/g, '')];
      }
    }
    return [rawCategories];
  };

  const cleanCategories = React.useMemo(
    () => getCleanCategories(object.category),
    [object.category]
  );

  React.useEffect(() => {
    setLocalNotes(object.notes || '');
    setEditName(object.name || '');
  }, [object.id, object.notes, object.name]);

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === object.name) {
      setIsEditingName(false);
      setEditName(object.name || '');
      return;
    }
    await onUpdate(object.id, { name: trimmed });
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setEditName(object.name || '');
    setIsEditingName(false);
  };

  const createRepairTask = async (obj) => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(today.getMonth() + 2);

      const newTask = {
        title: `[OBJET A REPARER] ${obj.name}`,
        status: 'todo',
        priority: 'medium',
        event_name: 'OBJETS A REPARER',
        start_date: today.toISOString().split('T')[0],
        deadline: endDate.toISOString().split('T')[0],
        categories: ['Craft'],
        related_object_id: obj.id,
        description: `Généré automatiquement : l'objet "${obj.name}" est passé en statut ${ITEM_STATES[3]}.`,
      };

      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) throw error;
    } catch (err) {
      console.error('Erreur lors de la création de la tâche:', err.message);
    }
  };

  const isVrac = !object.crate || object.crate === 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-10 text-left">
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <button
          onClick={onBack}
          className="text-slate-600 font-bold flex items-center gap-2 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Retour
        </button>
        <h2 className="font-black text-slate-800 uppercase tracking-tight text-sm">
          Fiche Matériel
        </h2>
        <div className="w-20"></div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100 text-center">
            {/* NOM AVEC ÉDITION INLINE */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {isEditingName ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelName();
                    }}
                    className="flex-1 text-2xl font-black text-slate-800 text-center border-b-2 border-blue-500 bg-transparent outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg shrink-0"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancelName}
                    className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg shrink-0"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-slate-800">
                    {object.name}
                  </h1>
                  {!isGuest && (
                    <button
                      onClick={() => {
                        setEditName(object.name || '');
                        setIsEditingName(true);
                      }}
                      className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                      title="Modifier le nom"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="relative inline-block">
              <DisplayImage
                src={object.photo}
                className="h-64 w-64 mx-auto rounded-3xl shadow-lg object-cover"
                size="text-7xl"
              />
              {!isGuest && (
                <label className="absolute bottom-3 right-3 bg-blue-600 text-white p-3 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  {uploading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Camera size={20} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file)
                        onUploadImage(file).then((url) =>
                          onUpdate(object.id, { photo: url })
                        );
                    }}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="mt-8 space-y-4 text-left">
              {/* SECTION CAISSE */}
              <div className="flex items-center justify-between px-2">
                <span className="text-slate-400 font-bold uppercase text-xs">
                  Caisse
                </span>
                <input
                  type="number"
                  value={object.crate || 0}
                  onChange={(e) => {
                    const newCrate = parseInt(e.target.value) || 0;
                    onUpdate(object.id, { crate: newCrate });
                  }}
                  className="w-24 py-2 bg-blue-50 text-blue-700 border-2 border-blue-100 rounded-xl text-center font-black text-lg outline-none"
                />
              </div>

              {/* SECTION ENTREPÔT (CONDITIONNELLE AU VRAC) */}
              {isVrac && !isGuest && (
                <div className="flex items-center justify-between px-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Warehouse size={14} />
                    <span className="font-bold uppercase text-[10px]">
                      Entrepôt (Vrac)
                    </span>
                  </div>
                  <select
                    value={object.warehouse_id || ''}
                    onChange={(e) =>
                      onUpdate(object.id, {
                        warehouse_id: e.target.value || null,
                      })
                    }
                    className="w-48 py-2 px-3 bg-blue-50 border-2 border-blue-100 rounded-xl font-bold text-blue-700 text-xs outline-none"
                  >
                    <option value="">Non assigné</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between px-2">
                <span className="text-slate-400 font-bold uppercase text-xs">
                  Quantité
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      onUpdate(object.id, {
                        quantity: Math.max(0, object.quantity - 1),
                      })
                    }
                    className="p-2 bg-red-50 text-red-500 rounded-lg"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-black text-xl">
                    {object.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdate(object.id, { quantity: object.quantity + 1 })
                    }
                    className="p-2 bg-green-50 text-green-500 rounded-lg"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <span className="text-slate-400 font-bold uppercase text-xs">
                  État
                </span>
                <select
                  value={object.state}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdate(object.id, { state: val });
                    if (val === ITEM_STATES[3]) createRepairTask(object);
                  }}
                  className="w-48 py-2 px-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 text-sm outline-none"
                >
                  {ITEM_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm p-5 text-center border border-slate-100">
            <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-4">
              QR Code
            </h3>
            <div
              onClick={(e) => onOpenQR(e, 'object', object.id, object.name)}
              className="cursor-pointer inline-block p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  `${currentUrl}/?item=${object.id}`
                )}`}
                alt="QR"
                className="w-32 h-32 mix-blend-multiply"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">
              Caractéristiques
            </h3>
            <div className="space-y-6">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-3">
                  Catégories
                </span>
                <CategoryMultiSelect
                  selected={cleanCategories}
                  isGuest={isGuest}
                  onChange={(newCats) =>
                    onUpdate(object.id, { category: newCats })
                  }
                />
              </div>

              <div className="bg-yellow-50/50 border border-yellow-100 rounded-[1.5rem] p-5">
                <h4 className="flex items-center gap-2 text-yellow-800 font-bold text-xs uppercase mb-3">
                  <FileText size={16} /> Notes / Détails
                </h4>
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  onBlur={() => {
                    if (localNotes !== object.notes)
                      onUpdate(object.id, { notes: localNotes });
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 italic resize-none p-0"
                  placeholder="Ajouter une note..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm("Supprimer l'objet ?"))
                    onDelete(object.id);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-all"
              >
                <Trash2 size={18} /> Supprimer l'objet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetail;
