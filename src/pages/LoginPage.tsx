import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { useAuth } from "../store/AuthProvider";
import { useLanguage } from "../i18n/LanguageProvider";

export function LoginPage() {
  const { callbackError, signIn, signUp, resendConfirmation } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const emailNotConfirmed = error?.toLowerCase().includes("email not confirmed") ?? false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signIn") {
        const result = await signIn(email, password);
        if (result.error) setError(result.error);
      } else {
        const result = await signUp(email, password);
        if (result.error) setError(result.error);
        else if (result.needsEmailConfirmation) setConfirmationSent(true);
        // Otherwise Supabase already returned a session; AuthProvider's
        // onAuthStateChange listener picks it up and the app gate re-renders.
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError(null);
    setBusy(true);
    const result = await resendConfirmation(email);
    setBusy(false);
    if (result.error) setError(result.error);
    else setResendSent(true);
  }

  return (
    <div className="full-bleed-height fixed inset-0 w-full overflow-y-auto bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)]">
      <div
        className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center px-8"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 24px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-ink)]">
              <Sprout size={24} strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-[var(--color-ink)]">{t("auth.title")}</h1>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">{t("auth.subtitle")}</p>
          </div>

          <div className="mb-5 flex gap-2 rounded-full bg-white/60 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signIn");
                setError(null);
                setConfirmationSent(false);
              }}
              className={`min-h-[40px] flex-1 rounded-full text-sm font-medium transition-colors ${
                mode === "signIn" ? "bg-[var(--color-rose)] text-white" : "text-[var(--color-ink)]"
              }`}
            >
              {t("auth.signInTab")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signUp");
                setError(null);
                setConfirmationSent(false);
              }}
              className={`min-h-[40px] flex-1 rounded-full text-sm font-medium transition-colors ${
                mode === "signUp" ? "bg-[var(--color-rose)] text-white" : "text-[var(--color-ink)]"
              }`}
            >
              {t("auth.signUpTab")}
            </button>
          </div>

          {confirmationSent ? (
            <p className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4 text-center text-sm text-[var(--color-ink)]">
              {t("auth.checkEmail")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="email">
                  {t("auth.emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="password">
                  {t("auth.passwordLabel")}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]"
                />
                {mode === "signUp" && (
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{t("auth.passwordHint")}</p>
                )}
              </div>

              {(error || callbackError) && (
                <p className="text-sm text-[var(--color-rose)]">
                  {emailNotConfirmed ? t("auth.emailNotConfirmed") : error ?? callbackError}
                </p>
              )}

              {emailNotConfirmed && (
                <button
                  type="button"
                  disabled={busy || resendSent}
                  onClick={handleResend}
                  className="text-sm font-medium text-[var(--color-rose)] underline underline-offset-4 disabled:opacity-60"
                >
                  {resendSent ? t("auth.resendSent") : t("auth.resendConfirmation")}
                </button>
              )}

              <button
                type="submit"
                disabled={busy}
                className="min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 active:scale-95 disabled:opacity-60"
              >
                {busy ? t("auth.loading") : mode === "signIn" ? t("auth.signInCta") : t("auth.signUpCta")}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
