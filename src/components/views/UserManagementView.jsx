import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Shield,
  eye,
  eyeOff,
  X,
  ArrowLeft,
  Search,
  Trash2,
  User,
  Loader2,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const UserManagementView = ({ onBack }) => {
  // --- ÉTATS LISTE ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ÉTATS MODALE (Création/Edition) ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // On interroge la table 'profiles' que tu as créée
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('email');

      if (error) {
        console.error('Erreur Supabase:', error);
        // Si erreur, c'est souvent un problème de permissions RLS
        alert(
          "Erreur de lecture : Vérifiez les politiques RLS sur la table 'profiles'"
        );
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Erreur système:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('user');
    setSelectedUserId(null);
    setIsEditing(false);
    setShowPassword(false);
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
          .update({ role: role })
          .eq('id', selectedUserId);

        if (error) throw error;
        alert('✅ Rôle mis à jour !');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: role },
            emailRedirectTo: null,
            // Cette option empêche Supabase de te connecter sur le nouveau compte
            // Note: selon la version de supabase-js, l'auto-confirm peut varier
          },
        });
        if (error) throw error;
        alert(`✅ Utilisateur ${email} créé !`);
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
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-300">
      {/* 1. HEADER LISTE */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Tous les utilisateurs de l'application
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-lg transition-all active:scale-95"
          >
            <UserPlus size={24} />
          </button>
        </div>
      </div>

      {/* 2. RECHERCHE */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par email..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. LISTE DES UTILISATEURS */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
            <User className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">
              Aucun membre dans la table 'profiles'
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Vérifiez que le script SQL a bien été exécuté.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group transition-all hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    user.role === 'admin'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  {user.role === 'admin' ? (
                    <Shield size={22} />
                  ) : (
                    <User size={22} />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-none">
                    {user.email}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {user.role || 'user'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. MODALE DE SAISIE */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
          <div className="max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-[32px] shadow-xl p-8 border border-slate-100 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                  {isEditing ? <Edit2 size={32} /> : <UserPlus size={32} />}
                </div>
                <h2 className="text-2xl font-black text-slate-800">
                  {isEditing ? 'Modifier Profil' : 'Nouvel Utilisateur'}
                </h2>
                <p className="text-sm text-slate-400 font-medium text-center px-4">
                  {isEditing
                    ? `Changer le rôle de ${email}`
                    : "Ajouter un membre à l'équipe Faérie"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 ${
                      isEditing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {!isEditing && (
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">
                      Mot de passe
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-9 text-slate-400"
                    >
                      {showPassword ? <eyeOff size={20} /> : <eye size={20} />}
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 block">
                    Rôle assigné
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['admin', 'user'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                          role === r
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {r === 'admin'
                          ? '👑 Admin'
                          : r === 'user'
                          ? '👤 User'
                          : '👀 Guest'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {submitting
                    ? 'Traitement...'
                    : isEditing
                    ? 'Mettre à jour'
                    : 'Créer le compte'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
