import { useState, useEffect, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, SharedTripProvider, useTripContext } from './context/TripContext';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import TripList from './components/trips/TripList';
import TripDetail from './components/trips/TripDetail';
import TripMap from './components/map/TripMap';
import LoginModal from './components/auth/LoginModal';
import { LockIcon, UnlockIcon } from './components/ui/Icons';
import { fixLeafletIcons } from './utils/leafletSetup';
import { decodeTripFromUrl } from './utils/shareTrip';
import { Trip } from './types';

fixLeafletIcons();

function AuthButton() {
  const { isAuthorized, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (isAuthorized) {
    return (
      <button
        onClick={logout}
        className="fixed bottom-4 left-4 flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs hover:bg-green-600 transition-colors z-[1000]"
        title="Logout"
      >
        <UnlockIcon size={13} /> Authorized
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="fixed bottom-4 left-4 flex items-center gap-1.5 bg-gray-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs hover:bg-gray-600 transition-colors z-[1000]"
        title="Login to edit"
      >
        <LockIcon size={13} /> View Only
      </button>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

// On mobile, Expenses and Notes take the full screen and hide the map
function TripLayout({ sidebar }: { sidebar: ReactNode }) {
  const { selectedTrip, activeTab } = useTripContext();
  const mapHidden = !!selectedTrip && (activeTab === 'expenses' || activeTab === 'notes');

  return (
    <div className="flex flex-col md:flex-row h-full">
      <Sidebar fullHeight={mapHidden}>
        {sidebar}
      </Sidebar>
      <MainContent hiddenOnMobile={mapHidden}>
        <TripMap />
      </MainContent>
    </div>
  );
}

function AppContent() {
  const { selectedTripId } = useTripContext();
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    decodeTripFromUrl().then(trip => {
      if (trip) setSharedTrip(trip);
    });

    const onHashChange = () => {
      decodeTripFromUrl().then(trip => {
        setSharedTrip(trip);
      });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (sharedTrip) {
    return (
      <SharedTripProvider key={sharedTrip.id} trip={sharedTrip}>
        <TripLayout sidebar={<TripDetail />} />
      </SharedTripProvider>
    );
  }

  return <TripLayout sidebar={selectedTripId ? <TripDetail /> : <TripList />} />;
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AppContent />
        <AuthButton />
      </TripProvider>
    </AuthProvider>
  );
}
