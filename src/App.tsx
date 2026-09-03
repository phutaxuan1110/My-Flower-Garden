import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GardenProvider, useGarden } from "./store/GardenProvider";
import { ToastProvider } from "./hooks/useToast";
import { AddFlowProvider, useAddFlow } from "./hooks/useAddFlow";
import { GardenEditModeProvider } from "./hooks/useGardenEditMode";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { MobileAppShell } from "./components/MobileAppShell";
import { AddBouquetSheet } from "./components/AddBouquetSheet";
import { OnboardingPage } from "./pages/OnboardingPage";
import { GardenPage } from "./pages/GardenPage";
import { CollectionPage } from "./pages/CollectionPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BouquetDetailPage } from "./pages/BouquetDetailPage";

function AddBouquetHost() {
  const { isOpen, close } = useAddFlow();
  return <AnimatePresence>{isOpen && <AddBouquetSheet onClose={close} />}</AnimatePresence>;
}

function OnboardingGate() {
  const { loading, onboardingComplete } = useGarden();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-dvh bg-[var(--color-bg)]" />;
  }

  if (!onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/*"
        element={
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
          </MobileAppShell>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <GardenProvider>
          <ToastProvider>
            <AddFlowProvider>
              <GardenEditModeProvider>
                <OnboardingGate />
                <AddBouquetHost />
              </GardenEditModeProvider>
            </AddFlowProvider>
          </ToastProvider>
        </GardenProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
