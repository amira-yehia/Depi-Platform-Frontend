import "../index.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo-container">
        <div className="logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z" />
          </svg>
        </div>
        <span className="logo-text">DEPI</span>
      </div>

      <ul className="nav-links">
        <li>الرئيسية</li>
        <li>عن المنصة</li>
        <li>الأسئلة الشائعة</li>
        <li>تواصل معنا</li>
      </ul>

      <div className="nav-actions">
        <button className="login-link">تسجيل الدخول</button>
        <button className="cta-button">ابدأ الآن</button>
      </div>
    </nav>
  );
};

export default Navbar;
