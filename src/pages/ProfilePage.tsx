import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, LogOut, Sprout, User } from "lucide-react";
import { useGarden } from "../store/GardenProvider";
import { useAuth } from "../store/AuthProvider";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../i18n/LanguageProvider";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { setOnboardingSeen } from "../lib/onboardingFlag";

export function ProfilePage() {
  const { profile, updateProfile, totalCount } = useGarden();
  const { signOut } = useAuth();
  const { show } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [gardenName, setGardenName] = useState(profile?.gardenName ?? "");
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  async function handleSave() {
    await updateProfile({ displayName: displayName.trim() || "Friend", gardenName: gardenName.trim() || "My Flower Garden" });
    show(t("profile.saved"));
  }

  async function handleSignOut() {
    setConfirmSignOut(false);
    await signOut();
  }

  function replayOnboarding() {
    setOnboardingSeen(false);
    navigate("/onboarding");
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-ink)]">
          <User size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-xl text-[var(--color-ink)]">{profile?.displayName ?? "Friend"}</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {totalCount} {t("profile.savedCount")}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="display-name">
            {t("profile.yourName")}
          </label>
          <input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="garden-name">
            {t("profile.gardenName")}
          </label>
          <input
            id="garden-name"
            value={gardenName}
            onChange={(e) => setGardenName(e.target.value)}
            className="min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 active:scale-95"
        >
          {t("profile.save")}
        </button>
      </div>

      <div className="mt-8">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          <Globe size={15} strokeWidth={1.75} /> {t("profile.language")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLanguage("vi")}
            aria-pressed={language === "vi"}
            className={`min-h-[44px] flex-1 rounded-full border text-sm font-medium transition-colors ${
              language === "vi"
                ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]"
                : "border-[var(--color-line)] text-[var(--color-ink)]"
            }`}
          >
            {t("profile.languageVi")}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            aria-pressed={language === "en"}
            className={`min-h-[44px] flex-1 rounded-full border text-sm font-medium transition-colors ${
              language === "en"
                ? "border-[var(--color-rose)] bg-[var(--color-rose)]/10 text-[var(--color-rose)]"
                : "border-[var(--color-line)] text-[var(--color-ink)]"
            }`}
          >
            {t("profile.languageEn")}
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <button
          type="button"
          onClick={replayOnboarding}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
        >
          <Sprout size={15} /> {t("profile.replayOnboarding")}
        </button>
        <button
          type="button"
          onClick={() => setConfirmSignOut(true)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-[var(--color-rose)]"
        >
          <LogOut size={15} /> {t("profile.signOut")}
        </button>
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-[var(--color-muted)]">{t("profile.footerNote")}</p>

      <ConfirmationDialog
        open={confirmSignOut}
        title={t("profile.signOutConfirmTitle")}
        description={t("profile.signOutConfirmBody")}
        confirmLabel={t("profile.signOut")}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmSignOut(false)}
      />
    </div>
  );
}
