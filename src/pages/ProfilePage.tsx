import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Globe, Link2, LogOut, RotateCcw, Share2, Unlink, User } from "lucide-react";
import { useGarden } from "../store/GardenProvider";
import { useAuth } from "../store/AuthProvider";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../i18n/LanguageProvider";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { setOnboardingSeen } from "../lib/onboardingFlag";
import { disableGardenShare, enableGardenShare, getGardenShareToken } from "../lib/shareService";

export function ProfilePage() {
  const { profile, updateProfile, totalCount, resetGarden } = useGarden();
  const { signOut } = useAuth();
  const { show } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [gardenName, setGardenName] = useState(profile?.gardenName ?? "");
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(true);
  const [shareError, setShareError] = useState(false);
  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : "";

  useEffect(() => {
    let active = true;
    getGardenShareToken()
      .then((token) => { if (active) setShareToken(token); })
      .catch(() => { if (active) setShareError(true); })
      .finally(() => { if (active) setShareBusy(false); });
    return () => { active = false; };
  }, []);

  async function handleSave() {
    await updateProfile({ displayName: displayName.trim() || "Friend", gardenName: gardenName.trim() || "My Flower Garden" });
    show(t("profile.saved"));
  }

  async function handleSignOut() {
    setConfirmSignOut(false);
    await signOut();
  }

  async function handleReset() {
    setConfirmReset(false);
    setIsResetting(true);
    try {
      await resetGarden();
      setOnboardingSeen(false);
      navigate("/onboarding", { replace: true });
    } catch {
      setIsResetting(false);
      show(t("profile.resetError"), "error");
    }
  }

  async function handleEnableShare() {
    setShareBusy(true);
    setShareError(false);
    try {
      setShareToken(await enableGardenShare());
      show(t("share.linkCreated"));
    } catch {
      setShareError(true);
    } finally {
      setShareBusy(false);
    }
  }

  async function handleCopyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      show(t("share.linkCopied"));
    } catch {
      setShareError(true);
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) return handleCopyShare();
    try {
      await navigator.share({ title: profile?.gardenName ?? "My Flower Garden", url: shareUrl });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareError(true);
    }
  }

  async function handleDisableShare() {
    setShareBusy(true);
    setShareError(false);
    try {
      await disableGardenShare();
      setShareToken(null);
      show(t("share.linkDisabled"), "info");
    } catch {
      setShareError(true);
    } finally {
      setShareBusy(false);
    }
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

      <section className="mt-8 rounded-[24px] border border-[var(--color-line)] bg-white/70 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-rose)]">
            <Share2 size={18} />
          </span>
          <div>
            <h2 className="font-display text-lg text-[var(--color-ink)]">{t("share.settingsTitle")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{t("share.settingsBody")}</p>
          </div>
        </div>

        {shareToken ? (
          <div className="mt-4">
            <div className="flex min-h-[44px] items-center gap-2 rounded-2xl border border-[var(--color-line)] bg-white px-3">
              <Link2 size={15} className="shrink-0 text-[var(--color-rose)]" />
              <input readOnly value={shareUrl} aria-label={t("share.publicLink")} className="min-w-0 flex-1 truncate bg-transparent text-xs text-[var(--color-muted)] outline-none" />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={handleCopyShare} className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]">
                <Copy size={15} /> {t("share.copyLink")}
              </button>
              <button type="button" onClick={handleNativeShare} className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white">
                <Share2 size={15} /> {t("share.shareNow")}
              </button>
            </div>
            <button type="button" disabled={shareBusy} onClick={handleDisableShare} className="mt-2 flex min-h-[40px] w-full items-center justify-center gap-2 text-xs font-medium text-[var(--color-muted)] disabled:opacity-50">
              <Unlink size={14} /> {t("share.disableLink")}
            </button>
          </div>
        ) : (
          <button type="button" disabled={shareBusy} onClick={handleEnableShare} className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white disabled:opacity-50">
            <Link2 size={16} /> {shareBusy ? t("auth.loading") : t("share.createLink")}
          </button>
        )}
        {shareError && <p className="mt-2 text-xs text-[var(--color-rose)]">{t("share.error")}</p>}
      </section>

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
          onClick={() => setConfirmReset(true)}
          disabled={isResetting}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)] disabled:opacity-50"
        >
          <RotateCcw size={15} /> {isResetting ? t("profile.resetting") : t("profile.resetData")}
        </button>
        <button
          type="button"
          onClick={() => setConfirmSignOut(true)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-[var(--color-rose)]"
        >
          <LogOut size={15} /> {t("profile.signOut")}
        </button>
      </div>

      <ConfirmationDialog
        open={confirmSignOut}
        title={t("profile.signOutConfirmTitle")}
        description={t("profile.signOutConfirmBody")}
        confirmLabel={t("profile.signOut")}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmSignOut(false)}
      />

      <ConfirmationDialog
        open={confirmReset}
        title={t("profile.resetConfirmTitle")}
        description={t("profile.resetConfirmBody")}
        confirmLabel={t("profile.resetData")}
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
