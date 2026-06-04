/*
/*import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Search,
  Package,
  Box,
  Calendar,
  ArrowRight,
  Plus,
  Trash2,
  Menu,
  X,
  LogOut,
  Minus,
  PlusCircle,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Edit,
  Shield,
  Sword,
  Crown,
  Scroll,
  Tent,
  Hammer,
  Flag,
  Shirt,
  Briefcase,
  Archive,
  Key,
  Ticket,
  Star,
  Trophy,
  Zap,
  Flame,
  Gem,
  Skull,
  Anchor,
  Lock,
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Tag,
  FileText,
  Hash,
  MapPin,
  Settings,
  SortAsc,
  SortDesc,
  Map as MapIcon,
  Home,
  AlertTriangle,
  AlertCircle,
  History,
  CheckSquare,
  Square,
  QrCode,
  LogIn,
  Eye,
  Printer,
  Save,
  Check,
} from 'lucide-react';

import LoginForm from './components/forms/LoginForm';

// --- CONFIGURATION SUPABASE ---
// 👇 REMETTEZ VOS CLÉS ICI 👇
const SUPABASE_URL = 'https://wgzznqgkqysrcszlwwvz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_M1Y1wkUfuOkg5hFBZmd6LA_CqUSWPkE';

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// --- DONNÉES ---




// --- HELPER NETTOYAGE ---
const cleanArray = (data) => {
  if (!data) return [];
  let arr = Array.isArray(data) ? data : [data];
  const flattened = arr.flatMap((item) => {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? cleanArray(parsed) : [parsed];
        } catch (e) {
          return [item];
        }
      }
    }
    return [item];
  });
  return [...new Set(flattened)].filter(
    (i) => i && typeof i === 'string' && i.trim() !== ''
  );
};

// --- COMPOSANTS ---
const CategoryMultiSelect = ({ selected, onChange, isGuest }) => {
  const currentCats = cleanArray(selected);
  const toggleCat = (cat) => {
    if (isGuest) return;
    if (currentCats.includes(cat)) {
      onChange(currentCats.filter((c) => c !== cat));
    } else {
      onChange([...currentCats, cat]);
    }
  };
  if (isGuest) {
    return (
      <div className="flex flex-wrap gap-1">
        {currentCats.length > 0 ? (
          currentCats.map((c) => (
            <span
              key={c}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold border border-blue-200"
            >
              {c}
            </span>
          ))
        ) : (
          <span className="text-slate-400 italic">Aucune</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = currentCats.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => toggleCat(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
            type="button"
          >
            {isSelected && <Check size={12} className="inline mr-1" />} {cat}
          </button>
        );
      })}
    </div>
  );
};

const CrateLocationSwitcher = ({
  crateNum,
  currentLocation,
  knownLocations,
  onUpdate,
  isGuest,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(currentLocation || '');
  if (isGuest) return null;
  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="mt-2 px-2">
        <input
          autoFocus
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => {
            onUpdate(crateNum, { location: tempValue });
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdate(crateNum, { location: tempValue });
              setIsEditing(false);
            }
          }}
          className="w-full text-xs text-center border border-blue-500 rounded px-1 py-1 focus:outline-none bg-white font-bold text-blue-800"
          placeholder="Nouveau lieu..."
        />
      </div>
    );
  }
  return (
    <div onClick={(e) => e.stopPropagation()} className="mt-2 px-2">
      <select
        value={currentLocation || ''}
        onChange={(e) => {
          if (e.target.value === '__NEW__') {
            setTempValue('');
            setIsEditing(true);
          } else {
            onUpdate(crateNum, { location: e.target.value });
          }
        }}
        className="w-full text-xs text-center border border-slate-300 rounded px-1 py-1 focus:border-blue-500 bg-white font-medium text-slate-700 cursor-pointer"
      >
        <option value="" className="text-slate-400 italic">
          Non défini
        </option>
        {knownLocations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
        <option disabled>──────────</option>
        <option value="__NEW__" className="font-bold text-blue-600">
          ✨ Nouveau lieu...
        </option>
      </select>
    </div>
  );
};

const DisplayImage = ({ src, className, size = 'text-4xl' }) => {
  if (!src || typeof src !== 'string')
    return <Box className={`${size} text-slate-400`} />;
  if (src.startsWith('http'))
    return (
      <div
        className={`overflow-hidden rounded-md bg-slate-100 flex items-center justify-center ${className}`}
      >
        <img src={src} alt="Img" className="w-full h-full object-cover" />
      </div>
    );
  if (src.startsWith('icon:')) {
    const iconId = src.split(':')[1];
    const iconDef = PRO_ICONS.find((i) => i.id === iconId);
    const IconComponent = iconDef ? iconDef.icon : Box;
    let svgSize = size.includes('6xl') ? 48 : 24;
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-md text-slate-600 ${className}`}
      >
        <IconComponent size={svgSize} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <span
      className={`flex items-center justify-center bg-slate-50 rounded-md ${size} ${className}`}
    >
      {src}
    </span>
  );
};

const cleanDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return '';
  return dateStr;
};

// --- APP PRINCIPALE ---
export default function GNStockManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  // LoginCode à supprimer
  const [loginCode, setLoginCode] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [currentView, setCurrentView] = useState('login');
  const [previousView, setPreviousView] = useState('home');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [objects, setObjects] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [cratesInfo, setCratesInfo] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [crateSearchTerm, setCrateSearchTerm] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [rentalSearchTerm, setRentalSearchTerm] = useState('');

  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedCrateDetail, setSelectedCrateDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [showMenu, setShowMenu] = useState(false);
  const [filterCrate, setFilterCrate] = useState('');
  const [filterState, setFilterState] = useState('');

  const [sortOrder, setSortOrder] = useState('alpha-asc');
  const [crateSortOrder, setCrateSortOrder] = useState('asc');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferCrate, setTransferCrate] = useState('');
  const [transferCategory, setTransferCategory] = useState('');

  const [showRentalModal, setShowRentalModal] = useState(false);
  const [rentalName, setRentalName] = useState('');
  const [rentalOutDate, setRentalOutDate] = useState('');
  const [rentalReturnDate, setRentalReturnDate] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState({ type: '', id: '', label: '' });
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [returnCrate, setReturnCrate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newObject, setNewObject] = useState({
    name: '',
    photo: 'icon:box',
    quantity: 1,
    state: 'Neuf',
    crate: '',
    category: ['Autre'],
    notes: '',
  });

  // Remplacez 'GN2025' par votre nouveau code entre guillemets
  const USER_CODE = 'GN2025';
  const ADMIN_CODE = 'ADMIN2025';

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: o } = await supabase.from('objects').select('*');
      const { data: r } = await supabase
        .from('rentals')
        .select('*')
        .order('return_date', { ascending: true });
      const { data: c } = await supabase.from('crates').select('*');
      const { data: h } = await supabase
        .from('rental_history')
        .select('*')
        .order('actual_return_date', { ascending: false });
      if (r)
        setRentals(
          r.map((x) => ({
            ...x,
            objectName: x.object_name,
            returnDate: x.return_date,
            startDate: x.start_date,
          }))
        );
      if (o) setObjects(o);
      if (c) setCratesInfo(c);
      if (h) setRentalHistory(h);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);
  useEffect(() => {
    setSelectedIds([]);
  }, [currentView]);

  // --- GESTION DES URLS (QR CODES) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crateParam = params.get('crate');
    const objectParam = params.get('object');

    if ((crateParam || objectParam) && !isAuthenticated) {
      // En attente de connexion
    }

    if (isAuthenticated && objects.length > 0) {
      // Cas 1 : QR Code CAISSE (?crate=10)
      if (crateParam) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        openCrateDetail(parseInt(crateParam));
      }
      // Cas 2 : QR Code OBJET (?object=45)
      else if (objectParam) {
        const targetId = parseInt(objectParam);
        const foundObject = objects.find((o) => o.id === targetId);
        if (foundObject) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          handleObjectClick(foundObject);
        }
      }
    }
  }, [isAuthenticated, objects]);

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        throw error;
      }

      // Si la connexion réussit
      setIsAuthenticated(true);
      // On vérifie le rôle stocké dans Supabase (par défaut "user" si non défini)
      setIsAdmin(data.user?.user_metadata?.role === 'admin');
      setIsGuest(false);
      setCurrentView('home');
    } catch (error) {
      alert('Erreur de connexion : ' + error.message);
    } finally {
      setLoading(false);
    }
    /*if (loginCode === USER_CODE) { 
        setIsAuthenticated(true); setIsAdmin(false); setIsGuest(false); setCurrentView('home'); setLoginCode(''); 
    } 
    else if (loginCode === ADMIN_CODE) { 
        setIsAuthenticated(true); setIsAdmin(true); setIsGuest(false); setCurrentView('home'); setLoginCode(''); 
    } 
    else { alert('Code incorrect'); setLoginCode(''); }*/ /*
  };

  const handleGuestLogin = () => {
    setIsAuthenticated(true);
    setIsAdmin(false);
    setIsGuest(true);
    setCurrentView('home');
  };
  const handleOpenQR = (e, type, id, label) => {
    e.stopPropagation();
    setQrData({ type, id, label });
    setShowQRModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleObjectClick = (obj) => {
    setPreviousView(currentView);
    setSelectedObject(obj);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView(previousView);
  };

  // --- SELECTION INTELLIGENTE ---
  const toggleSelect = (id, categoryContext = null) => {
    const selectionKey = categoryContext ? `${id}:::${categoryContext}` : id;
    if (selectedIds.includes(selectionKey)) {
      setSelectedIds(selectedIds.filter((i) => i !== selectionKey));
    } else {
      setSelectedIds([...selectedIds, selectionKey]);
    }
  };

  const handleSelectAll = (items, categoryContext = null) => {
    const keys = items.map((i) =>
      categoryContext ? `${i.id}:::${categoryContext}` : i.id
    );
    if (keys.every((k) => selectedIds.includes(k))) {
      setSelectedIds(selectedIds.filter((id) => !keys.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...keys])]);
    }
  };

  const isRentalOverdue = (dateString) => {
    return dateString < new Date().toISOString().split('T')[0];
  };
  const overdueCount = rentals.filter((r) =>
    isRentalOverdue(r.returnDate)
  ).length;

  // --- DEPLACEMENT INTELLIGENT ---
  const moveSelectedObjects = async () => {
    setLoading(true);

    if (currentView === 'byCategory') {
      if (!transferCategory) {
        setLoading(false);
        return;
      }

      const updates = {};
      selectedIds.forEach((key) => {
        if (typeof key === 'string' && key.includes(':::')) {
          const [idStr, oldCat] = key.split(':::');
          const id = parseInt(idStr);
          if (!updates[id]) updates[id] = [];
          updates[id].push(oldCat);
        }
      });

      const idsToUpdate = Object.keys(updates).map(Number);

      for (const id of idsToUpdate) {
        const obj = objects.find((o) => o.id === id);
        if (obj) {
          const catsToRemove = updates[id];
          let currentCats = cleanArray(obj.category);
          currentCats = currentCats.filter((c) => !catsToRemove.includes(c));
          if (!currentCats.includes(transferCategory)) {
            currentCats.push(transferCategory);
          }
          await supabase
            .from('objects')
            .update({ category: currentCats })
            .eq('id', id);
          updateObject(id, { category: currentCats });
        }
      }
      setSelectedIds([]);
      setShowTransferModal(false);
      setTransferCategory('');
    } else {
      if (!transferCrate) {
        setLoading(false);
        return;
      }
      const { error } = await supabase
        .from('objects')
        .update({ crate: parseInt(transferCrate) })
        .in('id', selectedIds);
      if (!error) {
        setObjects(
          objects.map((obj) =>
            selectedIds.includes(obj.id)
              ? { ...obj, crate: parseInt(transferCrate) }
              : obj
          )
        );
        setSelectedIds([]);
        setShowTransferModal(false);
        setTransferCrate('');
      } else {
        alert('Erreur : ' + error.message);
      }
    }
    setLoading(false);
  };

  const deleteSelectedObjects = async () => {
    if (
      !window.confirm(
        `ATTENTION : Cela va supprimer définitivement les objets sélectionnés. Continuer ?`
      )
    )
      return;
    setLoading(true);

    const realIds = [
      ...new Set(
        selectedIds.map((id) => {
          if (typeof id === 'string' && id.includes(':::'))
            return parseInt(id.split(':::')[0]);
          return id;
        })
      ),
    ];

    const toDel = objects.filter((o) => realIds.includes(o.id));
    for (const obj of toDel) await deleteImageFromStorage(obj.photo);

    const { error } = await supabase.from('objects').delete().in('id', realIds);
    if (!error) {
      setObjects(objects.filter((obj) => !realIds.includes(obj.id)));
      setSelectedIds([]);
    } else {
      alert('Erreur : ' + error.message);
    }
    setLoading(false);
  };

  const createRental = async () => {
    if (!supabase) return;
    if (!rentalName || !rentalReturnDate) return alert('Info manquantes');
    setLoading(true);
    const { error } = await supabase.from('rentals').insert([
      {
        object_name: selectedObject.name,
        renter: rentalName,
        start_date: rentalOutDate,
        return_date: rentalReturnDate,
        photo: selectedObject.photo,
      },
    ]);
    if (!error) {
      await supabase.from('objects').delete().eq('id', selectedObject.id);
      setShowRentalModal(false);
      setSelectedObject(null);
      setCurrentView('home');
      fetchData();
    } else {
      alert('Erreur : ' + error.message);
    }
    setLoading(false);
  };

  const returnRental = async () => {
    if (!returnCrate) return alert('Caisse requise');
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { error: hErr } = await supabase.from('rental_history').insert([
      {
        object_name: selectedRental.objectName,
        renter: selectedRental.renter,
        start_date: cleanDate(selectedRental.startDate) || today,
        planned_return_date: cleanDate(selectedRental.returnDate) || today,
        actual_return_date: today,
        photo: selectedRental.photo,
      },
    ]);
    if (hErr) {
      setLoading(false);
      return alert('Erreur histo: ' + hErr.message);
    }
    const { error: oErr } = await supabase.from('objects').insert([
      {
        name: selectedRental.objectName,
        photo: selectedRental.photo,
        quantity: 1,
        state: 'Bon',
        crate: parseInt(returnCrate),
        category: ['Autre'],
        notes: '',
      },
    ]);
    if (oErr) {
      setLoading(false);
      return alert('Erreur stock: ' + oErr.message);
    }
    await supabase.from('rentals').delete().eq('id', selectedRental.id);
    setShowReturnModal(false);
    setReturnCrate('');
    setSelectedRental(null);
    setCurrentView('rentals');
    fetchData();
    setLoading(false);
  };

  const openCrateDetail = (crateNum) => {
    let crateInfo = cratesInfo.find((c) => c.crate_number === crateNum);
    if (!crateInfo)
      crateInfo = { crate_number: crateNum, location: '', notes: '' };
    setSelectedCrateDetail(crateInfo);
    setCurrentView('crateDetail');
  };

  const updateCrate = async (crateNum, updates) => {
    if (!supabase) return;
    const exists = cratesInfo.find((c) => c.crate_number === crateNum);
    let newInfos;
    if (exists)
      newInfos = cratesInfo.map((c) =>
        c.crate_number === crateNum ? { ...c, ...updates } : c
      );
    else
      newInfos = [
        ...cratesInfo,
        { crate_number: crateNum, location: '', notes: '', ...updates },
      ];
    setCratesInfo(newInfos);
    if (selectedCrateDetail && selectedCrateDetail.crate_number === crateNum)
      setSelectedCrateDetail({ ...selectedCrateDetail, ...updates });
    const { error } = await supabase
      .from('crates')
      .update(updates)
      .eq('crate_number', crateNum)
      .select();
    if (!exists)
      await supabase
        .from('crates')
        .insert([{ crate_number: crateNum, ...updates }]);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scale = MAX_WIDTH / img.width;
          if (scale >= 1) {
            resolve(file);
            return;
          }
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob)
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              else resolve(file);
            },
            'image/jpeg',
            0.7
          );
        };
      };
    });
  };

  const deleteImageFromStorage = async (url) => {
    if (!supabase || !url || !url.includes('supabase.co')) return;
    try {
      await supabase.storage
        .from('stock-images')
        .remove([
          decodeURIComponent(url.split('/stock-images/')[1].split('?')[0]),
        ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e) => {
    if (!supabase) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      const name = `${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('stock-images').upload(name, compressed);
      const { data } = supabase.storage.from('stock-images').getPublicUrl(name);
      setNewObject({ ...newObject, photo: data.publicUrl });
    } catch (err) {
      alert('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDetailImageUpload = async (e) => {
    if (!supabase || !selectedObject) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      const name = `update_${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('stock-images').upload(name, compressed);
      const { data } = supabase.storage.from('stock-images').getPublicUrl(name);
      await deleteImageFromStorage(selectedObject.photo);
      await supabase
        .from('objects')
        .update({ photo: data.publicUrl })
        .eq('id', selectedObject.id);
      setSelectedObject({ ...selectedObject, photo: data.publicUrl });
      fetchData();
    } catch (err) {
      alert('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const updateObject = async (id, updates) => {
    if (!supabase) return;
    setObjects(
      objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
    );
    if (selectedObject && selectedObject.id === id)
      setSelectedObject({ ...selectedObject, ...updates });
    await supabase.from('objects').update(updates).eq('id', id);
  };

  const addObject = async () => {
    if (!newObject.name || !newObject.crate) {
      alert('Info manquante (Nom ou Caisse)');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('objects')
      .insert([{ ...newObject, crate: parseInt(newObject.crate) }]);
    if (!error) {
      await fetchData();
      setCurrentView('home');
      setNewObject({
        name: '',
        photo: 'icon:box',
        quantity: 1,
        state: 'Neuf',
        crate: '',
        category: ['Autre'],
        notes: '',
      });
    } else {
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  const deleteObject = async () => {
    if (!supabase) return;
    if (window.confirm('Supprimer ?')) {
      setLoading(true);
      await deleteImageFromStorage(selectedObject.photo);
      await supabase.from('objects').delete().eq('id', selectedObject.id);
      setSelectedObject(null);
      setCurrentView('home');
      fetchData();
      setLoading(false);
    }
  };

  const deleteRental = async () => {
    if (!supabase) return;
    if (window.confirm('Supprimer définitivement ?')) {
      setLoading(true);
      await deleteImageFromStorage(selectedRental.photo);
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', selectedRental.id);
      if (!error) {
        setSelectedRental(null);
        setCurrentView('rentals');
        fetchData();
      }
      setLoading(false);
    }
  };

  const updateRental = async (id, updates) => {
    if (!supabase) return;
    setRentals(rentals.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    if (selectedRental && selectedRental.id === id) {
      setSelectedRental({ ...selectedRental, ...updates });
    }
    const dbPayload = {};
    if (updates.renter !== undefined) dbPayload.renter = updates.renter;
    if (updates.returnDate !== undefined)
      dbPayload.return_date = updates.returnDate;
    if (updates.startDate !== undefined)
      dbPayload.start_date = updates.startDate;
    const { error } = await supabase
      .from('rentals')
      .update(dbPayload)
      .eq('id', id);
    if (error) console.error(error);
  };

  const filteredObjects = objects
    .filter((obj) => {
      const search = searchTerm.toLowerCase();
      const objCats = cleanArray(obj.category);
      const categoryMatch = objCats.some((c) =>
        c.toLowerCase().includes(search)
      );
      const match =
        (obj.name || '').toLowerCase().includes(search) ||
        (obj.crate || '').toString().includes(search) ||
        categoryMatch;
      const matchCrate =
        filterCrate === '' || (obj.crate || '').toString() === filterCrate;
      const matchState = filterState === '' || obj.state === filterState;
      return match && matchCrate && matchState;
    })
    .sort((a, b) => {
      if (sortOrder === 'alpha-asc')
        return (a.name || '').localeCompare(b.name || '');
      if (sortOrder === 'alpha-desc')
        return (b.name || '').localeCompare(a.name || '');
      return (a.crate || 0) - (b.crate || 0);
    });

  const getFilteredCrates = () => {
    return [...new Set(objects.map((o) => o.crate))]
      .filter((c) => {
        const info = cratesInfo.find((i) => i.crate_number === c);
        const search = crateSearchTerm.toLowerCase();
        return (
          c.toString().includes(search) ||
          (info?.location || '').toLowerCase().includes(search)
        );
      })
      .sort((a, b) => (crateSortOrder === 'asc' ? a - b : b - a));
  };

  const getLocationsWithCrates = () => {
    const locs = [
      ...new Set(
        cratesInfo
          .map((c) => c.location || 'Non défini')
          .filter((l) => l.trim() !== '')
      ),
    ];
    if (!locs.includes('Non défini')) locs.push('Non défini');
    const search = locationSearchTerm.toLowerCase();

    return locs
      .map((loc) => {
        const distinctCrateNums = [
          ...new Set(
            objects
              .filter((o) => {
                const info = cratesInfo.find((c) => c.crate_number === o.crate);
                return (info?.location || 'Non défini') === loc;
              })
              .map((o) => o.crate)
          ),
        ];

        const cratesFormatted = distinctCrateNums.map((num) => ({
          crateNum: num,
          objects: objects.filter((o) => o.crate === num),
        }));

        const filtered = cratesFormatted.filter((c) => {
          const matchLoc = loc.toLowerCase().includes(search);
          const matchCrate = c.crateNum.toString().includes(search);
          return matchLoc || matchCrate;
        });

        return { name: loc, crates: filtered };
      })
      .filter((g) => g.crates.length > 0)
      .sort((a, b) =>
        sortOrder === 'alpha-desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name)
      );
  };

  const DesktopNav = () => {
    const isWhiteHeader = [
      'detail',
      'crateDetail',
      'rentalDetail',
      'addObject',
    ].includes(currentView);
    const textClass = isWhiteHeader
      ? 'text-slate-600 hover:text-blue-600'
      : 'text-blue-100 hover:text-white';
    const logoutClass = isWhiteHeader
      ? 'text-red-500 hover:text-red-700'
      : 'text-red-300 hover:text-red-100';
    const dividerClass = isWhiteHeader ? 'bg-slate-300' : 'bg-blue-400';

    return (
      <div className="hidden md:flex items-center gap-6 mr-4 no-print">
        <button
          onClick={() => setCurrentView('home')}
          className={`${textClass} flex items-center gap-2 ${
            currentView === 'home' ? 'font-bold underline' : ''
          }`}
        >
          <Package size={18} /> Stock
        </button>
        <button
          onClick={() => setCurrentView('byCrate')}
          className={`${textClass} flex items-center gap-2 ${
            currentView === 'byCrate' ? 'font-bold underline' : ''
          }`}
        >
          <Box size={18} /> Caisses
        </button>
        <button
          onClick={() => setCurrentView('byLocation')}
          className={`${textClass} flex items-center gap-2 ${
            currentView === 'byLocation' ? 'font-bold underline' : ''
          }`}
        >
          <MapPin size={18} /> Lieux
        </button>
        <button
          onClick={() => setCurrentView('byCategory')}
          className={`${textClass} flex items-center gap-2 ${
            currentView === 'byCategory' ? 'font-bold underline' : ''
          }`}
        >
          <Tag size={18} /> Catégories
        </button>
        <button
          onClick={() => setCurrentView('rentals')}
          className={`${textClass} flex items-center gap-2 ${
            currentView === 'rentals' ? 'font-bold underline' : ''
          }`}
        >
          <Calendar size={18} /> Locs
        </button>
        {!isGuest && (
          <button
            onClick={() => setCurrentView('history')}
            className={`${textClass} flex items-center gap-2 ${
              currentView === 'history' ? 'font-bold underline' : ''
            }`}
          >
            <History size={18} /> Histo
          </button>
        )}
        <div className={`h-6 w-px mx-2 ${dividerClass}`}></div>
        <button
          onClick={() => {
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsGuest(false);
            setCurrentView('login');
          }}
          className={`${logoutClass} flex items-center gap-2`}
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  };

  if (currentView === 'login') {
    return (
      /*
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
           <img src="https://drive.google.com/thumbnail?id=1MRZUhU4Fky_9EKwBeo3bCPtv6dZQK738&sz=w1000" alt="Logo Faérie" className="h-32 w-32 mb-4 object-contain drop-shadow-xl mx-auto" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Stock Faérie</h1>
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input type="text" value={loginCode} onChange={(e) => setLoginCode(e.target.value)} placeholder="Code d'accès" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg" autoFocus />
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold">Se connecter</button>
          </form>
          <button onClick={handleGuestLogin} className="mt-6 flex items-center justify-center gap-2 w-full text-slate-500 hover:text-blue-600 font-medium transition-colors">
            <Eye size={20} /> Entrer en mode Invité (Lecture seule)
          </button>
        </div>
      </div>
    */ /*
      <LoginForm
        onLogin={handleLogin}
        onGuestLogin={handleGuestLogin}
        loading={loading}
      />
    );
  }

  const knownLocations = [
    ...new Set(
      cratesInfo.map((c) => c.location || '').filter((l) => l.trim() !== '')
    ),
  ].sort();

  if (loading && currentView !== 'login' && objects.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600">
        <RefreshCw className="animate-spin" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @media print {
            .no-print, .fixed, .sticky, header, nav, button, input, select {
                display: none !important;
            }
            body, .min-h-screen, #root {
                background: white !important;
                color: black !important;
                height: auto !important;
                overflow: visible !important;
            }
            .bg-white, .shadow-md, .rounded-xl {
                box-shadow: none !important;
                border: 1px solid #ccc !important;
                background-color: white !important;
                color: black !important;
                break-inside: avoid;
            }
            div, p, span, h1, h2, h3 {
                color: black !important;
            }
            .p-4 { padding: 5px !important; }
            .grid { display: block !important; }
            
            .print-grid {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 5px !important;
                margin-top: 5px !important;
            }
            .print-grid > div {
                border: 1px solid #eee !important;
                padding: 4px !important;
                margin: 0 !important;
                page-break-inside: avoid;
            }
            
            .print-2-cols {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 1em !important;
            }
            .print-2-cols > div {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .print-only {
                display: block !important;
            }
            .space-y-3 > * { margin-bottom: 10px; }
        }
      `}</style>

      {showMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden no-print"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4">
              Menu {isAdmin ? '' : isGuest ? '(Invité)' : '(Utilisateur)'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3"
              >
                <Package size={20} /> Stock
              </button>
              <button
                onClick={() => {
                  setCurrentView('byCrate');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3"
              >
                <Box size={20} /> Caisses
              </button>
              <button
                onClick={() => {
                  setCurrentView('byLocation');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3"
              >
                <MapPin size={20} /> Lieux
              </button>
              <button
                onClick={() => {
                  setCurrentView('byCategory');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3"
              >
                <Tag size={20} /> Catégories
              </button>
              <button
                onClick={() => {
                  setCurrentView('rentals');
                  setShowMenu(false);
                  setSelectedRental(null);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3"
              >
                <Calendar size={20} /> Locs
              </button>
              {!isGuest && (
                <button
                  onClick={() => {
                    setCurrentView('history');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3"
                >
                  <History size={20} /> Histo
                </button>
              )}
              <hr className="my-4" />
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setIsAdmin(false);
                  setIsGuest(false);
                  setCurrentView('login');
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-3"
              >
                <LogOut size={20} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-bounce-in no-print">
          <span className="font-bold text-sm whitespace-nowrap">
            {selectedIds.length} sélectionné(s)
          </span>
          <div className="h-4 w-px bg-slate-600"></div>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors font-medium text-sm"
              >
                <ArrowRight size={18} /> Déplacer
              </button>
              <div className="h-4 w-px bg-slate-600"></div>
              <button
                onClick={deleteSelectedObjects}
                className="flex items-center gap-1 hover:text-red-300 transition-colors font-medium text-sm"
              >
                <Trash2 size={18} /> Supprimer
              </button>
            </>
          )}
          <button
            onClick={() => setSelectedIds([])}
            className="ml-2 p-1 hover:bg-slate-700 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* --- VUES --- */ /*}

      {currentView === 'home' && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-10 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://drive.google.com/thumbnail?id=1MRZUhU4Fky_9EKwBeo3bCPtv6dZQK738&sz=w1000"
                  alt="Logo"
                  className="h-10 w-10 bg-white/20 rounded-full p-1 backdrop-blur-sm"
                />
                <div>
                  <h1 className="text-xl font-bold">Stock Faérie</h1>
                  <p className="text-xs text-blue-100 font-medium">
                    {isAdmin
                      ? '👑 Admin'
                      : isGuest
                      ? '👀 Invité'
                      : '👤 Utilisateur'}
                  </p>
                </div>
              </div>
              <DesktopNav />
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors text-white"
                  title="Imprimer"
                >
                  <Printer size={24} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors md:hidden"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>

            {!isGuest && overdueCount > 0 && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-3 flex items-center gap-2 font-bold animate-pulse no-print">
                <AlertTriangle size={20} />
                <span>
                  Attention : {overdueCount} objet(s) en retard de retour de
                  location !
                </span>
              </div>
            )}

            <div className="relative mb-3 no-print md:w-80 md:ml-auto">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-slate-800 bg-white focus:outline-none"
              />
            </div>

            {/* BARRE D'OUTILS (Tout sélectionner + Filtres) */ /*}
            <div className="flex items-center justify-end gap-3 no-print">
              {/* BOUTON TOUT SÉLECTIONNER (Déplacé ici) */ /*}
              {isAdmin && (
                <button
                  onClick={() => handleSelectAll(filteredObjects)}
                  className="text-blue-100 text-sm font-medium hover:text-white underline whitespace-nowrap"
                >
                  {selectedIds.length === filteredObjects.length &&
                  selectedIds.length > 0
                    ? 'Tout décocher'
                    : 'Tout sélectionner'}
                </button>
              )}

              {/* FILTRES DROITE */ /*}
              <div className="flex gap-2">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-blue-50/10 text-white border border-blue-400"
                >
                  <option value="alpha-asc" className="text-slate-800">
                    A-Z
                  </option>
                  <option value="alpha-desc" className="text-slate-800">
                    Z-A
                  </option>
                  <option value="recent" className="text-slate-800">
                    Récent
                  </option>
                  <option value="crate" className="text-slate-800">
                    Caisse
                  </option>
                </select>
                <input
                  type="number"
                  placeholder="Caisse"
                  value={filterCrate}
                  onChange={(e) => setFilterCrate(e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg text-slate-800 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="hidden print:block text-2xl font-bold mb-4 p-4 text-center">
            Liste des Objets
          </div>

          <div className="p-4 grid grid-cols-4 gap-3 max-w-3xl mx-auto w-full no-print">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCrate('');
              }}
              className="bg-white rounded-xl shadow-md p-4 text-center active:scale-95 transition-transform"
            >
              <div className="text-2xl font-bold text-blue-600">
                {objects.length}
              </div>
              <div className="text-xs font-bold text-slate-600 font-bold">
                Objets
              </div>
            </button>
            <button
              onClick={() => setCurrentView('byCrate')}
              className="bg-white rounded-xl shadow-md p-4 text-center active:scale-95 transition-transform"
            >
              <div className="text-2xl font-bold text-green-600">
                {[...new Set(objects.map((o) => o.crate))].length}
              </div>
              <div className="text-xs font-bold text-slate-600 font-bold">
                Caisses
              </div>
            </button>
            <button
              onClick={() => setCurrentView('byLocation')}
              className="bg-white rounded-xl shadow-md p-4 text-center active:scale-95 transition-transform"
            >
              <div className="text-2xl font-bold text-orange-600">
                {
                  [
                    ...new Set(
                      cratesInfo
                        .map((c) => c.location || 'Non défini')
                        .filter((l) => l.trim() !== '')
                    ),
                  ].length
                }
              </div>
              <div className="text-xs font-bold text-slate-600 font-bold">
                Lieux
              </div>
            </button>
            <button
              onClick={() => setCurrentView('rentals')}
              className="bg-white rounded-xl shadow-md p-4 text-center active:scale-95 transition-transform relative"
            >
              <div className="text-2xl font-bold text-purple-600">
                {rentals.length}
              </div>
              <div className="text-xs font-bold text-slate-600 font-bold">
                Locations
              </div>
              {!isGuest && overdueCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
                  {overdueCount}
                </div>
              )}
            </button>
          </div>

          <div className="p-4 space-y-3 pb-24 max-w-3xl mx-auto w-full">
            {filteredObjects.map((obj) => (
              <div
                key={obj.id}
                className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 active:bg-slate-50 cursor-pointer"
                onClick={() => handleObjectClick(obj)}
              >
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(obj.id);
                    }}
                    className="text-slate-400 hover:text-blue-600 p-1 no-print"
                  >
                    {selectedIds.includes(obj.id) ? (
                      <CheckSquare className="text-blue-600" size={24} />
                    ) : (
                      <Square size={24} />
                    )}
                  </button>
                )}
                <div className="h-16 w-16 shrink-0">
                  <DisplayImage
                    src={obj.photo}
                    size="text-4xl"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{obj.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cleanArray(obj.category).map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded border border-blue-100"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-600">
                      Caisse: {obj.crate}
                    </span>
                    <span className="text-sm text-slate-400">•</span>
                    <span className="text-sm text-slate-600">
                      Qté: {obj.quantity}
                    </span>
                  </div>
                  {obj.notes && (
                    <div className="mt-2 text-xs text-slate-500 bg-yellow-50 p-2 rounded border border-yellow-100 italic">
                      📝 {obj.notes}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* --- MODIFICATION ICI : AJOUT BOUTON QR CODE --- */ /*}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) =>
                        handleOpenQR(e, 'object', obj.id, obj.name)
                      }
                      className="text-slate-400 hover:text-blue-600 transition-colors no-print"
                      title="QR Code"
                    >
                      <QrCode size={16} />
                    </button>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        obj.state === 'Neuf'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {obj.state}
                    </div>
                  </div>

                  {!isGuest ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 no-print"
                    >
                      <span className="text-xs text-slate-400">Caisse:</span>
                      <input
                        type="number"
                        defaultValue={obj.crate}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateObject(obj.id, {
                              crate: parseInt(e.currentTarget.value) || 0,
                            });
                            e.currentTarget.blur();
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val !== obj.crate)
                            updateObject(obj.id, { crate: val });
                        }}
                        className="w-16 px-2 py-1 text-sm border rounded text-center font-bold text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {!isGuest && (
            <button
              onClick={() => {
                setNewObject({
                  name: '',
                  photo: 'icon:box',
                  quantity: 1,
                  state: 'Neuf',
                  crate: '',
                  category: ['Autre'],
                  notes: '',
                });
                setCurrentView('addObject');
              }}
              className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:bg-blue-700 no-print"
            >
              <Plus size={28} />
            </button>
          )}
        </>
      )}

      {currentView === 'byCrate' && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-10 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="font-semibold text-blue-100 hover:text-white"
                >
                  ← Retour
                </button>
                <h2 className="font-bold text-xl">Vue par Caisse</h2>
              </div>
              <DesktopNav />
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors text-white"
                  title="Imprimer"
                >
                  <Printer size={24} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors md:hidden"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
            <div className="relative mb-3 no-print md:w-80 md:ml-auto">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Filtrer caisse..."
                value={crateSearchTerm}
                onChange={(e) => setCrateSearchTerm(e.target.value)}
                className="w-full pl-10 p-2 rounded-lg text-slate-800 bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end no-print">
              <select
                value={crateSortOrder}
                onChange={(e) => setCrateSortOrder(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-blue-50/10 text-white border border-blue-400"
              >
                <option value="asc" className="text-slate-800">
                  N° Croissant 1-9
                </option>
                <option value="desc" className="text-slate-800">
                  N° Décroissant 9-1
                </option>
              </select>
            </div>
          </div>

          <div className="hidden print:block text-2xl font-bold mb-4 p-4 text-center">
            Liste par Caisses
          </div>

          <div className="p-4 space-y-3 max-w-3xl mx-auto w-full">
            {getFilteredCrates().map((crateNum) => {
              const crateObjects = objects
                .filter((obj) => obj.crate === crateNum)
                .sort((a, b) => (a.name || '').localeCompare(b.name || '')); // TRI A-Z AJOUTÉ ICI
              const info = cratesInfo.find((c) => c.crate_number === crateNum);
              const location = info?.location || 'Non défini';
              const isAllSelected =
                crateObjects.length > 0 &&
                crateObjects.every((obj) => selectedIds.includes(obj.id));
              return (
                <div
                  key={crateNum}
                  className="rounded-xl shadow-md p-4 bg-white border border-slate-200"
                >
                  <div
                    onClick={() => openCrateDetail(crateNum)}
                    className="flex justify-between items-center mb-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Box size={20} className="text-blue-600" /> Caisse #
                        {crateNum}
                      </h3>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <MapPin size={12} /> {location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 no-print">
                      <button
                        onClick={(e) =>
                          handleOpenQR(
                            e,
                            'crate',
                            crateNum,
                            `Caisse #${crateNum}`
                          )
                        }
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Afficher QR Code"
                      >
                        <QrCode size={20} />
                      </button>
                      <Settings size={20} className="text-slate-400" />
                    </div>
                  </div>
                  {info?.notes && (
                    <div className="mb-3 text-sm text-slate-600 italic bg-yellow-50 p-2 rounded border border-yellow-100 flex gap-2">
                      <FileText
                        size={16}
                        className="text-yellow-500 shrink-0 mt-0.5"
                      />
                      {info.notes}
                    </div>
                  )}

                  {/* AJOUT CLASSE print-grid ICI */ /*}
                  <div className="space-y-2 print-grid">
                    <div className="flex justify-end mb-1 no-print">
                      {isAdmin && (
                        <button
                          onClick={() => handleSelectAll(crateObjects)}
                          className="text-xs text-blue-600 font-medium hover:underline"
                        >
                          {isAllSelected
                            ? 'Tout décocher'
                            : 'Tout sélectionner'}
                        </button>
                      )}
                    </div>
                    {crateObjects.map((obj) => (
                      <div
                        key={obj.id}
                        className="flex items-center gap-2 py-2 border-b last:border-0 border-slate-100 active:bg-slate-50"
                      >
                        {isAdmin && (
                          <button
                            onClick={() => toggleSelect(obj.id)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-2 no-print"
                          >
                            {selectedIds.includes(obj.id) ? (
                              <CheckSquare
                                className="text-blue-600"
                                size={24}
                              />
                            ) : (
                              <Square size={24} />
                            )}
                          </button>
                        )}

                        <div
                          onClick={() => handleObjectClick(obj)}
                          className="flex-1 flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-10 h-10 shrink-0">
                            <DisplayImage
                              src={obj.photo}
                              size="text-2xl"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              {obj.name}
                              <button
                                onClick={(e) =>
                                  handleOpenQR(e, 'object', obj.id, obj.name)
                                }
                                className="text-slate-400 hover:text-blue-600 transition-colors no-print"
                              >
                                <QrCode size={14} />
                              </button>
                            </div>
                            <div className="text-xs text-slate-500">
                              Qté: {obj.quantity}
                            </div>
                          </div>
                        </div>

                        {!isGuest && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 no-print"
                          >
                            <span className="text-xs text-slate-400">
                              Caisse:
                            </span>
                            <input
                              type="number"
                              defaultValue={obj.crate}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateObject(obj.id, {
                                    crate: parseInt(e.currentTarget.value) || 0,
                                  });
                                  e.currentTarget.blur();
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val !== obj.crate)
                                  updateObject(obj.id, { crate: val });
                              }}
                              className="w-16 px-2 py-1 text-sm border rounded text-center font-bold text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {currentView === 'byLocation' && (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-10 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="font-semibold text-blue-100 hover:text-white"
                >
                  ← Retour
                </button>
                <h2 className="font-bold text-xl">Lieux cibles</h2>
              </div>
              <DesktopNav />
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors text-white"
                  title="Imprimer"
                >
                  <Printer size={24} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors md:hidden"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
            <div className="relative mb-3 no-print md:w-80 md:ml-auto">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={locationSearchTerm}
                onChange={(e) => setLocationSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-slate-800 bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end no-print">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-blue-50/10 text-white border border-blue-400"
              >
                <option value="alpha-asc" className="text-slate-800">
                  A-Z
                </option>
                <option value="alpha-desc" className="text-slate-800">
                  Z-A
                </option>
              </select>
            </div>
          </div>

          <div className="hidden print:block text-2xl font-bold mb-4 p-4 text-center">
            Liste par Lieux
          </div>

          <div className="p-4 space-y-4 max-w-3xl mx-auto w-full print-2-cols">
            {getLocationsWithCrates().map((group) => (
              <div
                key={group.name}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <h3 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2 border-b pb-2">
                  <MapPin size={24} /> {group.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {group.crates.map((c) => (
                    <div
                      key={c.crateNum}
                      className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm text-center relative group"
                    >
                      <div
                        onClick={() => openCrateDetail(c.crateNum)}
                        className="w-full h-full"
                      >
                        <div className="font-bold text-slate-700 text-2xl mb-1 flex items-center justify-center gap-2">
                          <Box size={24} className="text-blue-500" /> #
                          {c.crateNum}
                        </div>
                        <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 font-medium inline-block">
                          {c.objects.length} objets
                        </span>
                      </div>
                      {/* UTILISATION DU NOUVEAU COMPOSANT SWITCHER ICI */ /*}
                      <CrateLocationSwitcher
                        crateNum={c.crateNum}
                        currentLocation={group.name}
                        knownLocations={knownLocations}
                        onUpdate={updateCrate}
                        isGuest={isGuest}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {currentView === 'byCategory' && (
        <div className="min-h-screen bg-slate-50">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-10 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="font-semibold text-blue-100 hover:text-white"
                >
                  ← Retour
                </button>
                <h2 className="font-bold text-xl">Vue par Catégorie</h2>
              </div>
              <DesktopNav />
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors text-white"
                  title="Imprimer"
                >
                  <Printer size={24} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors md:hidden"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
            <div className="relative mb-3 no-print md:w-80 md:ml-auto">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-slate-800 bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end no-print">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-blue-50/10 text-white border border-blue-400"
              >
                <option value="alpha-asc" className="text-slate-800">
                  A-Z
                </option>
                <option value="alpha-desc" className="text-slate-800">
                  Z-A
                </option>
              </select>
            </div>
          </div>

          <div className="hidden print:block text-2xl font-bold mb-4 p-4 text-center">
            Liste par Catégorie
          </div>

          <div className="p-4 space-y-3 max-w-3xl mx-auto w-full print-2-cols">
            {CATEGORIES.filter(
              (cat) =>
                cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                searchTerm === ''
            )
              .sort((a, b) =>
                sortOrder === 'alpha-desc'
                  ? b.localeCompare(a)
                  : a.localeCompare(b)
              )
              .map((catName) => {
                const catObjects = objects.filter((o) =>
                  cleanArray(o.category).includes(catName)
                );

                if (catObjects.length === 0 && searchTerm === '') return null;
                if (catObjects.length === 0 && searchTerm !== '') return null;

                // --- MODIFICATION SELECTION INTELLIGENTE ---
                // On vérifie si "ID:::CATNAME" est dans la liste
                const isAllSelected =
                  catObjects.length > 0 &&
                  catObjects.every((obj) =>
                    selectedIds.includes(`${obj.id}:::${catName}`)
                  );

                return (
                  <div
                    key={catName}
                    className="bg-white rounded-xl shadow-md p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg text-purple-600">
                        {catName} ({catObjects.length})
                      </h3>
                      {isAdmin && (
                        <button
                          onClick={() => handleSelectAll(catObjects, catName)}
                          className="text-xs text-blue-600 font-medium hover:underline no-print"
                        >
                          {isAllSelected
                            ? 'Tout décocher'
                            : 'Tout sélectionner'}
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 print-grid">
                      {catObjects.map((obj) => (
                        <div
                          key={obj.id}
                          className="flex items-center gap-2 py-2 border-b last:border-0 border-slate-100 active:bg-slate-50"
                        >
                          {/* CASE A COCHER INTELLIGENTE */ /*}
                          {isAdmin && (
                            <button
                              onClick={() => toggleSelect(obj.id, catName)}
                              className="text-slate-400 hover:text-blue-600 transition-colors p-1 no-print"
                            >
                              {selectedIds.includes(
                                `${obj.id}:::${catName}`
                              ) ? (
                                <CheckSquare
                                  className="text-blue-600"
                                  size={24}
                                />
                              ) : (
                                <Square size={24} />
                              )}
                            </button>
                          )}

                          <div
                            onClick={() => handleObjectClick(obj)}
                            className="flex-1 flex items-center gap-3 cursor-pointer"
                          >
                            <div className="h-10 w-10 shrink-0">
                              <DisplayImage
                                src={obj.photo}
                                size="text-2xl"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {obj.name}
                                <button
                                  onClick={(e) =>
                                    handleOpenQR(e, 'object', obj.id, obj.name)
                                  }
                                  className="text-slate-400 hover:text-blue-600 transition-colors no-print"
                                >
                                  <QrCode size={14} />
                                </button>
                              </div>
                              <div className="text-xs text-slate-500">
                                Caisse: #{obj.crate} | {obj.state}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {currentView === 'rentals' && (
        <div className="min-h-screen bg-slate-50">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-10 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="font-semibold text-blue-100 hover:text-white"
                >
                  ← Retour
                </button>
                <h2 className="font-bold text-xl">
                  Locations ({rentals.length})
                </h2>
              </div>
              <DesktopNav />
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors text-white"
                  title="Imprimer"
                >
                  <Printer size={24} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors md:hidden"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
            <div className="relative mb-3 no-print md:w-80 md:ml-auto">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={rentalSearchTerm}
                onChange={(e) => setRentalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-slate-800 bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end no-print">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-blue-50/10 text-white border border-blue-400"
              >
                <option value="alpha-asc" className="text-slate-800">
                  A-Z
                </option>
                <option value="alpha-desc" className="text-slate-800">
                  Z-A
                </option>
              </select>
            </div>
          </div>

          <div className="hidden print:block text-2xl font-bold mb-4 p-4 text-center">
            Locations en cours
          </div>

          <div className="p-4 space-y-3 max-w-3xl mx-auto w-full">
            {rentals
              .filter(
                (r) =>
                  (r.objectName || '')
                    .toLowerCase()
                    .includes(rentalSearchTerm.toLowerCase()) ||
                  (r.renter || '')
                    .toLowerCase()
                    .includes(rentalSearchTerm.toLowerCase())
              )
              .sort((a, b) =>
                sortOrder === 'alpha-desc'
                  ? (b.objectName || '').localeCompare(a.objectName || '')
                  : (a.objectName || '').localeCompare(b.objectName || '')
              )
              .map((rental) => {
                const isOverdue =
                  cleanDate(rental.returnDate) <
                  new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={rental.id}
                    onClick={() => {
                      setSelectedRental(rental);
                      setCurrentView('rentalDetail');
                    }}
                    className={`bg-white rounded-xl shadow-md p-4 active:bg-slate-50 cursor-pointer border-l-4 ${
                      isOverdue ? 'border-red-500 bg-red-50' : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0">
                        <DisplayImage
                          src={rental.photo}
                          size="text-4xl"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg">
                            {rental.objectName}
                          </h3>
                          {isOverdue && (
                            <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded-full">
                              <AlertCircle size={14} /> Retard
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          Loueur: {rental.renter}
                        </p>
                        <div className="text-xs mt-1 flex items-center gap-1 text-slate-500">
                          <Calendar size={12} />{' '}
                          <span>
                            Du {cleanDate(rental.startDate) || '?'} au{' '}
                            {cleanDate(rental.returnDate) || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-400 no-print">→</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {currentView === 'history' && (
        <div className="min-h-screen bg-slate-50">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-10 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="font-semibold text-blue-100 hover:text-white"
                >
                  ← Retour
                </button>
                <h2 className="font-bold text-xl">Historique</h2>
              </div>
              <DesktopNav />
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors text-white"
                  title="Imprimer"
                >
                  <Printer size={24} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors md:hidden"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
            <div className="relative mb-3 no-print md:w-80 md:ml-auto">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-slate-800 bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end no-print">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-blue-50/10 text-white border border-blue-400"
              >
                <option value="alpha-asc" className="text-slate-800">
                  A-Z
                </option>
                <option value="alpha-desc" className="text-slate-800">
                  Z-A
                </option>
              </select>
            </div>
          </div>

          <div className="hidden print:block text-2xl font-bold mb-4 p-4 text-center">
            Historique des Locations
          </div>

          <div className="p-4 space-y-3 max-w-3xl mx-auto w-full">
            {rentalHistory
              .filter(
                (h) =>
                  (h.object_name || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  (h.renter || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .sort((a, b) =>
                sortOrder === 'alpha-desc'
                  ? (b.object_name || '').localeCompare(a.object_name || '')
                  : (a.object_name || '').localeCompare(b.object_name || '')
              )
              .map((historyItem) => (
                <div
                  key={historyItem.id}
                  className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="h-16 w-16 shrink-0">
                    <DisplayImage
                      src={historyItem.photo}
                      size="text-4xl"
                      className="h-full w-full object-cover grayscale"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-700">
                      {historyItem.object_name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Loué par : <strong>{historyItem.renter}</strong>
                    </p>
                    <div className="text-xs text-slate-500 mt-1">
                      Rendu le{' '}
                      {new Date(
                        historyItem.actual_return_date
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* --- VUE DÉTAIL CAISSE --- */ /*}
      {currentView === 'crateDetail' && selectedCrateDetail && (
        <div className="min-h-screen bg-slate-50">
          {/* HEADER MODIFIÉ : Fond blanc, texte sombre (Cohérent avec le reste) */ /*}
          <div className="bg-white shadow-md p-4 flex items-center gap-3 sticky top-0 z-10 justify-between no-print">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('byCrate')}
                className="text-blue-600 font-semibold"
              >
                ← Retour
              </button>
              <h2 className="font-bold text-lg flex-1 truncate">
                Caisse #{selectedCrateDetail.crate_number}
              </h2>
            </div>
            <DesktopNav />
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
                title="Imprimer"
              >
                <Printer size={24} />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-100 rounded-full md:hidden"
              >
                <Menu size={24} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="p-4 max-w-3xl mx-auto w-full space-y-4">
            {/* CARTE INFO CAISSE */ /*}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Localisation
                  </label>
                  <CrateLocationSwitcher
                    crateNum={selectedCrateDetail.crate_number}
                    currentLocation={selectedCrateDetail.location}
                    knownLocations={knownLocations}
                    onUpdate={updateCrate}
                    isGuest={isGuest}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Notes sur le contenu
                  </label>
                  {isGuest ? (
                    <div className="text-slate-600 italic">
                      {selectedCrateDetail.notes || 'Aucune note.'}
                    </div>
                  ) : (
                    <textarea
                      className="w-full border-2 border-slate-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                      rows={3}
                      placeholder="Ex: Caisse fragile, fond abimé..."
                      value={selectedCrateDetail.notes || ''}
                      onChange={(e) =>
                        updateCrate(selectedCrateDetail.crate_number, {
                          notes: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="mt-4 border-t pt-4 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-slate-400 mb-2">
                  QR Code Caisse #{selectedCrateDetail.crate_number}
                </span>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `${window.location.origin}?crate=${selectedCrateDetail.crate_number}`
                  )}`}
                  alt="QR"
                  className="rounded-lg border-2 border-slate-100"
                />
              </div>
            </div>

            {/* LISTE DES OBJETS DANS LA CAISSE */ /*}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-lg mb-4 px-2 border-b pb-2">
                Contenu (
                {
                  objects.filter(
                    (o) => o.crate === selectedCrateDetail.crate_number
                  ).length
                }
                )
              </h3>
              <div className="space-y-2">
                {objects
                  .filter((o) => o.crate === selectedCrateDetail.crate_number)
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .map((obj) => (
                    <div
                      key={obj.id}
                      onClick={() => handleObjectClick(obj)}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="h-10 w-10 shrink-0">
                        <DisplayImage
                          src={obj.photo}
                          size="text-xl"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {obj.name}
                          <button
                            onClick={(e) =>
                              handleOpenQR(e, 'object', obj.id, obj.name)
                            }
                            className="text-slate-400 hover:text-blue-600 transition-colors no-print"
                          >
                            <QrCode size={14} />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500">
                          Qté: {obj.quantity} • {obj.state}
                        </div>
                      </div>
                      <div className="text-slate-300">→</div>
                    </div>
                  ))}
                {objects.filter(
                  (o) => o.crate === selectedCrateDetail.crate_number
                ).length === 0 && (
                  <div className="text-center text-slate-400 italic py-4">
                    Cette caisse est vide.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'detail' && selectedObject && (
        <div className="min-h-screen bg-slate-50">
          <div className="bg-white shadow-md p-4 flex items-center gap-3 sticky top-0 z-10 justify-between no-print">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="text-blue-600 font-semibold"
              >
                ← Retour
              </button>
              <h2 className="font-bold text-lg flex-1 truncate">
                {selectedObject.name}
              </h2>
            </div>
            <DesktopNav />
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
                title="Imprimer"
              >
                <Printer size={24} />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-100 rounded-full md:hidden"
              >
                <Menu size={24} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="p-4 max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* COLONNE GAUCHE (Info principales + QR Code) */ /*}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
                    {selectedObject.name}
                  </h2>

                  <div className="text-center mb-4 flex justify-center relative">
                    <div className="relative inline-block">
                      <DisplayImage
                        src={selectedObject.photo}
                        size="text-8xl"
                        className="h-64 w-64"
                      />
                      <label
                        className={`absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-transform active:scale-95 ${
                          uploading ? 'opacity-50 cursor-wait' : ''
                        } no-print`}
                      >
                        <Camera size={24} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleDetailImageUpload}
                          disabled={uploading || isGuest}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* CAISSE */ /*}
                    <div className="flex items-center">
                      <span className="w-32 text-slate-600 font-medium">
                        Caisse
                      </span>
                      {/* Affichage Écran */ /*}
                      <div className="print:hidden">
                        {!isGuest ? (
                          <input
                            type="number"
                            value={selectedObject.crate}
                            onChange={(e) =>
                              updateObject(selectedObject.id, {
                                crate: parseInt(e.target.value) || 0,
                              })
                            }
                            className="font-bold text-xl w-24 text-center border-2 border-blue-200 bg-blue-50 rounded-lg py-2 focus:outline-none focus:border-blue-500 text-blue-800"
                          />
                        ) : (
                          <div className="font-bold text-xl text-blue-800">
                            {selectedObject.crate}
                          </div>
                        )}
                      </div>
                      {/* Affichage Impression (Texte pur) */ /*}
                      <div className="hidden print:block font-bold text-xl text-black border border-slate-300 px-3 py-1 rounded">
                        #{selectedObject.crate}
                      </div>
                    </div>

                    {/* QUANTITÉ */ /*}
                    <div className="flex items-center">
                      <span className="w-32 text-slate-600 font-medium">
                        Quantité
                      </span>
                      {/* Affichage Écran */ /*}
                      <div className="flex items-center gap-3 print:hidden">
                        {!isGuest ? (
                          <>
                            <button
                              onClick={() =>
                                updateObject(selectedObject.id, {
                                  quantity: Math.max(
                                    0,
                                    selectedObject.quantity - 1
                                  ),
                                })
                              }
                              className="bg-red-100 text-red-600 p-2 rounded-lg no-print"
                            >
                              <Minus size={20} />
                            </button>
                            <input
                              type="number"
                              value={selectedObject.quantity}
                              onChange={(e) =>
                                updateObject(selectedObject.id, {
                                  quantity: parseInt(e.target.value) || 0,
                                })
                              }
                              className="font-semibold text-xl w-20 text-center border-2 border-slate-200 rounded-lg py-1"
                            />
                            <button
                              onClick={() =>
                                updateObject(selectedObject.id, {
                                  quantity: selectedObject.quantity + 1,
                                })
                              }
                              className="bg-green-100 text-green-600 p-2 rounded-lg no-print"
                            >
                              <PlusCircle size={20} />
                            </button>
                          </>
                        ) : (
                          <div className="font-bold text-xl">
                            {selectedObject.quantity}
                          </div>
                        )}
                      </div>
                      {/* Affichage Impression */ /*}
                      <div className="hidden print:block font-bold text-xl text-black">
                        {selectedObject.quantity}
                      </div>
                    </div>

                    {/* ÉTAT */ /*}
                    <div className="flex items-center">
                      <span className="w-32 text-slate-600 font-medium">
                        État
                      </span>
                      {/* Affichage Écran */ /*}
                      <div className="print:hidden w-full">
                        {!isGuest ? (
                          <select
                            value={selectedObject.state}
                            onChange={(e) =>
                              updateObject(selectedObject.id, {
                                state: e.target.value,
                              })
                            }
                            className="flex-1 font-semibold px-3 py-2 rounded-lg text-sm border-2 border-slate-200 w-full"
                          >
                            <option value="Neuf">Neuf</option>
                            <option value="Bon">Bon</option>
                            <option value="Satisfaisant">Satisfaisant</option>
                            <option value="À réparer">À réparer</option>
                            <option value="HS">HS</option>
                          </select>
                        ) : (
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                              selectedObject.state === 'Neuf'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {selectedObject.state}
                          </div>
                        )}
                      </div>
                      {/* Affichage Impression */ /*}
                      <div className="hidden print:block font-semibold text-black border border-slate-300 px-3 py-1 rounded">
                        {selectedObject.state}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CADRE QR CODE (NOUVEAU EMPLACEMENT) */ /*}
                <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center break-inside-avoid">
                  <h3 className="font-bold text-lg mb-4 text-slate-700">
                    QR Code
                  </h3>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `${window.location.origin}?object=${selectedObject.id}`
                    )}`}
                    alt="QR"
                    className="rounded-lg border-2 border-slate-100"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Scannez pour accéder directement
                  </p>
                </div>
              </div>

              {/* COLONNE DROITE (Caractéristiques + Actions) */ /*}
              <div className="space-y-6">
                {/* CADRE CARACTERISTIQUES */ /*}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-bold text-lg mb-4 text-slate-700">
                    Caractéristiques
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block mb-2 text-slate-600 font-medium">
                        Catégories
                      </span>

                      {/* ECRAN : Selecteur interactif */ /*}
                      <div className="print:hidden">
                        <CategoryMultiSelect
                          selected={selectedObject.category}
                          onChange={(newCats) =>
                            updateObject(selectedObject.id, {
                              category: newCats,
                            })
                          }
                          isGuest={isGuest}
                        />
                      </div>

                      {/* IMPRESSION : Liste TEXTE simple (plus fiable) */ /*}
                      <div className="print-only hidden">
                        <span className="text-black font-semibold text-sm">
                          {cleanArray(selectedObject.category).length > 0
                            ? cleanArray(selectedObject.category).join(', ')
                            : 'Aucune'}
                        </span>
                      </div>
                    </div>

                    {/* NOTES / DÉTAILS - CORRIGÉ POUR IMPRESSION */ /*}
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2 text-yellow-800 font-semibold">
                        <FileText size={18} /> Notes / Détails
                      </div>
                      {/* Affichage Écran */ /*}
                      {!isGuest ? (
                        <textarea
                          value={selectedObject.notes || ''}
                          onChange={(e) =>
                            updateObject(selectedObject.id, {
                              notes: e.target.value,
                            })
                          }
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 p-0 print:hidden"
                          placeholder="Ajouter une note..."
                          rows={3}
                        />
                      ) : (
                        <div className="text-sm text-slate-700 whitespace-pre-wrap print:hidden">
                          {selectedObject.notes || 'Aucune note.'}
                        </div>
                      )}
                      {/* Affichage Impression (Div qui s'agrandit toute seule) */ /*}
                      <div className="hidden print:block text-sm text-black whitespace-pre-wrap">
                        {selectedObject.notes || 'Aucune note.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CADRE ACTIONS */ /*}
                <div className="bg-white rounded-xl shadow-md p-6 no-print">
                  <h3 className="font-bold text-lg mb-4">Actions</h3>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setShowRentalModal(true)}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg mb-3 flex items-center justify-center gap-2"
                      >
                        <Calendar size={20} /> Mettre en location
                      </button>
                      <button
                        type="button"
                        onClick={deleteObject}
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Trash2 size={20} /> Supprimer l'objet
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- VUE DÉTAIL LOCATION --- */ /*}
      {currentView === 'rentalDetail' && selectedRental && (
        <div className="min-h-screen bg-slate-50">
          <div className="bg-white shadow-md p-4 flex items-center gap-3 sticky top-0 z-10 justify-between no-print">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('rentals')}
                className="text-blue-600 font-semibold"
              >
                ← Retour
              </button>
              <h2 className="font-bold text-lg flex-1 truncate">
                {selectedRental.objectName}
              </h2>
            </div>
            <DesktopNav />
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
                title="Imprimer"
              >
                <Printer size={24} />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-100 rounded-full md:hidden"
              >
                <Menu size={24} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="p-4 max-w-lg mx-auto w-full">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="h-48 w-full bg-slate-100 rounded-lg mb-6 overflow-hidden">
                <DisplayImage
                  src={selectedRental.photo}
                  size="text-6xl"
                  className="h-full w-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                {selectedRental.objectName}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">
                    Loué par
                  </label>
                  <input
                    type="text"
                    value={selectedRental.renter}
                    onChange={(e) =>
                      updateRental(selectedRental.id, {
                        renter: e.target.value,
                      })
                    }
                    className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-1">
                      Sortie le
                    </label>
                    <input
                      type="date"
                      value={selectedRental.startDate}
                      onChange={(e) =>
                        updateRental(selectedRental.id, {
                          startDate: e.target.value,
                        })
                      }
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-1">
                      Retour le
                    </label>
                    <input
                      type="date"
                      value={selectedRental.returnDate}
                      onChange={(e) =>
                        updateRental(selectedRental.id, {
                          returnDate: e.target.value,
                        })
                      }
                      className={`w-full border-2 rounded-lg px-3 py-2 font-bold ${
                        isRentalOverdue(selectedRental.returnDate)
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowReturnModal(true)}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mb-3"
              >
                <Check size={24} /> Retourner l'objet
              </button>
              <button
                onClick={deleteRental}
                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={20} /> Supprimer la fiche
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'addObject' && (
        <div className="min-h-screen bg-slate-50">
          <div className="bg-white shadow-md p-4 flex items-center gap-3 sticky top-0 z-10 justify-between no-print">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('home')}
                className="text-blue-600 font-semibold"
              >
                ← Annuler
              </button>
              <h2 className="font-bold text-lg flex-1 truncate">
                Nouvel Objet
              </h2>
            </div>
            <DesktopNav />
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 rounded-full md:hidden"
            >
              <Menu size={24} className="text-slate-600" />
            </button>
          </div>
          <div className="p-4 space-y-4 max-w-xl mx-auto w-full">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center mb-4 flex justify-center relative">
                <div className="relative inline-block">
                  <DisplayImage
                    src={newObject.photo}
                    size="text-8xl"
                    className="h-64 w-64"
                  />
                  <label
                    className={`absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-transform active:scale-95 ${
                      uploading ? 'opacity-50 cursor-wait' : ''
                    } no-print`}
                  >
                    <Camera size={24} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading || isGuest}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-32 text-slate-600 font-medium">Nom</span>
                  <input
                    type="text"
                    value={newObject.name}
                    onChange={(e) =>
                      setNewObject({ ...newObject, name: e.target.value })
                    }
                    placeholder="Nom de l'objet"
                    className="flex-1 font-semibold px-3 py-2 rounded-lg text-sm border-2 border-slate-200"
                  />
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-slate-600 font-medium">
                    Caisse
                  </span>
                  <input
                    type="number"
                    value={newObject.crate}
                    onChange={(e) =>
                      setNewObject({ ...newObject, crate: e.target.value })
                    }
                    placeholder="N°"
                    className="font-bold text-xl w-24 text-center border-2 border-blue-200 bg-blue-50 rounded-lg py-2 focus:outline-none focus:border-blue-500 text-blue-800"
                  />
                </div>

                <div>
                  <span className="block mb-2 text-slate-600 font-medium">
                    Catégories
                  </span>
                  <CategoryMultiSelect
                    selected={newObject.category}
                    onChange={(newCats) =>
                      setNewObject({ ...newObject, category: newCats })
                    }
                    isGuest={isGuest}
                  />
                </div>

                <div className="flex items-center">
                  <span className="w-32 text-slate-600 font-medium">
                    Quantité
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setNewObject({
                          ...newObject,
                          quantity: Math.max(1, newObject.quantity - 1),
                        })
                      }
                      className="bg-red-100 text-red-600 p-2 rounded-lg no-print"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      value={newObject.quantity}
                      onChange={(e) =>
                        setNewObject({
                          ...newObject,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="font-semibold text-xl w-20 text-center border-2 border-slate-200 rounded-lg py-1"
                    />
                    <button
                      onClick={() =>
                        setNewObject({
                          ...newObject,
                          quantity: newObject.quantity + 1,
                        })
                      }
                      className="bg-green-100 text-green-600 p-2 rounded-lg no-print"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-slate-600 font-medium">État</span>
                  <select
                    value={newObject.state}
                    onChange={(e) =>
                      setNewObject({ ...newObject, state: e.target.value })
                    }
                    className="flex-1 font-semibold px-3 py-2 rounded-lg text-sm border-2 border-slate-200"
                  >
                    <option value="Neuf">Neuf</option>
                    <option value="Bon">Bon</option>
                    <option value="Satisfaisant">Satisfaisant</option>
                    <option value="À réparer">À réparer</option>
                    <option value="HS">HS</option>
                  </select>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 mt-2">
                  <div className="flex items-center gap-2 mb-2 text-yellow-800 font-semibold">
                    <FileText size={18} /> Notes / Détails
                  </div>
                  <textarea
                    value={newObject.notes || ''}
                    onChange={(e) =>
                      setNewObject({ ...newObject, notes: e.target.value })
                    }
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 p-0"
                    placeholder="Ajouter une note..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 no-print">
              <button
                onClick={addObject}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg active:scale-95 transition-transform"
              >
                <Save size={24} /> Créer l'objet
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4 no-print"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">
              {currentView === 'byCategory'
                ? 'Changer de catégorie'
                : 'Changer de caisse'}
            </h3>

            <p className="text-sm text-slate-500 mb-4">
              {currentView === 'byCategory'
                ? `Déplacer ${selectedIds.length} objets vers la catégorie :`
                : `Déplacer ${selectedIds.length} objets vers la caisse :`}
            </p>

            {currentView === 'byCategory' ? (
              <select
                value={transferCategory}
                onChange={(e) => setTransferCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl mb-4 text-lg bg-white"
              >
                <option value="">Choisir...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={transferCrate}
                onChange={(e) => setTransferCrate(e.target.value)}
                placeholder="N° Nouvelle Caisse"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl mb-4 text-lg"
                autoFocus
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={moveSelectedObjects}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold"
              >
                {loading ? '...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showQRModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 no-print"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-2">{qrData.label}</h3>
            <p className="text-slate-500 text-sm mb-6">Scannez pour voir</p>
            <div className="bg-white p-4 rounded-xl border-4 border-slate-100 inline-block mb-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}?${qrData.type}=${qrData.id}`
                )}`}
                alt="QR"
                className="w-48 h-48 object-contain"
              />
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4 no-print"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Ajouter</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newObject.name}
                onChange={(e) =>
                  setNewObject({ ...newObject, name: e.target.value })
                }
                placeholder="Nom"
                className="w-full border-2 rounded-xl px-4 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={newObject.quantity}
                  onChange={(e) =>
                    setNewObject({
                      ...newObject,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full border-2 rounded-xl px-4 py-2"
                />
                <input
                  type="number"
                  value={newObject.crate}
                  onChange={(e) =>
                    setNewObject({ ...newObject, crate: e.target.value })
                  }
                  placeholder="Caisse"
                  className="w-full border-2 rounded-xl px-4 py-2"
                />
              </div>
              <button
                onClick={addObject}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
*/
