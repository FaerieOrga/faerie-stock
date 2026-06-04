import React, { useState, useEffect } from 'react';
import {
  Package,
  Box,
  MapPin,
  Tag,
  Calendar,
  LogOut,
  Menu,
  Contact,
  X,
  Printer,
  ChevronDown,
  Layout,
  ClipboardList,
  Warehouse,
  Truck,
  Layers,
  UserPlus,
  ChevronRight,
  PlusCircle,
  Phone,
  ShoppingCart,
  RotateCw,
  User,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '../../api/supabase';

const Navbar = ({
  currentView,
  setCurrentView,
  isAdmin,
  isGuest,
  onLogout,
  onRefresh,
  loading,
  onPrint,
  showMenu,
  setShowMenu,
  pendingCount,
}) => {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUser();
  }, []);

  const viewTitles = {
    home: 'Stock Global',
    byCrate: 'Par Caisse',
    byCategory: 'Par Catégorie',
    rentals: 'Réserver',
    stockRequests: 'Demandes Stock',
    events_list: 'Événements',
    byLocation: 'Lieux',
    templateManager: 'Templates',
    tasks: 'Board Travaux',
    manage_users: 'Utilisateurs',
    category_manager: 'Gestion Catégories',
    warehouse_manager: 'Entrepôts',
    contacts: 'Répertoire',
    rental_approval: 'Approbations',
    detail: 'Détail Objet',
    crateDetail: 'Contenu Caisse',
    addObject: 'Ajout Matériel',
  };

  const isWhiteHeader = [
    'detail',
    'crateDetail',
    'rentalDetail',
    'addObject',
    'tasks',
    'stockRequests',
    'templateManager',
    'manage_users',
    'contacts',
    'rental_approval',
  ].includes(currentView);

  const stockItems = [
    { id: 'home', label: 'Global', icon: Package },
    { id: 'byCrate', label: 'Caisses', icon: Box },
    { id: 'stockRequests', label: 'Demande Objets', icon: PlusCircle },
    { id: 'byCategory', label: 'Catégories', icon: Tag },
    { id: 'warehouse_manager', label: 'Entrepôts', icon: Warehouse },
  ];

  const logisticsItems = [
    { id: 'events_list', label: 'Événements', icon: Calendar },
    { id: 'byLocation', label: 'Lieux', icon: MapPin },
    { id: 'templateManager', label: 'Templates', icon: Layers },
    { id: 'rental_approval', label: 'Approbations', icon: CheckCircle }, // Ajouté ici
  ];

  const locationItems = [
    { id: 'rentals', label: 'Réserver', icon: ShoppingCart },
    { id: 'contacts', label: 'Répertoire', icon: Contact },
  ];

  const baseTextClass = isWhiteHeader
    ? 'text-slate-600 hover:text-blue-600'
    : 'text-blue-100 hover:text-white';

  const getRoleLabel = () => {
    if (isAdmin) return '👑 Admin';
    if (isGuest) return '👤 Invité';
    return '👤 Membre';
  };

  const getRoleClass = () => {
    if (isAdmin)
      return isWhiteHeader
        ? 'text-red-600 bg-red-50'
        : 'text-white bg-red-500/20';
    if (isGuest)
      return isWhiteHeader
        ? 'text-slate-500 bg-slate-100'
        : 'text-blue-200 bg-white/10';
    return isWhiteHeader
      ? 'text-blue-600 bg-blue-50'
      : 'text-blue-100 bg-white/20';
  };

  return (
    <>
      <header
        className={`${
          isWhiteHeader
            ? 'bg-white shadow-md'
            : 'bg-gradient-to-r from-blue-600 to-blue-700'
        } p-4 sticky top-0 z-[9999] no-print transition-all duration-300 h-20 flex items-center`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* GAUCHE : Logo & Infos */}
          <div className="flex items-center gap-4 shrink-0">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => !isGuest && setCurrentView('home')}
            >
              <img
                src="https://drive.google.com/thumbnail?id=1MRZUhU4Fky_9EKwBeo3bCPtv6dZQK738&sz=w1000"
                alt="Logo"
                className={`h-10 w-10 rounded-full p-1 shadow-sm ${
                  isWhiteHeader ? 'bg-blue-50' : 'bg-white/20'
                }`}
              />
              <div className="hidden sm:block text-left leading-tight">
                <h1
                  className={`text-lg font-black tracking-tighter ${
                    isWhiteHeader ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Faérie
                </h1>
                <span
                  className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md w-fit block ${getRoleClass()}`}
                >
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 pl-4 border-l ${
                isWhiteHeader ? 'border-slate-200' : 'border-white/20'
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-[7px] uppercase tracking-[0.2em] font-black opacity-50 ${
                    isWhiteHeader ? 'text-slate-400' : 'text-blue-100'
                  }`}
                >
                  Navigation
                </span>
                <span
                  className={`text-xs sm:text-sm font-black whitespace-nowrap uppercase tracking-tight ${
                    isWhiteHeader ? 'text-blue-600' : 'text-white'
                  }`}
                >
                  {viewTitles[currentView] || 'Inventaire'}
                </span>
              </div>
            </div>
          </div>

          {/* DROITE : Menu filtré */}
          <div className="flex items-center gap-3">
            <nav className="hidden lg:flex items-center gap-4">
              {!isGuest && (
                <>
                  {/* Menu Stock */}
                  <div className="relative group">
                    <button
                      className={`${baseTextClass} flex items-center gap-2 font-bold py-2 uppercase text-[10px] tracking-widest`}
                    >
                      <Package size={14} /> Stock <ChevronDown size={10} />
                    </button>
                    <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block">
                      {stockItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCurrentView(item.id)}
                          className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                        >
                          <item.icon size={14} />{' '}
                          <span className="text-[10px] uppercase font-black">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Menu Logistique */}
                  <div className="relative group">
                    <button
                      className={`${baseTextClass} flex items-center gap-2 font-bold py-2 uppercase text-[10px] tracking-widest`}
                    >
                      <ClipboardList size={14} /> Logistique{' '}
                      <ChevronDown size={10} />
                    </button>
                    <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block">
                      {logisticsItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCurrentView(item.id)}
                          className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-blue-50 text-slate-600 hover:text-blue-600 group"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={14} />
                            <span className="text-[10px] uppercase font-black">
                              {item.label}
                            </span>
                          </div>
                          {item.id === 'rental_approval' &&
                            pendingCount > 0 && (
                              <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingCount}
                              </span>
                            )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Menu Services */}
                  <div className="relative group">
                    <button
                      className={`${baseTextClass} flex items-center gap-2 font-bold py-2 uppercase text-[10px] tracking-widest`}
                    >
                      <Phone size={14} /> Services <ChevronDown size={10} />
                    </button>
                    <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block">
                      {locationItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCurrentView(item.id)}
                          className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                        >
                          <item.icon size={14} />{' '}
                          <span className="text-[10px] uppercase font-black">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('tasks')}
                    className={`${baseTextClass} flex items-center gap-2 font-bold py-2 uppercase text-[10px] tracking-widest`}
                  >
                    <Layout size={14} /> Board
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setCurrentView('manage_users')}
                      className={`${baseTextClass} flex items-center gap-2 font-bold py-2 uppercase text-[10px] tracking-widest`}
                    >
                      <UserPlus size={14} /> Admin
                    </button>
                  )}
                </>
              )}

              {isGuest && (
                <>
                  {locationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`${baseTextClass} flex items-center gap-2 font-bold py-2 uppercase text-[10px] tracking-widest`}
                    >
                      <item.icon size={14} /> {item.label}
                    </button>
                  ))}
                </>
              )}
            </nav>

            {/* Actions Rapides */}

            <div className="flex items-center gap-1 border-l border-white/10 pl-2 ml-2">
              <button
                onClick={onRefresh}
                disabled={loading}
                className={`p-2 rounded-lg transition-all ${
                  isWhiteHeader
                    ? 'hover:bg-blue-50 text-slate-400 hover:text-blue-600'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                } ${loading ? 'opacity-50' : ''}`}
                title="Actualiser les données"
              >
                <RotateCw
                  size={18}
                  className={
                    loading
                      ? 'animate-spin'
                      : 'hover:rotate-180 transition-transform duration-500'
                  }
                />
              </button>

              <button
                onClick={onPrint}
                className={`p-2 rounded-lg transition-all ${
                  isWhiteHeader
                    ? 'hover:bg-slate-100 text-slate-400'
                    : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <Printer size={18} />
              </button>
              <button
                onClick={onLogout}
                className={`p-2 rounded-lg transition-all ${
                  isWhiteHeader
                    ? 'hover:bg-red-50 text-red-500'
                    : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <LogOut size={18} />
              </button>
              <button
                onClick={() => setShowMenu(true)}
                className="lg:hidden p-2 relative ml-1"
              >
                <Menu
                  size={24}
                  className={isWhiteHeader ? 'text-slate-600' : 'text-white'}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MENU MOBILE */}
      {showMenu && (
        <div className="fixed inset-0 z-[10000] no-print">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-xs bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase opacity-60">
                  Menu
                </p>
                <p className="font-black text-lg uppercase tracking-tighter">
                  {getRoleLabel()}
                </p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {!isGuest ? (
                <>
                  <div>
                    <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Inventaire
                    </p>
                    {stockItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl ${
                          currentView === item.id
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        <item.icon size={18} />
                        <span className="text-xs uppercase font-bold">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Opérations
                    </p>
                    {logisticsItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl ${
                          currentView === item.id
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon size={18} />
                          <span className="text-xs uppercase font-bold">
                            {item.label}
                          </span>
                        </div>
                        {item.id === 'rental_approval' && pendingCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {pendingCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Services
                    </p>
                    {locationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl ${
                          currentView === item.id
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        <item.icon size={18} />
                        <span className="text-xs uppercase font-bold">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* BOARD — visible sur mobile pour users et admins */}
                  <div>
                    <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Tableau de bord
                    </p>
                    <button
                      onClick={() => {
                        setCurrentView('tasks');
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl ${
                        currentView === 'tasks'
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      <Layout size={18} />
                      <span className="text-xs uppercase font-bold">Board</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('manage_users');
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl ${
                          currentView === 'manage_users'
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        <UserPlus size={18} />
                        <span className="text-xs uppercase font-bold">
                          Admin
                        </span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Navigation
                  </p>
                  {locationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl ${
                        currentView === item.id
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="text-xs uppercase font-bold">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase"
              >
                <LogOut size={18} /> Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
