import "../index.css";
import MainLayout from "./MainLayout";

const Home = () => {
  return (
    <div className="home-container">
      <MainLayout />
      <main className="hero-section">
        <div className="badge">
          <span>✨</span>
          مبادرة رواد مصر الرقمية
        </div>

        <h1 className="main-title">DEPI Platform</h1>
        <h2 className="sub-title">منصة العمل الحر الذكية</h2>

        <p className="description">
          نربط خريجي مبادرة رواد مصر الرقمية بفرص العمل الحر من خلال نظام مطابقة
          ذكي وملفات شخصية احترافية.
        </p>

        <div className="hero-btns">
          <button className="primary-btn">ابدأ الآن ←</button>
          <button className="secondary-btn">👤 تصفح المواهب</button>
        </div>

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-item">
            <h3>+2,800</h3>
            <p>خريج مسجل</p>
          </div>
          <div className="stat-item">
            <h3>+1,200</h3>
            <p>مشروع منجز</p>
          </div>
          <div className="stat-item highlight">
            <h3>96%</h3>
            <p>نسبة النجاح</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
