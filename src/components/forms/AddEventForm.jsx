import React, { useState, useEffect } from 'react';
import { X, Package, ClipboardList, Layers, ChevronDown } from 'lucide-react';
import { supabase } from '../../api/supabase';

const AddEventForm = ({ onAdd, onCancel }) => {
  const [templates, setTemplates] = useState([]);
  const [dateError, setDateError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    display_mode: 'logistics',
    template_id: null,
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('event_templates')
        .select('id, name')
        .order('name');
      setTemplates(data || []);
    };
    fetchTemplates();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Le nom est obligatoire');

    // Validation des dates si mode logistique
    if (formData.display_mode === 'logistics' && formData.start_date && formData.end_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);

      if (end <= today) {
        setDateError('La date de fin doit être postérieure à aujourd\'hui.');
        return;
      }
      if (end < start) {
        setDateError('La date de fin ne peut pas être antérieure à la date de début.');
        return;
      }
      setDateError('');
    }

    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden text-left animate-in zoom-in duration-200"
      >
        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
            Nouvel Événement
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* NOM */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
              Nom de l'événement
            </label>
            <input
              type="text"
              required
              placeholder="Ex: GN Automne"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* TYPE D'ORGANISATION */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 ml-1">
              Type d'organisation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, display_mode: 'logistics' })
                }
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.display_mode === 'logistics'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                <Package size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Logistique
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    display_mode: 'kanban',
                    template_id: null,
                  })
                }
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.display_mode === 'kanban'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-500'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                <ClipboardList size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Kanban
                </span>
              </button>
            </div>
          </div>

          {/* CHAMP TEMPLATE (Visible si Logistique) */}
          {formData.display_mode === 'logistics' && (
            <div className="p-5 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100 space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-500 ml-1">
                <Layers size={14} /> Kit de matériel (Template)
              </label>
              <div className="relative">
                <select
                  className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm appearance-none cursor-pointer"
                  value={formData.template_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      template_id: e.target.value || null,
                    })
                  }
                >
                  <option value="">Aucun kit (Vierge)</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* DATES (Visible si Logistique) */}
          {formData.display_mode === 'logistics' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Début</label>
                  <input
                    type="date"
                    className={`w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none ${
                      dateError ? 'border-red-300 bg-red-50' : 'border-slate-100'
                    }`}
                    value={formData.start_date}
                    onChange={(e) => {
                      setDateError('');
                      setFormData({ ...formData, start_date: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fin</label>
                  <input
                    type="date"
                    className={`w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none ${
                      dateError ? 'border-red-300 bg-red-50' : 'border-slate-100'
                    }`}
                    value={formData.end_date}
                    onChange={(e) => {
                      setDateError('');
                      setFormData({ ...formData, end_date: e.target.value });
                    }}
                  />
                </div>
              </div>
              {dateError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 animate-in slide-in-from-top-1 duration-200">
                  <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
                  <p className="text-xs font-bold text-red-600">{dateError}</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
          >
            Créer l'Événement
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEventForm;