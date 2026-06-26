import { useEffect, useState } from "react";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";
import {
  authService,
  profilesService,
  skillsService,
  portfolioService,
  reviewsService,
} from "../services/api";

import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileAboutCard from "../components/ProfileAboutCard";
import ProfileSkillsCard from "../components/ProfileSkillsCard";
import ProfileFeaturedWorkCard from "../components/ProfileFeaturedWorkCard";
import ProfileBottomCta from "../components/ProfileBottomCta";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [apiSkills, setApiSkills] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [level, setLevel] = useState(1);
  const [years, setYears] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      authService.me().catch(() => null),
      profilesService.me().catch(() => null),
      skillsService
        .mySkills()
        .then((data) => {
          console.log("REAL API RESPONSE =", data);
          return data;
        })
        .catch((err) => {
          console.error("SKILL ERROR =", err);
          return [];
        }),
      portfolioService.my().catch(() => []),
      userId ? reviewsService.mine().catch(() => []) : Promise.resolve([]),
    ])
      .then(([user, profile, skills, portfolio, revs]) => {
        setUserData(user);
        setProfileData(profile);
        setApiSkills(Array.isArray(skills) ? skills : []);
        setPortfolioItems(Array.isArray(portfolio) ? portfolio : []);
        setReviews(Array.isArray(revs) ? revs : []);
        console.log("SKILLS =>", skills);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [userId]);
  // فتح نافذة إضافة Skill
  const handleAddSkill = async () => {
    setSearchText("");
    setSearchResults([]);
    setSelectedSkill(null);
    setLevel(1);
    setYears(1);
    setShowSkillModal(true);
  };

  // البحث عن Skill أثناء الكتابة
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await skillsService.search(searchText);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchText]);

  // ─────────────────────────────
  // ADD SKILL
  // ─────────────────────────────
  const submitSkill = async () => {
    if (!selectedSkill) return;

    try {
      // duplicate check (FIXED)
      const exists = apiSkills.some(
        (s) => s.skillId === selectedSkill.id || s.id === selectedSkill.id,
      );

      if (exists) {
        setError("Skill already exists");
        return;
      }

      await skillsService.addMySkill(selectedSkill.id, level, years);

      const updated = await skillsService.mySkills();
      setApiSkills(Array.isArray(updated) ? updated : []);

      setShowSkillModal(false);
      setSelectedSkill(null);
      setSearchText("");
      setSearchResults([]);
      setLevel(1);
      setYears(1);
      setError("");
    } catch (err) {
      console.error(err);

      if (err?.message?.includes("409")) {
        setError("Skill already exists");
        return;
      }

      setError("Failed to add skill");
    }
  };
  // DeleteSkill
  const handleDeleteSkill = async (skill) => {
    const old = apiSkills;

    // optimistic update
    setApiSkills((prev) => prev.filter((s) => s.skillId !== skill.skillId));

    try {
      await skillsService.deleteMySkill(skill.skillId);
    } catch (err) {
      console.error(err);

      // rollback
      setApiSkills(old);
    }
  };
  function handleReturn() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/dashboard");
  }
  // chips;
  const storedName = localStorage.getItem("authUserName");

  const fullName = userData
    ? [userData.firstName, userData.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      userData.fullName ||
      storedName ||
      "User"
    : storedName || "User";

  const avgRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      ).toFixed(2)
    : "N/A";

  const profileCompletion = Math.min(
    100,
    (profileData?.bio ? 20 : 0) +
      (profileData?.title ? 20 : 0) +
      (userData?.profileImageUrl ? 15 : 0) +
      (userData?.isEmailVerified ? 15 : 0) +
      Math.min(apiSkills.length * 10, 15) +
      Math.min(portfolioItems.length * 15, 15),
  );

  const profile = {
    avatarUrl:
      userData?.profileImageUrl ||
      profileData?.profileImageUrl ||
      "/images/shadow-avatar.svg",

    name: fullName,

    verified: userData?.isEmailVerified || false,

    roleTitle: profileData?.title || "Freelancer",

    availableText: profileData?.isAvailable ? "Available now" : "Not available",

    profileScore: profileCompletion,

    github: profileData?.githubUrl || "",
    linkedin: profileData?.linkedInUrl || "",
    website: profileData?.websiteUrl || "",

    metaRow: [
      profileData?.country && {
        icon: "fas fa-map-marker-alt",
        text: profileData.country,
      },
    ].filter(Boolean),

    actions: {
      hireText: "Hire Now",
    },

    tabs: [
      { label: "Overview" },
      { label: `Portfolio (${portfolioItems.length})` },
      { label: `Reviews (${reviews.length})` },
    ],

    activeTab: "Overview",

    scoreCard: {
      headerText: "AI PROFILE SCORE",

      percent: profileCompletion,

      label: "PROFILE",

      topText: "Complete your profile to improve your score",

      bars: [
        {
          icon: "fas fa-tools",
          title: "Skills",
          value: Math.min(apiSkills.length * 10, 100),
        },

        {
          icon: "fas fa-briefcase",
          title: "Portfolio",
          value: Math.min(portfolioItems.length * 20, 100),
        },

        {
          icon: "fas fa-star",
          title: "Reviews",
          value: Math.min(reviews.length * 15, 100),
        },
      ],
    },

    stats: [
      {
        icon: "fas fa-star",
        value: avgRating,
        title: "RATING",
        sub: `${reviews.length} reviews`,
      },

      {
        icon: "fas fa-file",
        value: String(portfolioItems.length),
        title: "PROJECTS",
        sub: "completed",
      },

      {
        icon: "fas fa-tools",
        value: String(apiSkills.length),
        title: "SKILLS",
        sub: "added",
      },

      {
        icon: "fas fa-check-circle",
        value: userData?.isEmailVerified ? "Yes" : "No",
        title: "VERIFIED",
        sub: "email",
      },
    ],

    hourlyRate: {
      rate: profileData?.hourlyRate ? String(profileData.hourlyRate) : "--",

      responseTime: profileData?.responseTime || "--",

      memberSince: userData?.createdAt
        ? new Date(userData.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "--",

      languages: profileData?.languages?.join(", ") || "--",
    },

    sendMessageLabel: "Send Message",

    about: {
      title: "About",

      description: profileData?.bio || "No bio yet.",

      description2: "",
    },

    skills: {
      title: "Skills & Expertise",
      subtitle: "Your added skills",

      chips: apiSkills.map((s) => ({
        id: s.id,
        skillId: s.skillId,
        name: s.skillName,
        level: s.proficiencyLevel,
        years: s.yearsOfExperience,
      })),

      onAdd: handleAddSkill,
      onDelete: handleDeleteSkill,
    },
    featuredWork: {
      title: "Portfolio",

      subtitle: "Your recent work",

      rightLinkText: "",

      items: portfolioItems.slice(0, 6).map((item) => ({
        pillLabel: "Project",

        imageUrl: item.imageUrl || "/images/profile1.jpg",

        title: item.title,

        description: item.description || "",

        tags: [],

        liveUrl: item.liveUrl || item.url,
      })),
    },

    bottomCta: {
      title: `Work with ${fullName.split(" ")[0]}?`,

      subtitle: profileData?.isAvailable
        ? "Available for new projects now."
        : "Currently not available.",

      buttonText: "Hire Now",
    },
  };
  if (error) {
    return (
      <div
        className="profilePage"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: "#ff6b6b",
        }}
      >
        {error}
      </div>
    );
  }
  if (loading) {
    return (
      <div
        className="profilePage"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  storedName;
  console.log("API SKILLS:", apiSkills);

  console.log(
    "CHIPS:",
    apiSkills.map((s) => ({
      id: s.skillId || s.id,
      name: s.skillName || s.nameEn || s.name,
      level: s.proficiencyLevel,
    })),
  );
  return (
    <div className="profilePage">
      <div className="profilePage__topActions">
        <button
          type="button"
          className="profilePage__backBtn"
          onClick={handleReturn}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Return
        </button>
      </div>

      <ProfileHeader profile={profile} />

      {/* SKILLS MODAL */}
      {showSkillModal && (
        <div className="skillModalOverlay">
          <div className="skillModal">
            <h2>Add Skill</h2>

            {error && <div className="error">{error}</div>}

            <input
              type="text"
              placeholder="Search skill..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="skillInput"
            />

            <div className="skillResults">
              {searchResults.map((skill) => (
                <button
                  key={skill.id}
                  className={
                    selectedSkill?.id === skill.id
                      ? "skillItem active"
                      : "skillItem"
                  }
                  onClick={() => setSelectedSkill(skill)}
                >
                  {skill.nameEn || skill.name}
                </button>
              ))}
            </div>

            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="skillInput"
            >
              <option value={0}>Beginner</option>
              <option value={1}>Intermediate</option>
              <option value={2}>Advanced</option>
              <option value={3}>Expert</option>
            </select>

            <input
              type="number"
              min="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="skillInput"
              placeholder="Years of experience"
            />

            <div className="skillActions">
              <button
                onClick={() => setShowSkillModal(false)}
                className="cancelBtn"
              >
                Cancel
              </button>

              <button
                onClick={submitSkill}
                className="saveBtn"
                disabled={!selectedSkill}
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="profilePage__contentWrap">
        <div className="profilePage__layout">
          <aside className="profilePage__sidebar">
            <ProfileSidebar profile={profile} />
          </aside>
          <main className="profilePage__main">
            <ProfileTabs tabs={profile.tabs} active={profile.activeTab} />
            <div className="profilePage__cards">
              <ProfileAboutCard about={profile.about} />
              <ProfileSkillsCard skills={profile.skills} />
              <ProfileFeaturedWorkCard work={profile.featuredWork} />
            </div>
          </main>
        </div>
      </div>

      <ProfileBottomCta cta={profile.bottomCta} />
    </div>
  );
}
