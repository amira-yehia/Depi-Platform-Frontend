import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignInPage.css";
import ForgotPassword from "./ForgotPassword.jsx";
import { authService, saveTokens } from "../services/api";

/* ── Brand Logo ── */
function BrandLogo() {
  return (
    <svg className="brand-logo" viewBox="0 0 420 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NextHire – Smart matches, better future">
      {[0, 7, 14].map((dx) =>
        [0, 7, 14].map((dy) => {
          const isOrange = (dx === 7 && dy === 0) || (dx === 14 && dy === 0) || (dx === 14 && dy === 7);
          return <circle key={`${dx}-${dy}`} cx={8 + dx} cy={8 + dy} r={2} fill={isOrange ? "#f47c20" : "#3a5a80"} />;
        }),
      )}
      <path d="M14 30 L14 72 L26 72 L26 52 L48 72 L60 72 L60 30 L48 30 L48 50 L26 30 Z" fill="url(#navyGrad)" />
      <rect x="42" y="28" width="16" height="46" rx="4" fill="#f47c20" />
      <circle cx="58" cy="51" r="6" fill="#f47c20" />
      <circle cx="42" cy="51" r="6" fill="url(#navyGrad)" />
      <defs>
        <linearGradient id="navyGrad" x1="14" y1="28" x2="60" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a4a72" />
          <stop offset="100%" stopColor="#1a2e4a" />
        </linearGradient>
      </defs>
      <line x1="80" y1="28" x2="80" y2="74" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <text x="94" y="63" fontFamily="Poppins, sans-serif" fontSize="32" fontWeight="700" fill="#ffffff">Next</text>
      <text x="186" y="63" fontFamily="Poppins, sans-serif" fontSize="32" fontWeight="700" fill="#f47c20">Hire</text>
      <text x="94" y="80" fontFamily="Poppins, sans-serif" fontSize="11" fill="rgba(255,255,255,0.5)">Smart matches, better future</text>
    </svg>
  );
}

function IconMail() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6a6c70" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
}

function IconLock() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6a6c70" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
}

function IconEye({ open }) {
  return open
    ? <span style={{ color: "#4b5563" }}><i className="fa-regular fa-eye"></i></span>
    : <span style={{ color: "#4b5563" }}><i className="fa-regular fa-eye-slash"></i></span>;
}

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function IconFacebook() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
}

export default function SignInPage() {
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("authEmail") || ""; } catch { return ""; }
  });
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("idle");
  const [forgotPassOpen, setForgotPassOpen] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("idle");

    try {
      const apiData = await authService.login(email.trim().toLowerCase(), password.trim());

      const userObj = apiData.user || apiData;

      // Save tokens
      saveTokens(apiData.accessToken || apiData.token, apiData.refreshToken);

      // Save user info
      const fullName = [userObj.firstName, userObj.lastName].filter(Boolean).join(" ").trim()
        || userObj.fullName || userObj.userName || email.split("@")[0];
      localStorage.setItem("authUserName", fullName);
      localStorage.setItem("authEmail", email.trim().toLowerCase());
      if (userObj.id) localStorage.setItem("userId", userObj.id);

      setStatusMessage("Signed in successfully.");
      setStatusType("success");
      navigate("/dashboard", { state: { userName: fullName } });
    } catch (error) {
      const rawMessage = error?.message || "Failed to sign in.";
      const isWrongPassword = error?.status === 400 || error?.status === 401 || /password|incorrect|invalid/i.test(rawMessage);
      setStatusMessage(
        isWrongPassword
          ? "The password you entered is incorrect. Please try again."
          : rawMessage
      );
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="bg-glow" aria-hidden="true" />
      <main className="page">
        <BrandLogo />
        <div className="card" role="main">
          <div className="card-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSignIn}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <span className="icon-left"><IconMail /></span>
                <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="icon-left"><IconLock /></span>
                <input id="password" type={showPass ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                <button className="icon-right" type="button" aria-label={showPass ? "Hide password" : "Show password"} onClick={() => setShowPass((v) => !v)}>
                  <IconEye open={showPass} />
                </button>
              </div>
            </div>
            <div className="forgot-row">
              <a href="#forgot" onClick={(e) => { e.preventDefault(); setForgotPassOpen(true); }}>Forgot password?</a>
            </div>
            <button className="btn-signin" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
            {statusMessage ? (
              <p className={`signinStatus signinStatus--${statusType}`} role="status">{statusMessage}</p>
            ) : null}
            <div className="divider">Or continue with</div>
            <div className="social-row">
              <button className="btn-social" type="button"><IconGoogle />Google</button>
              <button className="btn-social" type="button"><IconFacebook />Facebook</button>
            </div>
            <p className="signup-row">Don&apos;t have an account?<Link to="/signup">Sign up</Link></p>
          </form>
        </div>
      </main>
      <ForgotPassword isOpen={forgotPassOpen} onClose={() => setForgotPassOpen(false)} initialEmail={email} />
    </div>
  );
}
