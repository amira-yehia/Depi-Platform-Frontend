import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";
import { authService } from "../services/api";

// Supports two modes:
// 1. Modal mode: isOpen/onClose props passed from sidebar
// 2. Page mode: no props (standalone route)

export default function ChangePassword({ isOpen, onClose } = {}) {
  const isModal = isOpen !== undefined;
  const navigate = useNavigate();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("idle");

  if (isModal && !isOpen) return null;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage("New passwords do not match.");
      setMsgType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await authService.changePassword(form.currentPassword, form.newPassword);
      setMessage("Password changed successfully!");
      setMsgType("success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      if (!isModal) setTimeout(() => navigate("/dashboard"), 1500);
      else setTimeout(() => { onClose(); }, 1200);
    } catch (err) {
      setMessage(err.message || "Failed to change password.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  const inner = (
    <div className="changePwCard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Change Password</h1>
        {isModal && (
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", color: "#aaa", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Current Password
          <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required />
        </label>
        <label>
          New Password
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required />
        </label>
        <label>
          Confirm New Password
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Saving..." : "Change Password"}</button>
        {message && <p className={`changePwMsg changePwMsg--${msgType}`}>{message}</p>}
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="changePwOverlay" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>{inner}</div>
      </div>
    );
  }

  return <div className="changePwPage">{inner}</div>;
}
