import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./AuthGate.css";

// Who is signed in and what they may do: role is "editor", "viewer" or null (not on the survey team).
const AuthContext = createContext({ user: null, role: null, canEdit: false, signOut: () => {} });
export const useAuth = () => useContext(AuthContext);

function Screen({ title, subtitle, children }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">Nearzy Survey Map</div>
        <h2>{title}</h2>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const signIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setMsg({ type: "error", text: "Wrong email or password." });
    setBusy(false);
  };

  const forgot = async () => {
    if (!email.trim()) {
      setMsg({ type: "error", text: "Type your email above first, then tap “Forgot password”." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    setMsg(error
      ? { type: "error", text: "Couldn't send the email. Try again in a minute." }
      : { type: "success", text: "If this email is on the team, a reset link is on its way." });
    setBusy(false);
  };

  return (
    <Screen title="Log in" subtitle="Team members only. Ask the admin if you need an account.">
      <form onSubmit={signIn} className="auth-form">
        {msg && <div className={`auth-msg ${msg.type}`}>{msg.text}</div>}
        <label>Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="auth-btn" disabled={busy}>{busy ? "Please wait…" : "Log in"}</button>
        <button type="button" className="auth-link" onClick={forgot} disabled={busy}>Forgot password?</button>
      </form>
    </Screen>
  );
}

function NewPasswordForm({ onDone }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setMsg({ type: "error", text: "Use at least 8 characters." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMsg({ type: "error", text: error.message });
    else onDone();
  };

  return (
    <Screen title="Set a new password">
      <form onSubmit={save} className="auth-form">
        {msg && <div className={`auth-msg ${msg.type}`}>{msg.text}</div>}
        <label>New password
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="auth-btn" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
      </form>
    </Screen>
  );
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined while loading
  const [role, setRole] = useState(undefined); // undefined while loading
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) {
      setRole(undefined);
      return;
    }
    let alive = true;
    setRole(undefined);
    supabase.rpc("my_survey_role").then(({ data, error }) => {
      if (alive) setRole(error ? null : data || null);
    });
    return () => { alive = false; };
  }, [userId]);

  const signOut = () => supabase.auth.signOut();

  if (session === undefined) return <Screen title="Loading…" />;
  if (!session) return <LoginForm />;
  if (recovering) return <NewPasswordForm onDone={() => setRecovering(false)} />;
  if (role === undefined) return <Screen title="Loading…" />;
  if (!role) {
    return (
      <Screen
        title="Not on the team yet"
        subtitle={`${session.user.email} can log in, but hasn't been added to the survey team. Ask the admin to add this email.`}
      >
        <button className="auth-btn" onClick={signOut}>Log out</button>
      </Screen>
    );
  }

  return (
    <AuthContext.Provider value={{ user: session.user, role, canEdit: role === "editor", signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
