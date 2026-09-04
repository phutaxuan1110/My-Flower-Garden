import { useSyncExternalStore } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./store/AuthProvider";
import { GardenProvider, useGarden } from "./store/GardenProvider";
import { ToastProvider } from "./hooks/useToast";
import { AddFlowProvider, useAddFlow } from "./hooks/useAddFlow";
import { GardenEditModeProvider } from "./hooks/useGardenEditMode";
import { ChromeVisibilityProvider } from "./hooks/useChromeVisibility";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { MobileAppShell } from "./components/MobileAppShell";
import { AddBouquetSheet } from "./components/AddBouquetSheet";
import { OnboardingPage } from "./pages/OnboardingPage";
import { LoginPage } from "./pages/LoginPage";
import { GardenPage } from "./pages/GardenPage";
import { CollectionPage } from "./pages/CollectionPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BouquetDetailPage } from "./pages/BouquetDetailPage";
import { SharedGardenPage } from "./pages/SharedGardenPage";
import { getOnboardingSeen, subscribeOnboardingSeen } from "./lib/onboardingFlag";

function AddBouquetHost() {
  const { isOpen, close } = useAddFlow();
  return <AnimatePresence>{isOpen && <AddBouquetSheet onClose={close} />}</AnimatePresence>;
}

function LoadingScreen() {
  return <div className="full-bleed-height fixed inset-0 w-full bg-[var(--color-bg)]" />;
}

/** Data layer + main app routes. Only ever mounted once a session exists. */
function AuthenticatedApp() {
  const { loading } = useGarden();
  if (loading) return <LoadingScreen />;

  return (
    <MobileAppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/garden" replace />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bouquet/:id" element={<BouquetDetailPage />} />
        <Route path="*" element={<Navigate to="/garden" replace />} />
      </Routes>
      <AddBouquetHost />
    </MobileAppShell>
  );
}

/**
 * Gate order: onboarding (device-local, no account needed) -> sign-in
 * (required) -> the real app (only mounts GardenProvider, i.e. only talks to
 * Supabase, once a session exists).
 */
function RootGate() {
  const { session, loading } = useAuth();
  const { pathname } = useLocation();
  const onboardingSeen = useSyncExternalStore(subscribeOnboardingSeen, getOnboardingSeen);

  // Public share links must remain accessible without onboarding or an account.
  if (pathname.startsWith("/share/")) {
    return (
      <Routes>
        <Route path="/share/:shareToken" element={<SharedGardenPage />} />
        <Route path="/share/:shareToken/collection" element={<SharedGardenPage />} />
        <Route path="/share/:shareToken/bouquet/:bouquetId" element={<SharedGardenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (loading) return <LoadingScreen />;

  if (!onboardingSeen) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AddFlowProvider>
      <GardenEditModeProvider>
        <GardenProvider>
          <ChromeVisibilityProvider>
            <AuthenticatedApp />
          </ChromeVisibilityProvider>
        </GardenProvider>
      </GardenEditModeProvider>
    </AddFlowProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <RootGate />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
