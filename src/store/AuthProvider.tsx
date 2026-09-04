import React, { createContext, useContext, useEffect, useState } from "react";
import type { EmailOtpType, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface AuthResult {
  error?: string;
  /** True when Supabase requires the user to confirm their email before a session exists. */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  callbackError: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    async function initializeAuth() {
      const url = new URL(window.location.href);
      const callbackMessage = url.searchParams.get("error_description") ?? url.searchParams.get("error");

      try {
        if (callbackMessage) throw new Error(callbackMessage);

        let nextSession: Session | null = null;
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type") as EmailOtpType | null;

        // Support both Supabase confirmation-link formats. `code` is used by
        // PKCE links; `token_hash` is used by custom email templates.
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          nextSession = data.session;
        } else if (tokenHash && type) {
          const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
          nextSession = data.session;
        } else {
          // Also waits for Supabase JS to consume legacy implicit-flow tokens
          // from the URL hash when `detectSessionInUrl` is enabled.
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          nextSession = data.session;
        }

        if (!active) return;
        setSession(nextSession);

        if (code || tokenHash || window.location.hash.includes("access_token=")) {
          window.history.replaceState({}, document.title, nextSession ? "/garden" : "/login");
        }
      } catch (error) {
        if (!active) return;
        setCallbackError(error instanceof Error ? error.message : "Could not confirm email");
        window.history.replaceState({}, document.title, "/login");
      } finally {
        if (active) setLoading(false);
      }
    }

    void initializeAuth();

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return { error: error.message };
    // If "Confirm email" is enabled in Supabase Auth settings, signUp succeeds
    // but returns no session until the user clicks the confirmation link.
    return { needsEmailConfirmation: !data.session };
  }

  async function resendConfirmation(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message };
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, callbackError, signIn, signUp, resendConfirmation, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
