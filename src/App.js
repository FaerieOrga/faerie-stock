import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './api/supabase';
import { useStockData } from './hooks/useStockData';

// UI & Navigation
import Navbar from './components/ui/Navbar';
import StockHome from './components/views/Stock';
import LoginForm from './components/forms/LoginForm';
import ReturnRentalModal from './components/ui/ReturnRentalModal';
import { QrCodeModal } from './components/ui/QrCodeModal';
import TransferModal from './components/ui/TransferModal';
import RentModal from './components/ui/RentModal';
import StockRequestView from './components/views/StockRequestView';
import TemplateManagerView from './components/views/TemplateManagerView';

// Views
import CrateView from './components/views/CrateView';
import RentalBookingView from './components/views/RentalBookingView';
import RentalLogisticView from './components/views/RentalLogisticView';
import ObjectDetail from './components/views/ObjectDetail';
import LocationView from './components/views/LocationView';
import CrateDetail from './components/views/CrateDetail';
import CategoryView from './components/views/CategoryView';
import AddObjectForm from './components/forms/AddObjectForm';
import EventsListView from './components/views/EventsListView';
import EventLogisticsView from './components/views/EventLogisticsView';
import TaskBoardContainer from './components/taskboard/TaskBoardContainer';
import UserManagementView from './components/views/UserManagementView';
import CategoryManagerView from './components/views/CategoryManagerView';
import WarehouseManagerView from './components/views/WarehouseManagerView';
import ContactListView from './components/views/ContactListView';

export default function App() {
  // --- 1. ÉTATS DE NAVIGATION & AUTHENTIFICATION ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [isQrBypass, setIsQrBypass] = useState(false);

  // --- 2. ÉTATS DE SÉLECTION & MODALES ---
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [objectToRent, setObjectToRent] = useState(null);
  const [selectedCrateDetail, setSelectedCrateDetail] = useState(null);
  const [rentalToReturn, setRentalToReturn] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // États persistants pour RentalBookingView
  const [persistentCart, setPersistentCart] = useState([]);
  const [persistentDates, setPersistentDates] = useState({
    start: '',
    end: '',
  });
  const [qrData, setQrData] = useState({
    show: false,
    type: '',
    id: '',
    label: '',
  });

  // --- 3. RÉCUPÉRATION DES DONNÉES ---
  const shouldFetch = true;
  const {
    objects,
    rentalRequests,
    warehouses,
    cratesInfo,
    events,
    contacts,
    categories,
    loading,
    uploading,
    addObject,
    updateObject,
    deleteObject,
    uploadImage,
    submitRentalRequest,
    returnRentalRequest,
    approveRentalRequest,
    fetchData,
    getAvailableObjects,
    bulkDeleteObjects,
    bulkUpdateObjects,
  } = useStockData(shouldFetch);

  // --- 4. GESTION DE LA SESSION ---
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('item') || queryParams.get('crate')) {
      setIsQrBypass(true);
      setIsGuest(true);
    }

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const role = session.user.user_metadata?.role || 'guest';
        setIsAuthenticated(true);
        setIsAdmin(role === 'admin');
        setIsGuest(role === 'guest');
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsGuest(true);
      }
    };
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const role = session.user.user_metadata?.role || 'guest';
        setIsAuthenticated(true);
        setIsAdmin(role === 'admin');
        setIsGuest(role === 'guest');
        setIsQrBypass(false);
      } else if (
        !window.location.search.includes('item') &&
        !window.location.search.includes('crate')
      ) {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 5. SYNCHRONISATION TEMPS RÉEL TOTALE ---
  useEffect(() => {
    if (!shouldFetch) return;
    const channel = supabase
      .channel('global-db-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () =>
        fetchData()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [shouldFetch, fetchData]);

  // --- 6. REDIRECTION QR ---
  useEffect(() => {
    if (objects.length > 0 || cratesInfo.length > 0) {
      const queryParams = new URLSearchParams(window.location.search);
      const itemId = queryParams.get('item');
      const crateNum = queryParams.get('crate');

      if (itemId) {
        const targetObj = objects.find((o) => o.id.toString() === itemId);
        if (targetObj) {
          setSelectedObject(targetObj);
          setCurrentView('detail');
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } else if (crateNum) {
        const targetCrate = cratesInfo.find(
          (c) => c.crate_number.toString() === crateNum
        );
        setSelectedCrateDetail(
          targetCrate || {
            crate_number: parseInt(crateNum),
            location: 'Inconnu',
          }
        );
        setCurrentView('crateDetail');
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, [objects, cratesInfo]);

  // --- 7. HANDLERS ---
  const navigateTo = (newView) => {
    setPreviousView(currentView);
    setCurrentView(newView);
  };

  const handleGoBack = () => {
    setCurrentView(previousView || 'home');
  };

  // FONCTION RÉTABLIE : handleSelectEventForLogistics
  const handleSelectEventForLogistics = (event) => {
    setSelectedEvent(event);
    navigateTo(event.display_mode === 'kanban' ? 'tasks' : 'event_logistics');
  };

  const handleLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return alert('Erreur : ' + error.message);
    localStorage.setItem('auth_timestamp', Date.now().toString());
    setIsAuthenticated(true);
    const userRole = data.user.user_metadata?.role || 'guest';
    setIsAdmin(userRole === 'admin');
    setIsGuest(userRole === 'guest');
    setCurrentView('home');
  };

  const handleSelectAll = (objectsToSelect) => {
    if (objectsToSelect.length === 0) {
      setSelectedIds([]);
      return;
    }

    // FORCE LA CONVERSION EN NOMBRE pour éviter les bugs de type String/Number
    const currentCrateIds = objectsToSelect.map((obj) => Number(obj.id));

    // Vérifie si TOUS les objets de cette caisse sont déjà présents dans selectedIds
    const allAlreadySelected = currentCrateIds.every((id) =>
      selectedIds.map(Number).includes(id)
    );

    if (allAlreadySelected) {
      // On retire uniquement les objets de cette caisse
      setSelectedIds((prev) =>
        prev.filter((id) => !currentCrateIds.includes(Number(id)))
      );
    } else {
      // On ajoute les objets manquants en évitant les doublons
      setSelectedIds((prev) => {
        const newSelection = [...prev.map(Number), ...currentCrateIds];
        return [...new Set(newSelection)]; // New Set garantit l'unicité
      });
    }
  };

  // FONCTION RÉTABLIE : handleAddEventWithTemplate
  const handleAddEventWithTemplate = async (eventData) => {
    try {
      const { template_id, ...payload } = eventData;
      const cleanPayload = {
        ...payload,
        start_date:
          payload.start_date && payload.start_date !== ''
            ? payload.start_date
            : new Date().toISOString(),
        end_date:
          payload.end_date && payload.end_date !== '' ? payload.end_date : null,

        display_mode: payload.display_mode || 'kanban',
      };

      const { data: createdEvent, error: eventError } = await supabase
        .from('events')
        .insert([cleanPayload])
        .select()
        .single();
      if (eventError) {
        // On affiche l'erreur détaillée dans la console et en alerte
        console.error('Erreur Supabase détaillée:', eventError);
        alert(`ERREUR SQL : ${eventError.message} (Code: ${eventError.code})`);
        return;
      }
      if (template_id) {
        const { data: tplItems } = await supabase
          .from('event_template_items')
          .select('*')
          .eq('template_id', template_id);
        if (tplItems?.length > 0) {
          const { data: catalog } = await supabase
            .from('objects')
            .select('id, name');
          for (const item of tplItems) {
            const matchingObj = catalog.find(
              (o) =>
                o.name?.trim().toLowerCase() ===
                item.object_name?.trim().toLowerCase()
            );
            if (!matchingObj) continue;

            const locationLabel = (item.location || 'VRAC')
              .trim()
              .toUpperCase();
            const crateLabel = item.target_crate
              ? `CAISSE ${item.target_crate}`
              : 'VRAC';

            let { data: loc } = await supabase
              .from('event_locations')
              .select('id')
              .eq('event_id', createdEvent.id)
              .eq('event_specific_name', locationLabel)
              .maybeSingle();
            if (!loc) {
              const { data: nLoc } = await supabase
                .from('event_locations')
                .insert({
                  event_id: createdEvent.id,
                  event_specific_name: locationLabel,
                })
                .select()
                .single();
              loc = nLoc;
            }

            let { data: crt } = await supabase
              .from('event_crates')
              .select('id')
              .eq('event_id', createdEvent.id)
              .eq('crate_label', crateLabel)
              .maybeSingle();
            if (!crt) {
              const { data: nCrt } = await supabase
                .from('event_crates')
                .insert({
                  event_id: createdEvent.id,
                  location_id: loc.id,
                  crate_label: crateLabel,
                })
                .select()
                .single();
              crt = nCrt;
            }

            await supabase.from('event_objects').insert({
              event_id: createdEvent.id,
              object_id: matchingObj.id,
              crate_id: crt.id,
              target_crate: crateLabel,
              target_location: locationLabel,
            });
          }
        }
      }
      await fetchData();
      setCurrentView('events_list');
    } catch (err) {
      alert('Erreur technique : ' + err.message);
    }
  };

  const pendingCount =
    rentalRequests?.filter((r) => r.status === 'pending').length || 0;
  const overdueCount =
    rentalRequests?.filter(
      (r) => r.status === 'approved' && new Date(r.end_date) < new Date()
    ).length || 0;

  // --- 8. LOGIQUE D'AFFICHAGE ---
  if (!isAuthenticated && !isQrBypass) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onGuestLogin={() => {
          setIsAuthenticated(true);
          setIsGuest(true);
          setIsAdmin(false);
          setCurrentView('rentals');
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-left">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isAdmin={isAdmin}
        isGuest={isGuest}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        pendingCount={pendingCount}
        overdueCount={overdueCount}
        onRefresh={fetchData}
        loading={loading}
        onLogout={async () => {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          window.location.reload();
        }}
        onPrint={() => window.print()}
      />

      <main className="pt-4">
        {currentView === 'home' && (
          <StockHome
            objects={objects}
            rentals={rentalRequests}
            cratesInfo={cratesInfo}
            isAdmin={isAdmin}
            isGuest={isGuest}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onUpdateObject={updateObject}
            onAddClick={() => setCurrentView('addObject')}
            onObjectClick={(obj) => {
              setSelectedObject(obj);
              navigateTo('detail');
            }}
            onOpenQR={(e, t, id, l) =>
              setQrData({ show: true, type: t, id, label: l })
            }
            onOpenTransfer={() => setShowTransferModal(true)}
            onToggleSelect={(id) =>
              setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            onBulkDelete={bulkDeleteObjects}
          />
        )}

        {currentView === 'byCrate' && (
          <CrateView
            objects={objects}
            cratesInfo={cratesInfo}
            rentals={rentalRequests}
            warehouses={warehouses}
            onSelectAll={handleSelectAll}
            isAdmin={isAdmin}
            onOpenQR={(e, t, id, l) =>
              setQrData({ show: true, type: t, id, label: l })
            }
            selectedIds={selectedIds}
            onToggleSelect={(id) =>
              setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            setShowTransferModal={setShowTransferModal}
            onObjectClick={(obj) => {
              setSelectedObject(obj);
              navigateTo('detail');
            }}
            onOpenCrateDetail={(num) => {
              setSelectedCrateDetail(
                cratesInfo.find((c) => c.crate_number === num) || {
                  crate_number: num,
                }
              );
              navigateTo('crateDetail');
            }}
          />
        )}

        {currentView === 'byLocation' && (
          <LocationView
            objects={objects}
            cratesInfo={cratesInfo}
            onOpenCrateDetail={(num) => {
              setSelectedCrateDetail(
                cratesInfo.find((c) => c.crate_number === num) || {
                  crate_number: num,
                }
              );
              navigateTo('crateDetail');
            }}
          />
        )}

        {currentView === 'detail' && selectedObject && (
          <ObjectDetail
            object={
              objects.find((o) => o.id === selectedObject.id) || selectedObject
            }
            isAdmin={isAdmin}
            isGuest={isGuest}
            onRent={setObjectToRent}
            warehouses={warehouses}
            onBack={handleGoBack}
            onUpdate={updateObject}
            onUploadImage={uploadImage}
            onOpenQR={(e, t, id, l) =>
              setQrData({ show: true, type: t, id, label: l })
            }
            onDelete={async (id) => {
              const result = await deleteObject(id);
              if (result?.success) {
                setSelectedObject(null);
                setCurrentView('home');
              }
            }}
          />
        )}

        {currentView === 'rentals' && (
          <RentalBookingView
            rentals={rentalRequests}
            contacts={contacts}
            getAvailableObjects={getAvailableObjects}
            onSubmitRequest={submitRentalRequest}
            onAddContact={() => navigateTo('contacts')}
            onBack={() => setCurrentView('home')}
            externalCart={persistentCart}
            setExternalCart={setPersistentCart}
            externalDates={persistentDates}
            setExternalDates={setPersistentDates}
            isGuest={isGuest}
          />
        )}

        {currentView === 'contacts' && (
          <ContactListView
            contacts={contacts}
            isAdmin={isAdmin}
            isGuest={isGuest}
            onRefresh={fetchData}
            onBack={handleGoBack}
          />
        )}

        {currentView === 'crateDetail' && selectedCrateDetail && (
          <CrateDetail
            crateInfo={selectedCrateDetail}
            objects={objects}
            warehouses={warehouses}
            onBack={handleGoBack}
            onUploadImage={uploadImage}
            onObjectClick={(obj) => {
              setSelectedObject(obj);
              navigateTo('detail');
            }}
            onUpdateCrate={async (num, up) => {
              await supabase
                .from('crates')
                .upsert(
                  { crate_number: Number(num), ...up },
                  { onConflict: 'crate_number' }
                );
              fetchData();
            }}
          />
        )}

        {currentView === 'rental_approval' && (
          <RentalLogisticView
            rentalRequests={rentalRequests}
            contacts={contacts}
            objects={objects}
            onBack={() => setCurrentView('home')}
            onApprove={approveRentalRequest}
            onReturn={returnRentalRequest}
            onReject={async (id) => {
              if (window.confirm('Rejeter cette demande ?')) {
                await supabase
                  .from('rental_requests')
                  .update({ status: 'rejected' })
                  .eq('id', id);
                fetchData();
              }
            }}
          />
        )}

        {currentView === 'events_list' && (
          <EventsListView
            events={events}
            onSelectEvent={handleSelectEventForLogistics}
            isAdmin={isAdmin}
            fetchData={fetchData}
            onAddEvent={handleAddEventWithTemplate}
          />
        )}

        {currentView === 'event_logistics' && (
          <EventLogisticsView
            selectedEvent={selectedEvent}
            objects={objects}
            allObjects={objects}
            onBack={() => {
              setSelectedEvent(null);
              setCurrentView('events_list');
            }}
            fetchData={fetchData}
            onUpdateObject={updateObject}
          />
        )}

        {currentView === 'byCategory' && (
          <CategoryView
            objects={objects}
            selectedIds={selectedIds}
            isAdmin={isAdmin}
            setCurrentView={setCurrentView}
            onSelectObject={(id) =>
              setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            onOpenTransfer={() => setShowTransferModal(true)}
            onObjectClick={(obj) => {
              setSelectedObject(obj);
              navigateTo('detail');
            }}
          />
        )}

        {currentView === 'category_manager' && (
          <CategoryManagerView
            categories={categories}
            onBack={() => setCurrentView('byCategory')}
            onRefresh={fetchData}
          />
        )}
        {currentView === 'warehouse_manager' && (
          <WarehouseManagerView
            warehouses={warehouses}
            onBack={() => setCurrentView('home')}
            onRefresh={fetchData}
          />
        )}
        {currentView === 'templateManager' && (
          <TemplateManagerView onBack={() => setCurrentView('events_list')} />
        )}
        {currentView === 'manage_users' && (
          <UserManagementView onBack={() => setCurrentView('home')} />
        )}
        {currentView === 'stockRequests' && (
          <StockRequestView
            objects={objects}
            onBack={() => setCurrentView('home')}
            fetchData={fetchData}
          />
        )}

        {currentView === 'addObject' && (
          <AddObjectForm
            onAdd={async (obj) => {
              await addObject(obj);
              setCurrentView('home');
            }}
            onCancel={() => setCurrentView('home')}
            onUploadImage={uploadImage}
            uploading={uploading}
            warehouses={warehouses}
          />
        )}

        {currentView === 'tasks' && (
          <TaskBoardContainer isAdmin={isAdmin} isGuest={isGuest} categories={categories} />
        )}
      </main>

      {/* MODALES GLOBALES */}
      {qrData.show && (
        <QrCodeModal
          data={qrData}
          onClose={() => setQrData({ ...qrData, show: false })}
        />
      )}
      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          mode={currentView === 'byCrate' ? 'crate' : 'object'}
          selectedCount={selectedIds.length}
          loading={loading}
          onConfirm={async (newValue) => {
            try {
              // 1. Nettoyage des IDs (on s'assure d'avoir des nombres)
              const cleanIds = selectedIds.map((id) => {
                if (typeof id === 'string') {
                  return parseInt(id.includes('-') ? id.split('-')[0] : id);
                }
                return Number(id);
              });

              // 2. Appel de la mise à jour
              // On parse newValue au cas où c'est une chaîne
              const targetCrate = parseInt(newValue);

              console.log('Exécution du transfert...', {
                cleanIds,
                targetCrate,
              });

              const res = await bulkUpdateObjects(
                cleanIds,
                'crate',
                targetCrate
              );

              // 3. On ferme et on rafraîchit
              // On vérifie res.success OU si res existe simplement (selon ta version de useStockData)
              if (res) {
                setShowTransferModal(false);
                setSelectedIds([]);

                // APPEL DE LA BONNE FONCTION DE RECHARGEMENT
                if (typeof fetchData === 'function') {
                  await fetchData();
                }

                alert('Transfert réussi !');
              }
            } catch (err) {
              console.error('Erreur transfert:', err);
              alert('Une erreur est survenue lors du transfert.');
            }
          }}
        />
      )}

      {rentalToReturn && (
        <ReturnRentalModal
          rental={rentalToReturn}
          onClose={() => setRentalToReturn(null)}
          onConfirm={async (r, c) => {
            if (await returnRentalRequest(r, c)) setRentalToReturn(null);
          }}
        />
      )}

      {objectToRent && objectToRent.id && (
        <RentModal
          object={objectToRent}
          rentals={rentalRequests}
          onClose={() => setObjectToRent(null)}
          onConfirm={async (data) => {
            await submitRentalRequest(data);
            setObjectToRent(null);
          }}
        />
      )}

      {loading && (
        <div className="fixed bottom-4 right-4 bg-white p-3 rounded-full shadow-lg animate-bounce z-[110]">
          <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
}