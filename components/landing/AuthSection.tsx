"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import "../../firebase/config";

type Mode = "login" | "signup";

type AuthSectionProps = {
  mode?: Mode;
  onModeChange?: (mode: Mode) => void;
};

function authMessage(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/weak-password":
        return "Use a password with at least 6 characters.";
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
    }
  }

  return "Authentication failed. Please try again.";
}

export default function AuthSection({
  mode: modeProp,
  onModeChange,
}: AuthSectionProps = {}) {
  const router = useRouter();
  const [internalMode, setInternalMode] = useState<Mode>("login");
  const mode = modeProp ?? internalMode;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function changeMode(next: Mode) {
    setInternalMode(next);
    onModeChange?.(next);
    setError("");
  }

  // clear stale errors when the tab is switched from the book CTA
  useEffect(() => {
    setError("");
  }, [modeProp]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const auth = getAuth();

      if (mode === "signup") {
        if (!fullName.trim()) {
          setError("Enter your full name.");
          return;
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(result.user, { displayName: fullName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      router.replace("/dashboard");
    } catch (cause) {
      setError(authMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);

    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider());
      router.replace("/dashboard");
    } catch (cause) {
      setError(authMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="landing-auth-section" id="login">
      <div className="landing-auth-intro">
        <span className="landing-eyebrow">YOUR NEXT CHAPTER</span>
        <h2>
          Begin with
          <br />
          possibility.
        </h2>
        <p>
          Sign in to see the whole picture, from the first exam to the next
          breakthrough.
        </p>
      </div>

      <div className="landing-auth-panel">
        <div className="landing-auth-tabs" role="tablist" aria-label="Account">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => changeMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h3>{mode === "login" ? "Welcome back." : "Create your account."}</h3>
            <p className="landing-auth-hint">
              {mode === "login"
                ? "Pick up where your progress left off."
                : "Start your ORBIZEE journey."}
            </p>

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label>
                  Full Name
                  <input
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={mode === "signup" ? 6 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              {mode === "signup" && (
                <label>
                  Confirm Password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </label>
              )}

              {error && (
                <p className="landing-auth-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="landing-primary-button"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Please wait..."
                  : mode === "login"
                    ? "Enter the dashboard"
                    : "Create account"}
              </button>
            </form>

            <div className="landing-auth-divider">OR</div>

            <button
              className="landing-google-button"
              type="button"
              onClick={handleGoogle}
              disabled={busy}
            >
              Continue with Google
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}