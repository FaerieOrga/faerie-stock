import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar,
  ShoppingCart,
  Check,
  Trash2,
  Search,
  Package,
  User,
  Clock,
  AlertCircle,
  ChevronRight,
  UserPlus,
  X,
  Info,
  Loader2,
  ArrowUp,
} from 'lucide-react';
import DisplayImage from '../ui/DisplayImage';
import CaptchaChallenge from '../ui/CaptchaChallenge';

const RentalBookingView = ({
  objects = [],
  contacts = [],
  rentals = [],
  getAvailableObjects,
  onSubmitRequest,
  onAddContact,
  onBack,
  isGuest = false,
  externalCart = [],
  setExternalCart,
  externalDates = { start: '', end: '' },
  setExternalDates,
}) => {
  const cart = externalCart;
  const startDate = externalDates.start;
  const endDate = externalDates.end;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const contactSearchRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [viewingObject, setViewingObject] = useState(null);

  // États pour le bouton flottant
  const [showScrollButton, setShowScrollButton] = useState(false);
  const searchInputRef = useRef(null);
  const cartSectionRef = useRef(null);

  // Détection du scroll pour changer l'icône du bouton
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDateChange = (type, value) => {
    setExternalDates({ ...externalDates, [type]: value });
  };

  const isFormValid = useMemo(() => {
    return (
      startDate !== '' &&
      endDate !== '' &&
      selectedContactId !== '' &&
      cart.length > 0 &&
      (!isGuest || isCaptchaVerified)
    );
  }, [startDate, endDate, selectedContactId, cart, isGuest, isCaptchaVerified]);

  const objectsWithAvailability = useMemo(() => {
    const baseAvailability = getAvailableObjects(startDate, endDate);
    return baseAvailability.map((obj) => {
      const activeRequest = rentals.find(
        (req) =>
          (req.status === 'pending' || req.status === 'approved') &&
          req.rental_items?.some(
            (item) => Number(item.object_id) === Number(obj.id)
          )
      );

      return {
        ...obj,
        isAvailable: obj.isAvailable && !activeRequest,
        isStrictlyLocked: !!activeRequest,
        currentRenter: activeRequest
          ? contacts.find((c) => c.id === activeRequest.contact_id)
          : null,
      };
    });
  }, [startDate, endDate, objects, rentals, contacts, getAvailableObjects]);

  const itemsCurrentlyOut = useMemo(() => {
    return objectsWithAvailability.filter((obj) => obj.isStrictlyLocked);
  }, [objectsWithAvailability]);

  // Extraire toutes les catégories disponibles parmi les objets
  const availableCategories = useMemo(() => {
    const cats = new Set();
    objectsWithAvailability.forEach((obj) => {
      const raw = obj.category;
      if (!raw) return;
      const list = Array.isArray(raw) ? raw
        : typeof raw === 'string' && raw.startsWith('[')
          ? (() => { try { return JSON.parse(raw); } catch { return [raw]; } })()
          : [raw];
      list.forEach((c) => c && cats.add(c));
    });
    return [...cats].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [objectsWithAvailability]);

  const displayObjects = objectsWithAvailability.filter((obj) => {
    const matchesSearch = obj.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (!selectedCategory) return true;
    const raw = obj.category;
    if (!raw) return false;
    const list = Array.isArray(raw) ? raw
      : typeof raw === 'string' && raw.startsWith('[')
        ? (() => { try { return JSON.parse(raw); } catch { return [raw]; } })()
        : [raw];
    return list.includes(selectedCategory);
  });

  const toggleCart = (obj) => {
    if (!obj.isAvailable) return;
    const exists = cart.find((item) => item.id === obj.id);
    if (exists) {
      setExternalCart(cart.filter((item) => item.id !== obj.id));
    } else {
      setExternalCart([...cart, obj]);
    }
  };

  const handleFinalSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await onSubmitRequest({
        contact_id: selectedContactId,
        start_date: startDate,
        end_date: endDate,
        items: cart.map((i) => i.id),
      });
      alert('Demande de location envoyée avec succès !');
      setExternalCart([]);
      setCaptchaReset((n) => n + 1);
      setIsCaptchaVerified(false);
      onBack();
    } catch (err) {
      alert("Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24 text-left animate-in fade-in duration-500 relative">
      {/* RACCOURCI FLOTTANT MOBILE */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <button
          onClick={() =>
            showScrollButton
              ? window.scrollTo({ top: 0, behavior: 'smooth' })
              : scrollToSection(cartSectionRef)
          }
          className="w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 border border-white/10"
        >
          {showScrollButton ? (
            <ArrowUp size={24} />
          ) : (
            <div className="relative">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {cart.length}
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* HEADER PRINCIPAL */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase inline-block relative">
          Nouvelle Réservation
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-blue-600 rounded-full"></span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          {/* 1. BLOC DATES */}
          <section>
            <div className="flex items-center gap-4 mb-6 px-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                <Calendar size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                1. Période de réservation
              </h2>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                  Début du prêt
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none transition-all ${
                    startDate
                      ? 'border-blue-200 bg-white'
                      : 'border-transparent focus:bg-white focus:border-blue-100'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                  Fin du prêt
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none transition-all ${
                    endDate
                      ? 'border-blue-200 bg-white'
                      : 'border-transparent focus:bg-white focus:border-blue-100'
                  }`}
                />
              </div>
            </div>
          </section>

          {/* 2. MATÉRIEL DISPONIBLE */}
          <section ref={searchInputRef}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-100">
                  <Package size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  2. Matériel disponible
                </h2>
              </div>

              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Rechercher un objet..."
                  className="pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full md:w-64 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* FILTRE CATÉGORIE */}
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                      selectedCategory === ''
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    Tous
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayObjects
                .filter((o) => o.isAvailable || !o.isStrictlyLocked)
                .map((obj) => {
                  const inCart = cart.find((i) => i.id === obj.id);
                  return (
                    <div
                      key={obj.id}
                      className={`group relative p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                        !obj.isAvailable
                          ? 'bg-slate-50 border-transparent opacity-50 grayscale'
                          : inCart
                          ? 'bg-blue-50/30 border-blue-500 shadow-xl shadow-blue-100'
                          : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                      }`}
                    >
                      <div
                        className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative cursor-zoom-in"
                        onClick={() => setViewingObject(obj)}
                      >
                        <DisplayImage
                          src={obj.photo}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Info size={18} className="text-white" />
                        </div>
                      </div>

                      <div
                        className="flex-1 min-w-0 text-left cursor-pointer"
                        onClick={() => toggleCart(obj)}
                      >
                        <h4 className="font-bold text-slate-800 truncate mb-1">
                          {obj.name}
                        </h4>
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                            obj.isAvailable
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {obj.isAvailable ? 'Libre' : 'Indisponible'}
                        </span>
                      </div>

                      {inCart && (
                        <div
                          className="bg-blue-600 text-white p-2 rounded-xl shadow-lg animate-in zoom-in ring-4 ring-white"
                          onClick={() => toggleCart(obj)}
                        >
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>

          {/* 3. LOCATIONS EN COURS */}
          <section>
            <div className="flex items-center gap-4 mb-6 px-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-100">
                <Clock size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                3. Locations en cours
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itemsCurrentlyOut.length === 0 ? (
                <div className="md:col-span-2 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/30 text-center">
                  <p className="text-slate-400 font-bold italic text-sm">
                    Aucun matériel en prêt actuellement.
                  </p>
                </div>
              ) : (
                itemsCurrentlyOut.map((obj) => (
                  <div
                    key={obj.id}
                    className="bg-white p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4 opacity-80 hover:opacity-100 transition-all hover:shadow-md"
                  >
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <DisplayImage
                        src={obj.photo}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-bold text-slate-700 text-sm truncate">
                        {obj.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <User size={10} className="text-amber-500" />
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-tight">
                          {obj.currentRenter
                            ? `${obj.currentRenter.first_name} ${obj.currentRenter.last_name}`
                            : 'Indéterminé'}
                        </span>
                      </div>
                    </div>
                    <div className="text-amber-500/30">
                      <Clock size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* --- COLONNE DROITE (PANIER) --- */}
        <div className="lg:col-span-4" ref={cartSectionRef}>
          <aside className="bg-slate-900 text-white rounded-[3.5rem] p-8 shadow-2xl sticky top-8 overflow-hidden border border-slate-800">
            <ShoppingCart
              size={160}
              className="absolute -right-16 -bottom-16 text-white/5 -rotate-12 pointer-events-none"
            />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Votre Panier
                </h3>
              </div>
              <div className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black">
                {cart.length} ITEMS
              </div>
            </div>

            <div className="space-y-3 mb-10 max-h-[300px] overflow-y-auto relative z-10 pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border border-white/10 group hover:bg-white/10 transition-all"
                >
                  <span className="text-sm font-bold truncate pr-4 text-slate-200">
                    {item.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCart(item);
                    }}
                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-14 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                  <p className="text-white/20 font-black uppercase text-[10px] tracking-[0.2em] px-4">
                    Panier vide
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8 relative z-10">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

              <div className="space-y-4 text-left">
                <label className="text-[10px] font-black uppercase text-blue-400 ml-1 tracking-[0.15em]">
                  Loueur
                </label>
                <div className="relative" ref={contactSearchRef}>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder={
                        selectedContactId
                          ? contacts.find((c) => c.id === selectedContactId)
                            ? `${
                                contacts.find((c) => c.id === selectedContactId)
                                  .last_name
                              } ${
                                contacts.find((c) => c.id === selectedContactId)
                                  .first_name
                              }`
                            : 'Rechercher...'
                          : 'Rechercher un loueur...'
                      }
                      value={contactSearch}
                      onChange={(e) => {
                        setContactSearch(e.target.value);
                        setShowContactDropdown(true);
                        if (!e.target.value) setSelectedContactId('');
                      }}
                      onFocus={() => setShowContactDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowContactDropdown(false), 150)
                      }
                      className={`w-full bg-white/5 border-2 rounded-2xl pl-10 pr-10 py-4 text-sm font-bold text-white outline-none transition-all placeholder:text-white/30 ${
                        selectedContactId
                          ? 'border-blue-500 bg-white/10'
                          : 'border-white/10 focus:border-blue-500/50'
                      }`}
                    />
                    {selectedContactId && (
                      <button
                        onClick={() => {
                          setSelectedContactId('');
                          setContactSearch('');
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {!selectedContactId && (
                      <User
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                      />
                    )}
                  </div>
                  {showContactDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {contacts
                        .filter(
                          (c) =>
                            `${c.last_name} ${c.first_name}`
                              .toLowerCase()
                              .includes(contactSearch.toLowerCase()) ||
                            `${c.first_name} ${c.last_name}`
                              .toLowerCase()
                              .includes(contactSearch.toLowerCase())
                        )
                        .sort((a, b) =>
                          a.last_name.localeCompare(b.last_name, 'fr')
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            onMouseDown={() => {
                              setSelectedContactId(c.id);
                              setContactSearch('');
                              setShowContactDropdown(false);
                            }}
                            className="w-full text-left px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                          >
                            <User
                              size={14}
                              className="text-blue-400 shrink-0"
                            />
                            <span>
                              {c.last_name} {c.first_name}
                            </span>
                          </button>
                        ))}
                      {contacts.filter(
                        (c) =>
                          `${c.last_name} ${c.first_name}`
                            .toLowerCase()
                            .includes(contactSearch.toLowerCase()) ||
                          `${c.first_name} ${c.last_name}`
                            .toLowerCase()
                            .includes(contactSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-5 py-4 text-sm text-white/30 font-bold italic text-center">
                          Aucun résultat
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onAddContact}
                  className="w-full py-4 px-4 bg-blue-500/5 hover:bg-blue-500/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all border border-blue-500/20"
                >
                  <UserPlus size={14} /> Fiche absente ?
                </button>
              </div>

              {isGuest && (
                <CaptchaChallenge
                  onVerified={setIsCaptchaVerified}
                  reset={captchaReset}
                />
              )}

              {!isFormValid && (
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] text-left animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <AlertCircle size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      Informations requises
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!startDate && (
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-tighter bg-amber-500/5 px-2 py-0.5 rounded-md">
                        • Date début
                      </span>
                    )}
                    {!endDate && (
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-tighter bg-amber-500/5 px-2 py-0.5 rounded-md">
                        • Date fin
                      </span>
                    )}
                    {cart.length === 0 && (
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-tighter bg-amber-500/5 px-2 py-0.5 rounded-md">
                        • Panier vide
                      </span>
                    )}
                    {!selectedContactId && (
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-tighter bg-amber-500/5 px-2 py-0.5 rounded-md">
                        • Responsable
                      </span>
                    )}
                    {isGuest && !isCaptchaVerified && (
                      <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-tighter bg-amber-500/5 px-2 py-0.5 rounded-md">
                        • Vérification anti-bot
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting || !isFormValid}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isFormValid
                    ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95 shadow-blue-500/20'
                    : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <Check size={22} strokeWidth={3} /> Confirmer
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* MODALE DÉTAIL */}
      {viewingObject && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[4rem] overflow-hidden shadow-2xl animate-in zoom-in-95 text-left relative">
            <button
              onClick={() => setViewingObject(null)}
              className="absolute top-8 right-8 z-10 bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-red-500 transition-all shadow-xl"
            >
              <X size={24} />
            </button>

            <div className="h-80 w-full">
              <DisplayImage
                src={viewingObject.photo}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-12 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                    {viewingObject.name}
                  </h3>
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      viewingObject.isAvailable
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {viewingObject.isAvailable ? 'Disponible' : 'Occupé'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Package size={14} className="text-blue-500" /> Caisse #
                    {viewingObject.crate}
                  </span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                  <span>ID: {viewingObject.id}</span>
                </div>
              </div>

              {viewingObject.currentRenter && (
                <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-center gap-5">
                  <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">
                      Détenteur actuel
                    </p>
                    <p className="font-black text-slate-700 text-lg leading-none">
                      {viewingObject.currentRenter.first_name}{' '}
                      {viewingObject.currentRenter.last_name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    toggleCart(viewingObject);
                    setViewingObject(null);
                  }}
                  disabled={!viewingObject.isAvailable}
                  className={`flex-[2] py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] transition-all text-xs ${
                    cart.find((i) => i.id === viewingObject.id)
                      ? 'bg-red-50 text-red-500 border-2 border-red-100'
                      : viewingObject.isAvailable
                      ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {cart.find((i) => i.id === viewingObject.id)
                    ? 'Retirer'
                    : 'Ajouter au panier'}
                </button>
                <button
                  onClick={() => setViewingObject(null)}
                  className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalBookingView;