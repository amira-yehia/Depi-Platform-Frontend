import { Link } from "react-router-dom";

import NavbarComponent from "../components/NavbarComponent";
import FeatureCard from "../components/FeatureCard";
import FeatureSection from "../components/FeatureSection";

import "./LandingPage.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const freelancerSteps = [
  { title: "Register", subtitle: "Create your account", icon: "fa-regular fa-user" },
  { title: "Build Profile", subtitle: "Showcase your skills", icon: "fa-regular fa-file-lines" },
  { title: "Get AI Score", subtitle: "Receive match rating", icon: "fa-solid fa-bullseye" },
  { title: "Apply", subtitle: "Submit proposals", icon: "fa-regular fa-paper-plane" },
  { title: "Get Paid", subtitle: "Secure payments", icon: "fa-solid fa-dollar-sign" },
];

const clientSteps = [
  { title: "Post Job", subtitle: "Describe your needs", icon: "fa-regular fa-briefcase" },
  { title: "AI Matches", subtitle: "Instant recommendations", icon: "fa-solid fa-bullseye" },
  { title: "Review", subtitle: "Check candidates", icon: "fa-solid fa-users" },
  { title: "Hire", subtitle: "Select the best fit", icon: "fa-solid fa-check" },
  { title: "Pay", subtitle: "Secure milestone", icon: "fa-solid fa-dollar-sign" },
];

const skillBars = [
  { label: "Skills", value: 85 },
  { label: "Skills", value: 92 },
  { label: "Skills", value: 78 },
  { label: "Skills", value: 96 },
];

// ─── How It Works sub-components ─────────────────────────────────────────────

function StepColumn({ title, icon, steps, variant }) {
  return (
    <div className="howColumn">
      <div className={`howColumn__badge howColumn__badge--${variant}`}>
        <i className={icon} aria-hidden="true" />
        <span>{title}</span>
      </div>

      <div className="howColumn__steps">
        {steps.map((step, index) => (
          <div className="howStep" key={step.title}>
            <div className="howStep__icon">
              <i className={step.icon} aria-hidden="true" />
            </div>
            <span className="howStep__number">{index + 1}</span>
            <div>
              <h4>{step.title}</h4>
              <p>{step.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Intelligence sub-components ──────────────────────────────────────────

function MatchScoreCard() {
  return (
    <div className="aiCard">
      <h3 className="aiCard__title">Match Score</h3>
      <div className="aiCard__score">95%</div>
      <div className="aiCard__progressBar">
        <div
          className="aiCard__progressFill aiCard__progressFill--orange"
          style={{ width: "95%" }}
        />
      </div>
      <p className="aiCard__desc">
        Perfect match for this role based on skills and experience
      </p>
    </div>
  );
}

function ProfileScoreCard() {
  return (
    <div className="aiCard">
      <h3 className="aiCard__title">Profile Score</h3>
      <div className="aiCard__skillBars">
        {skillBars.map((bar, i) => (
          <div className="aiSkillBar" key={i}>
            <span className="aiSkillBar__label">{bar.label}</span>
            <div className="aiSkillBar__track">
              <div
                className="aiSkillBar__fill"
                style={{ width: `${bar.value}%` }}
              />
            </div>
            <span className="aiSkillBar__value">{bar.value}%</span>
          </div>
        ))}
      </div>
      <p className="aiCard__desc">Improve your score to get more visibility</p>
    </div>
  );
}

function PricePredictionCard() {
  return (
    <div className="aiCard">
      <h3 className="aiCard__title">Price Prediction</h3>
      <p className="aiCard__suggestedLabel">Suggested Rate</p>
      <div className="aiCard__rate">
        <span className="aiCard__rateBig">$85</span>
        <span className="aiCard__rateUnit">/hr</span>
      </div>
      <div className="aiCard__priceBreakdown">
        <div className="aiPriceRow">
          <span className="aiPriceRow__label">Market Average</span>
          <span className="aiPriceRow__value aiPriceRow__value--muted">$72/hr</span>
        </div>
        <div className="aiPriceRow">
          <span className="aiPriceRow__label">Your Experience</span>
          <span className="aiPriceRow__value aiPriceRow__value--orange">+18%</span>
        </div>
        <div className="aiPriceRow">
          <span className="aiPriceRow__label">Skill Premium</span>
          <span className="aiPriceRow__value aiPriceRow__value--blue">+12%</span>
        </div>
      </div>
      <p className="aiCard__desc">
        AI-calculated based on your profile and market data
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function LandingPage() {
  return (
    <div className="landingPage">
      <NavbarComponent />

      {/* Hero section */}
      <section className="landingHero">
        <div className="landingHero__content">
          <h1>
            Find Work Smarter,
            <span> Not Harder</span>
          </h1>

          <p>
            Smart matches, better future. Let AI connect you with the perfect
            opportunities.
          </p>

          <div className="landingHero__actions">
            <Link to="/signup" className="nh-btn nh-btn--orange">
              Get Started
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>

            <Link to="/dashboard" className="nh-btn nh-btn--outline">
              Explore Jobs
            </Link>
          </div>

          <div className="landingHero__orbit" aria-label="AI matching flow">
            <div className="orbitCircle orbitCircle--left">Talent</div>
            <div className="orbitCircle orbitCircle--center">AI Match</div>
            <div className="orbitCircle orbitCircle--right">Jobs</div>
          </div>
        </div>
      </section>

      {/* Why choose section */}
      <section id="features" className="landingSection">
        <div className="landingSection__header">
          <h2>
            Why Choose <span>NextHire?</span>
          </h2>
          <p>Powered by cutting-edge AI technology to revolutionize freelancing.</p>
        </div>

        <FeatureSection>
          <FeatureCard icon="fa-solid fa-brain" title="AI Matching System">
            Our intelligent algorithm analyzes skills, experience, and preferences to
            connect you with perfect opportunities.
          </FeatureCard>

          <FeatureCard icon="fa-solid fa-arrow-trend-up" title="Smart Profile Score">
            Get real-time feedback on your profile strength and personalized
            tips to boost your visibility.
            Get real-time feedback on your profile strength and personalized tips to
            boost your visibility.
          </FeatureCard>

          <FeatureCard icon="fa-solid fa-bolt" title="Fast Hiring for Clients">
            Post a job and get matched with pre-vetted talent in minutes, not days.
          </FeatureCard>
        </FeatureSection>

        <div id="ai-technology" className="careerCard">
          <div className="careerCard__icon">
            <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
          </div>
          <div>
            <h3>Career Path</h3>
            <p>
              Access curated learning resources to upskill and unlock better
              opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="landingSection landingHow">
        <div className="landingSection__header">
          <h2>
            How It <span>Works</span>
          </h2>
          <p>Simple steps to success for freelancers and clients.</p>
        </div>

        <div className="landingHow__grid">
          <StepColumn
            title="For Freelancer"
            icon="fa-regular fa-user"
            steps={freelancerSteps}
            variant="orange"
          />
          <StepColumn
            title="For Clients"
            icon="fa-regular fa-briefcase"
            steps={clientSteps}
            variant="blue"
          />
        </div>
      </section>

      {/* AI Intelligence section — last section */}
      <section id="ai-intelligence" className="aiSection">
        <div className="aiSection__header">
          <h2>
            AI-Powered <span>Intelligence</span>
          </h2>
          <p>
            Advanced algorithms working behind the scenes to optimize your
            success
          </p>
        </div>

        <div className="aiSection__grid">
          <MatchScoreCard />
          <ProfileScoreCard />
          <PricePredictionCard />
        </div>
      </section>

    </div>
  );
}

export default LandingPage;