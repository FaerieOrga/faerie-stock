import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Shield,
  X,
  ArrowLeft,
  Search,
  Trash2,
  User,
  Loader2,
  Edit2,
  RefreshCw,
  Users,
  Pencil,
  Check,
  Plus,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

// ─────────────────────────────────────────────
// VUE UTILISATEURS (inchangée)
// ─────────────────────────────────────────────
const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('email');
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail(''); setPassword(''); setRole('user');
    setSelectedUserId(null); setIsEditing(false);
  };

  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setSelectedUserId(user.id);
    setEmail(user.email);
    setPassword('');
    setRole(user.role || 'user');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', selectedUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { role } },
        });
        if (error) throw error;
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert('Erreur : ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-600 uppercase tracking-tight">
          Utilisateurs de l'application
        </h3>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white p-2 rounded-xl shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            <UserPlus size={18} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Rechercher par email..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-bold text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-100">
            <User className="mx-auto text-slate-200 mb-3" size={40} />
            <p className="text-slate-400 font-bold text-sm">Aucun utilisateur</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  user.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {user.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{user.email}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.role || 'user'}</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenEdit(user)}
                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-xl p-8 w-full max-w-md border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
                {isEditing ? <Edit2 size={28} /> : <UserPlus size={28} />}
              </div>
              <h2 className="text-xl font-black text-slate-800">
                {isEditing ? 'Modifier le rôle' : 'Nouvel utilisateur'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Email</label>
                <input
                  type="email" required disabled={isEditing} value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold ${isEditing ? 'opacity-50' : ''}`}
                />
              </div>
              {!isEditing && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Mot de passe</label>
                  <input
                    type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">Rôle</label>
                <div className="grid grid-cols-2 gap-2">
                  {['admin', 'user'].map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                        role === r ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {r === 'admin' ? '👑 Admin' : '👤 User'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit" disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {submitting ? 'Traitement...' : isEditing ? 'Mettre à jour' : 'Créer le compte'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// VUE STAFF (CRUD complet sur la table staff)
// ─────────────────────────────────────────────
const StaffView = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('staff')
        .insert([{ name: newName.trim() }]);
      if (error) throw error;
      setNewName('');
      setIsAdding(false);
      fetchStaff();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editValue.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('staff')
        .update({ name: editValue.trim() })
        .eq('id', id);
      if (error) throw error;
      setEditingId(null);
      fetchStaff();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer "${name}" du staff ?`)) return;
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      fetchStaff();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  const filteredStaff = staff.filter((s) =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-600 uppercase tracking-tight">
          Membres du staff
        </h3>
        <div className="flex gap-2">
          <button
            onClick={fetchStaff}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { setIsAdding(true); setNewName(''); }}
            className="bg-indigo-600 text-white p-2 rounded-xl shadow-md hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* FORMULAIRE AJOUT */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="flex gap-2 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2 duration-200"
        >
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du membre..."
            className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-indigo-200 font-bold text-sm outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={submitting || !newName.trim()}
            className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-3 text-slate-400 hover:bg-white rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </form>
      )}

      {/* RECHERCHE */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Rechercher un membre..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* COMPTEUR */}
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        {filteredStaff.length} membre{filteredStaff.length > 1 ? 's' : ''}
      </p>

      {/* LISTE */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-indigo-600" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-100">
            <Users className="mx-auto text-slate-200 mb-3" size={40} />
            <p className="text-slate-400 font-bold text-sm">Aucun membre dans le staff</p>
            <p className="text-xs text-slate-300 mt-1">Clique sur + pour en ajouter un.</p>
          </div>
        ) : (
          filteredStaff.map((member) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all"
            >
              {editingId === member.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(member.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-indigo-400 font-bold text-sm outline-none bg-indigo-50"
                  />
                  <button
                    onClick={() => handleUpdate(member.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase">
                      {(member.name || '?').charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{member.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(member.id); setEditValue(member.name); }}
                      className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
const UserManagementView = ({ onBack }) => {
  const [activeView, setActiveView] = useState('users');

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={22} className="text-slate-600" />
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
          Administration
        </h2>
      </div>

      {/* SÉLECTEUR DE VUE */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveView('users')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
            activeView === 'users'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User size={14} /> Utilisateurs
        </button>
        <button
          onClick={() => setActiveView('staff')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
            activeView === 'staff'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users size={14} /> Staff
        </button>
      </div>

      {/* CONTENU */}
      {activeView === 'users' ? <UsersView /> : <StaffView />}
    </div>
  );
};

export default UserManagementView;