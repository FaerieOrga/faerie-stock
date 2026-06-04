import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Box,
  MapPin,
  Package,
  Search,
  X,
  Edit2,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const ObjectSearchInput = ({ availableObjects, value, onChange }) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filtered = availableObjects
    .filter((obj) => obj.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Rechercher un objet..."
          className="w-full p-3 pl-9 bg-white rounded-xl font-bold text-sm border-2 border-slate-100 focus:border-blue-400 outline-none transition-all"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') onChange('');
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {isOpen && query.length > 0 && (
        <div className="absolute z-[110] w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden">
          {filtered.length > 0 ? (
            filtered.map((obj) => (
              <button
                key={obj}
                type="button"
                className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => {
                  setQuery(obj);
                  onChange(obj);
                  setIsOpen(false);
                }}
              >
                {obj}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-slate-400 italic">
              Aucun résultat
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TemplateManagerView = ({ onBack }) => {
  const [templates, setTemplates] = useState([]);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [availableObjects, setAvailableObjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [items, setItems] = useState([
    { object_name: '', target_crate: '', location: '' },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data: tplData } = await supabase
      .from('event_templates')
      .select('*, items:event_template_items(*)');
    if (tplData) setTemplates(tplData);

    const { data: locsData } = await supabase.from('locations').select('name');
    if (locsData)
      setSuggestedLocations(
        [...new Set(locsData.map((l) => l.name?.toUpperCase().trim()))]
          .filter(Boolean)
          .sort()
      );

    const { data: objsData } = await supabase
      .from('objects')
      .select('name')
      .order('name');
    if (objsData)
      setAvailableObjects(
        [...new Set(objsData.map((o) => o.name))].filter(Boolean)
      );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (tpl) => {
    setEditingTemplateId(tpl.id);
    setTemplateName(tpl.name);
    setItems(
      tpl.items.length > 0
        ? tpl.items.map((i) => ({
            object_name: i.object_name,
            target_crate: i.target_crate || '',
            location: i.location || '',
          }))
        : [{ object_name: '', target_crate: '', location: '' }]
    );
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!templateName) return alert('Nom requis');
    setLoading(true);
    try {
      let tplId = editingTemplateId;
      if (editingTemplateId) {
        await supabase
          .from('event_templates')
          .update({ name: templateName })
          .eq('id', editingTemplateId);
        await supabase
          .from('event_template_items')
          .delete()
          .eq('template_id', editingTemplateId);
      } else {
        const { data } = await supabase
          .from('event_templates')
          .insert([{ name: templateName }])
          .select()
          .single();
        tplId = data.id;
      }

      const itemsToInsert = items
        .filter((i) => i.object_name)
        .map((it) => ({
          template_id: tplId,
          object_name: it.object_name,
          target_crate: it.target_crate ? parseInt(it.target_crate) : null,
          location: it.location,
          quantity: 1, // Forcé à 1 par défaut en base
        }));

      await supabase.from('event_template_items').insert(itemsToInsert);
      setShowForm(false);
      setEditingTemplateId(null);
      setTemplateName('');
      setItems([{ object_name: '', target_crate: '', location: '' }]);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 text-left">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft />
        </button>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
          Templates de Kits
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-all"
          >
            + Nouveau Kit
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-blue-100 mb-10 space-y-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <input
            placeholder="NOM DU KIT..."
            className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative"
              >
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                      Objet
                    </label>
                    <ObjectSearchInput
                      availableObjects={availableObjects}
                      value={item.object_name}
                      onChange={(val) => {
                        const n = [...items];
                        n[idx].object_name = val;
                        setItems(n);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                      Caisse Cible
                    </label>
                    <input
                      type="number"
                      placeholder="N° Caisse"
                      className="w-full p-3 bg-white rounded-xl font-bold text-sm border-2 border-slate-100 outline-none"
                      value={item.target_crate}
                      onChange={(e) => {
                        const n = [...items];
                        n[idx].target_crate = e.target.value;
                        setItems(n);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 ml-2">
                    <MapPin size={10} /> Lieu d'affectation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      placeholder="Saisir lieu..."
                      className="flex-1 p-3 bg-blue-50/50 rounded-xl font-bold text-sm border-none"
                      value={item.location}
                      onChange={(e) => {
                        const n = [...items];
                        n[idx].location = e.target.value;
                        setItems(n);
                      }}
                    />
                    {suggestedLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          const n = [...items];
                          n[idx].location = loc;
                          setItems(n);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                          item.location === loc
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-400 border border-slate-200'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setItems([
                  ...items,
                  { object_name: '', target_crate: '', location: '' },
                ])
              }
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[10px] uppercase"
            >
              + Ajouter un objet
            </button>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTemplateId(null);
              }}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
            >
              {loading ? 'Enregistrement...' : 'Sauvegarder le Template'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative group text-left"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Package size={20} />
                </div>
                <h3 className="font-black text-lg text-slate-800 uppercase tracking-tighter">
                  {tpl.name}
                </h3>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEdit(tpl)}
                  className="p-2 bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Supprimer ?')) {
                      await supabase
                        .from('event_templates')
                        .delete()
                        .eq('id', tpl.id);
                      fetchData();
                    }
                  }}
                  className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {tpl.items?.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[11px] font-bold p-2 bg-slate-50 rounded-xl"
                >
                  <span className="text-slate-600 truncate">
                    {it.object_name}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-400">
                    <MapPin size={10} /> {it.location || 'Vrac'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateManagerView;
