import React, { useState } from 'react';
import { RefreshCw, Eye, Mail, Lock } from 'lucide-react';

const LoginForm = ({ onLogin, onGuestLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="https://drive.google.com/thumbnail?id=1MRZUhU4Fky_9EKwBeo3bCPtv6dZQK738&sz=w1000"
            alt="Logo Faérie"
            className="h-24 w-24 object-contain drop-shadow-xl"
          />
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Application Faérie
        </h1>
        <p className="text-slate-500 mb-8">Accès sécurisé à la gestion</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Champ Email */}
          <div className="text-left">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1 ml-1">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all focus:ring-4 focus:ring-blue-50"
              required
            />
          </div>

          {/* Champ Mot de passe */}
          <div className="text-left">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1 ml-1">
              <Lock size={14} /> Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all focus:ring-4 focus:ring-blue-50"
              required
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Option Invité */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <button
            onClick={onGuestLogin}
            className="flex items-center justify-center gap-2 w-full text-slate-400 hover:text-blue-600 font-semibold transition-colors"
          >
            <Eye size={18} /> Entrer en mode Invité
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
