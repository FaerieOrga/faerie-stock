import React, { useState, useEffect, useMemo } from 'react';
import {
  Hammer,
  ShoppingCart,
  ArrowLeft,
  Save,
  Clock,
  CheckCircle2,
  Plus,
  ChevronRight,
  Search,
  Tag,
  Box,
  FileText,
  Calendar,
  Trash2,
} from 'lucide-react';
import { supabase } from '../../api/supabase';
import { CATEGORIES as CATEGORIES_LIST } from '../../utils/constants';

const StockRequestView = ({
  objects,
  onBack,
  fetchData: refreshGlobalData,
}) => {
  const [activeTab, setActiveTab] = useState('current');
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    request_name: '',
    description: '',
    object_name: '',
    request_type: 'achat',
    categories: [],
    target_crate: null,
    quantity: 1,
    is_new_object: true,
    existing_object_id: null,
  });

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const isCorrectTab =
        activeTab === 'current'
          ? req.status === 'en_cours'
          : req.status === 'termine';
      const matchesSearch =
        req.request_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.object_name.toLowerCase().includes(searchTerm.toLowerCase());
      return isCorrectTab && matchesSearch;
    });
  }, [requests, activeTab, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const dataToSubmit = {
      ...formData,
      target_crate: formData.target_crate
        ? parseInt(formData.target_crate)
        : null,
      existing_object_id: formData.existing_object_id
        ? parseInt(formData.existing_object_id)
        : null,
      quantity: parseInt(formData.quantity) || 1,
    };

    try {
      const { data: requestData, error: requestError } = await supabase
        .from('stock_requests')
        .insert([dataToSubmit])
        .select()
        .single();

      if (requestError) throw requestError;

      const today = new Date();
      const deadline = new Date();
      deadline.setMonth(today.getMonth() + 2);

      const newTask = {
        title: `[STOCK] ${formData.request_type.toUpperCase()} ${
          formData.object_name
        }`,
        description: formData.description,
        status: 'todo',
        priority: 'medium',
        event_name:
          formData.request_type === 'achat'
            ? 'OBJETS A ACHETER'
            : 'OBJETS A CRAFT',
        start_date: today.toISOString().split('T')[0],
        deadline: deadline.toISOString().split('T')[0],
        categories: formData.categories,
        related_request_id: requestData.id,
      };

      const { error: taskError } = await supabase
        .from('tasks')
        .insert([newTask]);
      if (taskError) throw taskError;

      setShowForm(false);
      fetchRequests();
      if (refreshGlobalData) refreshGlobalData();

      setFormData({
        request_name: '',
        description: '',
        object_name: '',
        request_type: 'achat',
        categories: [],
        target_crate: null,
        quantity: 1,
        is_new_object: true,
        existing_object_id: null,
      });

      alert('Demande enregistrée et ajoutée au Board !');
    } catch (err) {
      console.error(err);
      alert('Erreur : ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (req) => {
    if (
      !window.confirm(
        'Es-tu sûr de vouloir supprimer cette demande ? Cela supprimera également la tâche associée sur le Board.'
      )
    )
      return;

    try {
      await supabase.from('tasks').delete().eq('related_request_id', req.id);
      const { error } = await supabase
        .from('stock_requests')
        .delete()
        .eq('id', req.id);

      if (error) throw error;

      alert('Demande supprimée.');
      setSelectedRequest(null);
      fetchRequests();
      if (refreshGlobalData) refreshGlobalData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  // --- RENDER : FORMULAIRE ---
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 text-left my-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setShowForm(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
            Nouvelle Demande
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, request_type: 'achat' })
              }
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black transition-all ${
                formData.request_type === 'achat'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-100 text-slate-400'
              }`}
            >
              <ShoppingCart size={20} /> ACHAT
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, request_type: 'craft' })
              }
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black transition-all ${
                formData.request_type === 'craft'
                  ? 'border-orange-600 bg-orange-50 text-orange-600'
                  : 'border-slate-100 text-slate-400'
              }`}
            >
              <Hammer size={20} /> CRAFT
            </button>
          </div>
          <div className="space-y-4">
            <input
              required
              placeholder="Nom de la demande..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
              value={formData.request_name}
              onChange={(e) =>
                setFormData({ ...formData, request_name: e.target.value })
              }
            />
            <div className="flex gap-4">
              <input
                required
                placeholder="Nom de l'objet"
                className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                value={formData.object_name}
                onChange={(e) =>
                  setFormData({ ...formData, object_name: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Qté"
                className="w-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black outline-none focus:border-blue-500"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </div>
            <div className="relative">
              <Box
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="number"
                placeholder="Caisse cible (optionnel)"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500"
                value={formData.target_crate || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_crate: e.target.value === '' ? null : e.target.value,
                  })
                }
              />
            </div>
            <textarea
              placeholder="Description / Détails..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-24 resize-none outline-none font-bold focus:border-blue-500"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Catégories
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    formData.categories.includes(cat)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-3xl space-y-3 border border-indigo-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!formData.is_new_object}
                onChange={(e) =>
                  setFormData({ ...formData, is_new_object: !e.target.checked })
                }
                className="w-5 h-5 rounded border-indigo-300 text-indigo-600"
              />
              <span className="text-sm font-black text-indigo-900 uppercase">
                Ajouter à un objet existant
              </span>
            </label>
            {!formData.is_new_object && (
              <select
                required
                className="w-full p-3 rounded-xl border-2 border-indigo-100 font-bold text-sm"
                value={formData.existing_object_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    existing_object_id: e.target.value,
                  })
                }
              >
                <option value="">-- Choisir l'objet --</option>
                {[...objects]
                  .sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '', 'fr')
                  )
                  .map((obj) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.name} (Caisse {obj.crate || 'Vrac'})
                    </option>
                  ))}
              </select>
            )}
          </div>
          <button
            disabled={submitting}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            {submitting ? (
              'Création...'
            ) : (
              <>
                <Save size={20} /> Valider la demande
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // --- RENDER : DÉTAIL D'UNE DEMANDE ---
  if (selectedRequest) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100 text-left my-4 animate-in slide-in-from-bottom-10">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => setSelectedRequest(null)}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div
            className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm ${
              selectedRequest.status === 'termine'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {selectedRequest.status === 'termine'
              ? 'Demande Clôturée'
              : 'En cours de traitement'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {selectedRequest.request_type === 'achat' ? (
                  <ShoppingCart className="text-blue-500" size={20} />
                ) : (
                  <Hammer className="text-orange-500" size={20} />
                )}
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                  Demande de {selectedRequest.request_type}
                </span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 uppercase leading-none tracking-tighter">
                {selectedRequest.request_name}
              </h2>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
              <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                <FileText size={14} /> Description
              </h4>
              <p className="text-slate-600 font-bold leading-relaxed whitespace-pre-line">
                {selectedRequest.description || 'Aucune description fournie.'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(selectedRequest)}
              className="flex items-center gap-2 text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors px-2"
            >
              <Trash2 size={16} /> Supprimer la demande
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <span className="block text-[10px] font-black text-blue-400 uppercase mb-2">
                Objet Cible
              </span>
              <span className="text-xl font-black text-blue-900 block">
                {selectedRequest.object_name}
              </span>
              <span className="text-3xl font-black text-blue-600 block mt-2">
                x{selectedRequest.quantity}
              </span>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <Box size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  Caisse :{' '}
                  {selectedRequest.target_crate
                    ? `#${selectedRequest.target_crate}`
                    : 'Vrac'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  Créée le{' '}
                  {new Date(selectedRequest.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-2">
                <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">
                  Catégories
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedRequest.categories?.map((c) => (
                    <span
                      key={c}
                      className="bg-white border border-slate-200 text-slate-500 text-[9px] px-2 py-1 rounded-lg font-bold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VUE : LISTE DES DEMANDES ---
  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6 mx-4 mt-4 text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
              Demandes de Stock
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus size={18} /> Nouvelle demande
          </button>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase transition-all ${
              activeTab === 'current'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-500'
            }`}
          >
            <Clock size={16} /> En cours (
            {requests.filter((r) => r.status === 'en_cours').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase transition-all ${
              activeTab === 'history'
                ? 'bg-white shadow-sm text-green-600'
                : 'text-slate-500'
            }`}
          >
            <CheckCircle2 size={16} /> Historique (
            {requests.filter((r) => r.status === 'termine').length})
          </button>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Rechercher une demande..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="text-center p-20 text-slate-400 font-bold animate-pulse uppercase tracking-widest">
            Chargement...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center p-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400 font-bold italic">
            Aucune demande trouvée.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 group cursor-pointer hover:border-blue-200 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-6 w-full">
                <div
                  className={`p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${
                    req.request_type === 'achat'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  {req.request_type === 'achat' ? (
                    <ShoppingCart size={24} />
                  ) : (
                    <Hammer size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-lg text-slate-800 uppercase tracking-tighter leading-none">
                      {req.request_name}
                    </h3>
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                        req.request_type === 'achat'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {req.request_type}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500">
                    Objet :{' '}
                    <span className="text-slate-700">{req.object_name}</span> (x
                    {req.quantity})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Créée le
                  </p>
                  <p className="text-xs font-bold text-slate-600">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockRequestView;
