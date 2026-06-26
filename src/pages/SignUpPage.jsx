import { useState } from "react";
import { Link } from "react-router-dom";
import "./SignUpPage.css";
import { authService } from "../services/api";

const USER_TYPE_BY_ROLE = { freelancer: 1, client: 2 };

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") || parts[0] };
}

const roles = [
  { id: "freelancer", title: "Freelancer", subtitle: "Find jobs and grow your career", icon: "fa-solid fa-briefcase" },
  { id: "client", title: "Client", subtitle: "Hire talented freelancers", icon: "fa-solid fa-bullseye" },
];

const benefits = ["AI-powered job matching", "Profile analytics", "Secure payments", "24/7 support"];

function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState("freelancer");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", acceptedTerms: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("idle");

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("idle");

    try {
      const { firstName, lastName } = splitName(formData.fullName);
      await authService.register(
        formData.email,
        formData.password,
        firstName,
        lastName,
        USER_TYPE_BY_ROLE[selectedRole]
      );
      setStatusMessage("Account created successfully. You can sign in now.");
      setStatusType("success");
      setFormData({ fullName: "", email: "", password: "", acceptedTerms: false });
    } catch (error) {
      setStatusMessage(error.message || "Could not create account.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="signupPage">
      <div className="signupPage__logoWrap">
        <Link to="/"><img src="/images/logo.png" alt="NextHire logo" className="signupPage__logo" /></Link>
      </div>
      <section className="signupCard" aria-labelledby="signup-title">
        <header className="signupCard__header">
          <h1 id="signup-title">Create your account</h1>
          <p>Join thousands using AI-powered freelancing</p>
        </header>
        <form className="signupForm" onSubmit={handleSubmit}>
          <div>
            <p className="signupForm__label">Choose your role</p>
            <div className="signupRoleGrid">
              {roles.map((role) => (
                <button key={role.id} type="button"
                  className={`signupRoleCard ${selectedRole === role.id ? "is-active" : ""}`}
                  onClick={() => setSelectedRole(role.id)}>
                  <span className="signupRoleCard__icon"><i className={role.icon} aria-hidden="true" /></span>
                  <strong>{role.title}</strong>
                  <small>{role.subtitle}</small>
                </button>
              ))}
            </div>
          </div>
          <label className="signupField">
            <span>Full name</span>
            <div className="signupField__control">
              <i className="fa-regular fa-user" aria-hidden="true" />
              <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} required />
            </div>
          </label>
          <label className="signupField">
            <span>Email address</span>
            <div className="signupField__control">
              <i className="fa-regular fa-envelope" aria-hidden="true" />
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required />
            </div>
          </label>
          <label className="signupField">
            <span>Password</span>
            <div className="signupField__control">
              <i className="fa-solid fa-lock" aria-hidden="true" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Create a strong password" value={formData.password} onChange={handleInputChange} required />
              <button type="button" className="signupField__toggle" onClick={() => setShowPassword((c) => !c)} aria-label="Toggle password visibility">
                <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} aria-hidden="true" />
              </button>
            </div>
          </label>
          <label className="signupTerms">
            <input type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleInputChange} required />
            <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
          </label>
          <button type="submit" className="signupSubmit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
          {statusMessage ? (
            <p className={`signupStatus signupStatus--${statusType}`} role="status">{statusMessage}</p>
          ) : null}
        </form>
        <div className="signupBenefits">
          <h2>What you'll get:</h2>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}><i className="fa-regular fa-circle-check" aria-hidden="true" />{benefit}</li>
            ))}
          </ul>
        </div>
        <div className="signupDivider" />
        <p className="signupCard__footer">Already have an account? <Link to="/signin">Sign in</Link></p>
      </section>
    </main>
  );
}

export default SignUpPage;
