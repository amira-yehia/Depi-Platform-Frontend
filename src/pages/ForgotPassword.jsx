import { useState } from "react";
import "./ForgotPassword.css";
import { authService } from "../services/api";

export default function ForgotPassword({ isOpen, onClose, initialEmail = "" }) {
  const [step, setStep] = useState("email"); // "email" | "reset" | "done"
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("idle");

  if (!isOpen) return null;

  async function handleSendEmail(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setMessage("Reset code sent! Check your email.");
      setMsgType("success");
      setStep("reset");
    } catch (err) {
      setMessage(err.message || "Failed to send reset email.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMsgType("error");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMsgType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    console.log({
      email,
      token,
      newPassword,
    });
    try {
      await authService.resetPassword(
        email.trim().toLowerCase(),
        token.trim(),
        newPassword,
      );
      setMessage("Password reset successfully!");
      setMsgType("success");
      setStep("done");
    } catch (err) {
      setMessage(err.message || "Failed to reset password.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep("email");
    setMessage("");
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  }

  return (
    <div className="forgotOverlay" onClick={handleClose}>
      <div className="forgotModal" onClick={(e) => e.stopPropagation()}>
        <button
          className="forgotModal__close"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Step indicators */}
        <div className="forgotSteps">
          <span
            className={`forgotStep ${step === "email" ? "active" : step !== "email" ? "done" : ""}`}
          >
            1
          </span>
          <span className="forgotStepLine" />
          <span
            className={`forgotStep ${step === "reset" ? "active" : step === "done" ? "done" : ""}`}
          >
            2
          </span>
          <span className="forgotStepLine" />
          <span className={`forgotStep ${step === "done" ? "done" : ""}`}>
            3
          </span>
        </div>

        <h2>
          {step === "email" && "Forgot Password?"}
          {step === "reset" && "Enter Reset Code"}
          {step === "done" && "All Done!"}
        </h2>

        {/* Step 1 — Email */}
        {step === "email" && (
          <form onSubmit={handleSendEmail}>
            <p>Enter your email and we'll send you a reset code.</p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* Step 2 — Token + New Password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <p>Enter the code from your email and choose a new password.</p>
            <input
              type="text"
              placeholder="Reset code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoFocus
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              className="forgotBackBtn"
              onClick={() => {
                setStep("email");
                setMessage("");
              }}
            >
              ← Back
            </button>
          </form>
        )}

        {/* Step 3 — Done */}
        {step === "done" && (
          <div className="forgotDone">
            <div className="forgotDone__icon">✅</div>
            <p>
              Your password has been reset successfully.
              <br />
              You can now sign in with your new password.
            </p>
            <button type="button" onClick={handleClose}>
              Sign In Now
            </button>
          </div>
        )}

        {message && (
          <p className={`forgotMsg forgotMsg--${msgType}`}>{message}</p>
        )}
      </div>
    </div>
  );
}

// import { useState } from "react";
// import "./ForgotPassword.css";
// import { authService } from "../services/api";

// export default function ForgotPassword({ isOpen, onClose, initialEmail = "" }) {
//   const [step, setStep] = useState("email"); // "email" | "reset" | "done"
//   const [email, setEmail] = useState(initialEmail);
//   const [token, setToken] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [msgType, setMsgType] = useState("idle");

//   if (!isOpen) return null;

//   async function handleSendEmail(e) {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     try {
//       await authService.forgotPassword(email.trim().toLowerCase());
//       setMessage("Reset link sent! Check your email.");
//       setMsgType("success");
//       setStep("reset");
//     } catch (err) {
//       setMessage(err.message || "Failed to send reset email.");
//       setMsgType("error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleResetPassword(e) {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     try {
//       await authService.resetPassword(email.trim().toLowerCase(), token.trim(), newPassword);
//       setMessage("Password reset successfully! You can sign in now.");
//       setMsgType("success");
//       setStep("done");
//     } catch (err) {
//       setMessage(err.message || "Failed to reset password.");
//       setMsgType("error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleClose() {
//     setStep("email");
//     setMessage("");
//     setToken("");
//     setNewPassword("");
//     onClose();
//   }

//   return (
//     <div className="forgotOverlay" onClick={handleClose}>
//       <div className="forgotModal" onClick={(e) => e.stopPropagation()}>
//         <button className="forgotModal__close" onClick={handleClose} aria-label="Close">×</button>
//         <h2>Reset Password</h2>

//         {step === "email" && (
//           <form onSubmit={handleSendEmail}>
//             <p>Enter your email and we'll send you a reset link.</p>
//             <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
//           </form>
//         )}

//         {step === "reset" && (
//           <form onSubmit={handleResetPassword}>
//             <p>Enter the code from your email and your new password.</p>
//             <input type="text" placeholder="Reset code" value={token} onChange={(e) => setToken(e.target.value)} required />
//             <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
//             <button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
//           </form>
//         )}

//         {step === "done" && (
//           <div>
//             <p>✅ Password reset successfully!</p>
//             <button onClick={handleClose}>Close</button>
//           </div>
//         )}

//         {message && <p className={`forgotMsg forgotMsg--${msgType}`}>{message}</p>}
//       </div>
//     </div>
//   );
// }
