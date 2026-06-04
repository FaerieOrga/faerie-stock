import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Plus,
  Trash2,
  Search,
  ArrowLeft,
  Loader2,
  Lock,
  User,
  Pencil,
  Check,
  X,
  MessageSquare,
  Hash,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const ContactListView = ({
  contacts = [],
  isAdmin,
  isGuest,
  onBack,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    discord_handle: '', // Nouveau champ
  });

  const filteredContacts = contacts.filter((c) =>
    `${c.first_name} ${c.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contacts').insert([formData]);
      if (error) throw error;
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        discord_handle: '',
      });
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert("Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .update(editFormData)
        .eq('id', id);
      if (error) throw error;
      setEditingId(null);
      onRefresh();
    } catch (err) {
      alert('Erreur modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (contact) => {
    setEditingId(contact.id);
    setEditFormData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone: contact.phone,
      email: contact.email,
      discord_handle: contact.discord_handle || '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 text-left animate-in fade-in duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 mb-6 font-bold hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Répertoire
          </h2>
          <p className="text-slate-400 font-medium italic">
            Communication équipe & partenaires
          </p>
        </div>
        {!isGuest && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
          >
            {showAddForm ? <X size={24} /> : <Plus size={24} />}
          </button>
        )}
      </div>

      {/* FORMULAIRE D'AJOUT */}
      {showAddForm && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-xl mb-8 space-y-4 animate-in zoom-in-95">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Prénom"
              required
              className="px-5 py-3 rounded-xl bg-slate-50 border-none font-bold"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
            <input
              placeholder="Nom"
              required
              className="px-5 py-3 rounded-xl bg-slate-50 border-none font-bold"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
            <input
              placeholder="Téléphone"
              className="px-5 py-3 rounded-xl bg-slate-50 border-none font-bold"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <input
              placeholder="Email"
              type="email"
              className="px-5 py-3 rounded-xl bg-slate-50 border-none font-bold"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <div className="md:col-span-2 relative">
              <MessageSquare
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              />
              <input
                placeholder="ID Discord (ex: pseudo#0000)"
                className="w-full pl-12 pr-5 py-3 rounded-xl bg-blue-50 border-none font-bold text-blue-700"
                value={formData.discord_handle}
                onChange={(e) =>
                  setFormData({ ...formData, discord_handle: e.target.value })
                }
              />
            </div>
          </div>
          <button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              'Créer la fiche contact'
            )}
          </button>
        </div>
      )}

      {/* RECHERCHE */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Rechercher par nom..."
          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTE DES CONTACTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            {editingId === contact.id ? (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-sm font-bold border-2 border-blue-400"
                    value={editFormData.first_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        first_name: e.target.value,
                      })
                    }
                  />
                  <input
                    className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-sm font-bold border-2 border-blue-400"
                    value={editFormData.last_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  placeholder="Téléphone"
                />
                <input
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  placeholder="Email"
                />
                <input
                  className="w-full px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 font-bold"
                  value={editFormData.discord_handle}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      discord_handle: e.target.value,
                    })
                  }
                  placeholder="Discord Handle"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdate(contact.id)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-black uppercase"
                  >
                    <Check size={14} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-xl text-xs font-black uppercase"
                  >
                    <X size={14} className="mx-auto" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                      {contact.first_name[0]}
                      {contact.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                        {contact.last_name} {contact.first_name}
                      </h3>
                    </div>
                  </div>
                  {!isGuest && (
                    <button
                      onClick={() => startEditing(contact)}
                      className="p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* Discord */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="bg-indigo-50 p-1.5 rounded-lg">
                      <Hash size={14} className="text-indigo-600" />
                    </div>
                    {isGuest ? (
                      <span className="text-slate-300 italic text-xs flex items-center gap-1">
                        <Lock size={10} /> Masqué
                      </span>
                    ) : (
                      <span className="font-bold text-sm text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md">
                        {contact.discord_handle || '—'}
                      </span>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <Phone size={14} className="text-blue-500" />
                    </div>
                    {isGuest ? (
                      <span className="text-slate-300 italic text-xs flex items-center gap-1">
                        <Lock size={10} /> Masqué
                      </span>
                    ) : (
                      <a
                        href={`tel:${contact.phone}`}
                        className="font-bold text-sm hover:text-blue-600"
                      >
                        {contact.phone || '—'}
                      </a>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <Mail size={14} className="text-blue-500" />
                    </div>
                    {isGuest ? (
                      <span className="text-slate-300 italic text-xs flex items-center gap-1">
                        <Lock size={10} /> Masqué
                      </span>
                    ) : (
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-bold text-sm hover:text-blue-600 truncate"
                      >
                        {contact.email || '—'}
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactListView;
