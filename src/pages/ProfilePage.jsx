import { useEffect, useState, useMemo } from "react";
import "./ProfilePage.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  authService,
  profilesService,
  skillsService,
  portfolioService,
  reviewsService,
  mediaService,
  countriesService,
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
  const { userId: urlUserId } = useParams();
  // ── Active tab ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("Overview");

  // ── Stable values (don't recompute every render) ─────────────
  const [currentUserId] = useState(() => localStorage.getItem("userId"));
  const viewingOtherProfile = Boolean(urlUserId && urlUserId !== currentUserId);

  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [apiSkills, setApiSkills] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Review form ──────────────────────────────────────────────
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewType, setReviewType] = useState(1);
  const [reviewProjectId, setReviewProjectId] = useState("");
  const [reviewContractId, setReviewContractId] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewResponses, setReviewResponses] = useState({});
  const [responseSubmitting, setResponseSubmitting] = useState({});
  const [responseError, setResponseError] = useState({});
  const [responseSuccess, setResponseSuccess] = useState({});
  const [reviewDeleting, setReviewDeleting] = useState({});

  // ── Skill Modal ──────────────────────────────────────────────
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [level, setLevel] = useState(1);
  const [years, setYears] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [skillError, setSkillError] = useState("");

  // ── Profile Edit Modal ───────────────────────────────────────
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    title: "",
    bio: "",
    hourlyRate: "",
    countryId: "",
    linkedInUrl: "",
    portfolioUrl: "",
    githubUrl: "",
    websiteUrl: "",
    gender: "",
    birthDate: "",
    phoneNumber: "",
    address: "",
    profileImageUrl: "",
    preferredCategoryId: "",
    isAvailable: false,
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileFormError, setProfileFormError] = useState("");
  const [profileFormMessage, setProfileFormMessage] = useState("");

  // ── Countries list for dropdown ──────────────────────────────
  const [countries, setCountries] = useState([]);

  // ── Portfolio Modal ──────────────────────────────────────────
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null); // null = add, obj = edit
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    url: "",
    liveUrl: "",
  });
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false);
  const [portfolioFormError, setPortfolioFormError] = useState("");

  // ────────────────────────────────────────────────────────────
  const buildProfileForm = (profile) => ({
    displayName: profile?.displayName || "",
    title: profile?.title || "",
    bio: profile?.bio || "",
    hourlyRate:
      typeof profile?.hourlyRate === "number" && profile.hourlyRate > 0
        ? profile.hourlyRate
        : "",
    countryId: profile?.countryId || "",
    linkedInUrl: profile?.linkedInUrl || "",
    portfolioUrl: profile?.portfolioUrl || "",
    githubUrl: profile?.githubUrl || "",
    websiteUrl: profile?.websiteUrl || "",
    gender:
      typeof profile?.gender === "number" && profile.gender > 0
        ? profile.gender
        : "",
    birthDate: profile?.birthDate || "",
    phoneNumber: profile?.phoneNumber || "",
    address: profile?.address || "",
    profileImageUrl: profile?.profileImageUrl || "",
    preferredCategoryId: profile?.preferredCategoryId || "",
    isAvailable:
      typeof profile?.isAvailable === "boolean" ? profile.isAvailable : false,
  });

  // ── Load Data ────────────────────────────────────────────────
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        let user = null;
        let profile = null;

        if (viewingOtherProfile) {
          profile = await profilesService.get(urlUserId).catch((err) => {
            if (err?.status === 404 || err?.status === 400) return null;
            throw err;
          });
          if (!profile) {
            setError("Profile not found");
            return;
          }
        } else {
          const [authUser, existingProfile] = await Promise.all([
            authService.me().catch(() => null),
            profilesService.me().catch((err) => {
              if (
                err?.status === 404 ||
                err?.status === 400 ||
                /not found/i.test(err?.message || "")
              )
                return null;
              throw err;
            }),
          ]);
          user = authUser;
          profile = existingProfile;

          if (!profile) {
            const fallbackName =
              [user?.firstName, user?.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || "Freelancer";
            profile = await profilesService
              .create({
                displayName: fallbackName,
                title: "Freelancer",
                bio: "Tell clients about your skills and experience.",
                hourlyRate: 0,
                currencyId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              })
              .catch(() => null);
          }
        }

        setUserData(user);
        setProfileData(profile);
        setProfileForm(buildProfileForm(profile));
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    const loadDetailData = async () => {
      try {
        // ── Portfolio: own vs other ──────────────────────────
        const portfolioPromise = viewingOtherProfile
          ? portfolioService.get(urlUserId).catch(() => []) // GET /api/Portfolio/{userId}
          : portfolioService.my().catch(() => []); // GET /api/Portfolio/my

        // ── Reviews: own vs other ────────────────────────────
        const reviewsPromise = viewingOtherProfile
          ? reviewsService.forUser(urlUserId).catch(() => []) // GET /api/Reviews/user/{userId}
          : currentUserId
            ? reviewsService.mine().catch(() => []) // GET /api/Reviews/me
            : Promise.resolve([]);

        const [skills, portfolio, revs] = await Promise.all([
          viewingOtherProfile
            ? Promise.resolve([]) // don't load other's private skills
            : skillsService.mySkills().catch(() => []), // GET /api/freelancer-skills
          portfolioPromise,
          reviewsPromise,
        ]);

        setApiSkills(Array.isArray(skills) ? skills : []);
        setPortfolioItems(Array.isArray(portfolio) ? portfolio : []);
        setReviews(Array.isArray(revs) ? revs : []);
      } catch (err) {
        console.error(err);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadProfileData();
    loadDetailData();
  }, [urlUserId, currentUserId]);

  // ── Fetch countries once for dropdown ───────────────────────
  useEffect(() => {
    countriesService
      .list()
      .then((data) => setCountries(Array.isArray(data) ? data : []))
      .catch(() => setCountries([]));
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showProfileModal || showSkillModal || showPortfolioModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    return undefined;
  }, [showProfileModal, showSkillModal, showPortfolioModal]);

  // ── Profile Modal handlers ───────────────────────────────────
  const openProfileModal = () => {
    setProfileFormError("");
    setProfileFormMessage("");
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileFormError("");
    setProfileFormMessage("");
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarFileChange = async (file) => {
    if (!file) return;
    setProfileImageFile(file);
    try {
      const data = await mediaService.uploadAvatar(file);
      if (data?.imageUrl || data?.url) {
        setProfileForm((prev) => ({
          ...prev,
          profileImageUrl: data.imageUrl || data.url,
        }));
      }
    } catch (err) {
      console.error("AVATAR UPLOAD ERROR", err);
      setProfileFormError("Failed to upload avatar. Please try again.");
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault?.();
    setProfileFormError("");
    setProfileFormMessage("");
    setProfileSubmitting(true);
    try {
      const baseProfile = profileData || {};
      const payload = {
        ...baseProfile,
        ...profileForm,
        displayName:
          profileForm.displayName?.trim() || baseProfile.displayName || "",
        title: profileForm.title?.trim() || baseProfile.title || "",
        bio: profileForm.bio?.trim() || baseProfile.bio || "",
        address: profileForm.address?.trim() || "",
        phoneNumber: profileForm.phoneNumber?.trim() || "",
        linkedInUrl: profileForm.linkedInUrl?.trim() || "",
        portfolioUrl: profileForm.portfolioUrl?.trim() || "",
        githubUrl: profileForm.githubUrl?.trim() || "",
        websiteUrl: profileForm.websiteUrl?.trim() || "",
      };

      payload.hourlyRate =
        payload.hourlyRate === "" || payload.hourlyRate == null
          ? (baseProfile.hourlyRate ?? 0)
          : Number(payload.hourlyRate);

      payload.gender =
        payload.gender === "" || payload.gender == null
          ? (baseProfile.gender ?? null)
          : Number(payload.gender);

      if (!payload.countryId) delete payload.countryId;
      if (!payload.preferredCategoryId) delete payload.preferredCategoryId;
      if (!payload.birthDate) delete payload.birthDate;
      // Keep profileImageUrl if already set from avatar upload
      if (!payload.profileImageUrl && !profileImageFile)
        delete payload.profileImageUrl;
      if (!payload.currencyId)
        payload.currencyId =
          baseProfile.currencyId || "3fa85f64-5717-4562-b3fc-2c963f66afa6";

      if (profileImageFile && !payload.profileImageUrl) {
        const data = await mediaService.uploadAvatar(profileImageFile);
        const newUrl = data?.imageUrl || data?.url;
        if (newUrl) {
          payload.profileImageUrl = newUrl;
          // Also call set-avatar to link it to the profile
          await mediaService.setAvatar(newUrl).catch(() => null);
        }
      }

      const updatedProfile = await profilesService.update(payload); // PUT /api/Profiles/me
      // Re-fetch to get latest from server (small delay in case server needs to commit)
      await new Promise((r) => setTimeout(r, 300));
      const refreshedProfile = await profilesService.me().catch(() => null);
      // Priority: fresh GET > PUT response > merge payload into existing data
      const nextProfile = {
        ...baseProfile,
        ...payload,
        ...(updatedProfile || {}),
        ...(refreshedProfile || {}),
      };
      console.log("AFTER SAVE — nextProfile:", nextProfile);
      setProfileData({ ...nextProfile });
      setProfileForm(buildProfileForm(nextProfile));
      setProfileFormMessage("Profile updated successfully! ✓");
      // Close modal after short delay so user sees success
      setTimeout(() => closeProfileModal(), 1200);
    } catch (err) {
      console.error("PROFILE UPDATE ERROR", err);
      setProfileFormError(err.message || "Failed to update profile.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  // ── Skill handlers ───────────────────────────────────────────
  const handleAddSkill = () => {
    setSearchText("");
    setSearchResults([]);
    setSelectedSkill(null);
    setLevel(1);
    setYears(1);
    setSkillError("");
    setShowSkillModal(true);
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await skillsService.search(searchText);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const submitSkill = async () => {
    if (!selectedSkill) return;
    try {
      const exists = apiSkills.some(
        (s) => s.skillId === selectedSkill.id || s.id === selectedSkill.id,
      );
      if (exists) {
        setSkillError("Skill already added");
        return;
      }
      await skillsService.addMySkill(selectedSkill.id, level, years); // POST /api/freelancer-skills
      const updated = await skillsService.mySkills();
      setApiSkills(Array.isArray(updated) ? updated : []);
      setShowSkillModal(false);
    } catch (err) {
      setSkillError(
        err?.message?.includes("409")
          ? "Skill already added"
          : "Failed to add skill",
      );
    }
  };

  const handleDeleteSkill = async (skill) => {
    const old = apiSkills;
    setApiSkills((prev) => prev.filter((s) => s.skillId !== skill.skillId));
    try {
      await skillsService.deleteMySkill(skill.skillId); // DELETE /api/freelancer-skills/{id}
    } catch (err) {
      console.error(err);
      setApiSkills(old);
    }
  };

  // ── Portfolio handlers ───────────────────────────────────────
  const openAddPortfolio = () => {
    setEditingPortfolioItem(null);
    setPortfolioForm({ title: "", description: "", url: "", liveUrl: "" });
    setPortfolioFormError("");
    setShowPortfolioModal(true);
  };

  const openEditPortfolio = (item) => {
    setEditingPortfolioItem(item);
    setPortfolioForm({
      title: item.title || "",
      description: item.description || "",
      url: item.url || "",
      liveUrl: item.liveUrl || "",
    });
    setPortfolioFormError("");
    setShowPortfolioModal(true);
  };

  const closePortfolioModal = () => {
    setShowPortfolioModal(false);
    setPortfolioFormError("");
  };

  const handleSavePortfolio = async (e) => {
    e?.preventDefault?.();
    if (!portfolioForm.title.trim()) {
      setPortfolioFormError("Title is required");
      return;
    }
    setPortfolioSubmitting(true);
    setPortfolioFormError("");
    try {
      if (editingPortfolioItem) {
        await portfolioService.update(editingPortfolioItem.id, portfolioForm); // PUT /api/Portfolio/{id}
      } else {
        await portfolioService.create(portfolioForm); // POST /api/Portfolio
      }
      const updated = await portfolioService.my();
      setPortfolioItems(Array.isArray(updated) ? updated : []);
      closePortfolioModal();
    } catch (err) {
      setPortfolioFormError(err.message || "Failed to save portfolio item.");
    } finally {
      setPortfolioSubmitting(false);
    }
  };

  const handleDeletePortfolio = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    const old = portfolioItems;
    setPortfolioItems((prev) => prev.filter((p) => p.id !== item.id));
    try {
      await portfolioService.delete(item.id); // DELETE /api/Portfolio/{id}
    } catch (err) {
      console.error(err);
      setPortfolioItems(old);
    }
  };
  const handlePublishPortfolio = async (id) => {
    try {
      await portfolioService.publish(id);
      const updated = await portfolioService.my();
      setPortfolioItems(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(err);
      alert("Failed to publish portfolio");
    }
  };

  const handleUnpublishPortfolio = async (id) => {
    try {
      await portfolioService.unpublish(id);
      const updated = await portfolioService.my();
      setPortfolioItems(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(err);
      alert("Failed to unpublish portfolio");
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await portfolioService.toggleFeatured(id);
      const updated = await portfolioService.my();
      setPortfolioItems(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(err);
      alert("Failed to update featured status");
    }
  };

  const submitReview = async () => {
    if (!reviewComment.trim()) {
      setReviewError("Comment is required");
      setReviewSuccess("");
      return;
    }

    setReviewError("");
    setReviewSuccess("");
    setReviewSubmitting(true);

    try {
      const revieweeId = urlUserId || profileData?.id;
      if (!revieweeId) {
        throw new Error("Review recipient is not available.");
      }

      const payload = {
        revieweeId,
        rating: reviewRating,
        comment: reviewComment.trim(),
        type: Number(reviewType),
        ...(reviewProjectId.trim() ? { projectId: reviewProjectId.trim() } : {}),
        ...(reviewContractId.trim()
          ? { contractId: reviewContractId.trim() }
          : {}),
      };

      let createdReview = null;
      try {
        createdReview = await reviewsService.create(payload);
      } catch (err) {
        if (err?.status !== 404) {
          throw err;
        }
      }

      if (createdReview) {
        const updatedReviews = viewingOtherProfile
          ? await reviewsService.forUser(revieweeId)
          : await reviewsService.mine();

        if (Array.isArray(updatedReviews)) {
          setReviews(updatedReviews);
        } else {
          const reviewerName =
            userData?.fullName ||
            localStorage.getItem("authUserName") ||
            localStorage.getItem("authEmail") ||
            "You";
          const newReview = {
            id: createdReview?.id || `local-${Date.now()}`,
            reviewerName,
            rating: reviewRating,
            comment: reviewComment.trim(),
            createdAt: new Date().toISOString(),
          };
          setReviews((prev) => [newReview, ...(Array.isArray(prev) ? prev : [])]);
        }
      } else {
        const reviewerName =
          userData?.fullName ||
          localStorage.getItem("authUserName") ||
          localStorage.getItem("authEmail") ||
          "You";
        const newReview = {
          id: `local-${Date.now()}`,
          reviewerName,
          rating: reviewRating,
          comment: reviewComment.trim(),
          createdAt: new Date().toISOString(),
        };
        setReviews((prev) => [newReview, ...(Array.isArray(prev) ? prev : [])]);
      }
      setReviewSuccess("Review submitted successfully.");
      setReviewComment("");
      setReviewRating(5);
      setReviewType(1);
      setReviewProjectId("");
      setReviewContractId("");
    } catch (err) {
      console.error("REVIEW SUBMIT ERROR", err);
      setReviewError(err.message || "Failed to submit review.");
      setReviewSuccess("");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewResponseChange = (reviewId, value) => {
    setReviewResponses((prev) => ({ ...prev, [reviewId]: value }));
  };

  const submitReviewResponse = async (reviewId) => {
    const responseText = (reviewResponses[reviewId] || "").trim();
    if (!responseText) {
      setResponseError((prev) => ({
        ...prev,
        [reviewId]: "Response cannot be empty.",
      }));
      setResponseSuccess((prev) => ({ ...prev, [reviewId]: "" }));
      return;
    }

    setResponseError((prev) => ({ ...prev, [reviewId]: "" }));
    setResponseSuccess((prev) => ({ ...prev, [reviewId]: "" }));
    setResponseSubmitting((prev) => ({ ...prev, [reviewId]: true }));

    try {
      if (!reviewId) {
        throw new Error("Unable to determine the review ID.");
      }

      await reviewsService.respond(reviewId, responseText);
      setResponseSuccess((prev) => ({
        ...prev,
        [reviewId]: "Response sent successfully.",
      }));
      setReviewResponses((prev) => ({ ...prev, [reviewId]: "" }));

      const revieweeId = urlUserId || profileData?.id;
      const updatedReviews = viewingOtherProfile
        ? await reviewsService.forUser(revieweeId)
        : await reviewsService.mine();
      setReviews(Array.isArray(updatedReviews) ? updatedReviews : []);
    } catch (err) {
      console.error("REVIEW RESPONSE ERROR", err);
      setResponseError((prev) => ({
        ...prev,
        [reviewId]: err.message || "Failed to send response.",
      }));
    } finally {
      setResponseSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const deleteReview = async (reviewId) => {
    if (!reviewId) return;
    setReviewDeleting((prev) => ({ ...prev, [reviewId]: true }));

    try {
      await reviewsService.delete(reviewId);
      const revieweeId = urlUserId || profileData?.id;
      const updatedReviews = viewingOtherProfile
        ? await reviewsService.forUser(revieweeId)
        : await reviewsService.mine();
      setReviews(Array.isArray(updatedReviews) ? updatedReviews : []);
    } catch (err) {
      console.error("REVIEW DELETE ERROR", err);
    } finally {
      setReviewDeleting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const formatUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const t = url.trim();
    return t.startsWith("http://") || t.startsWith("https://")
      ? t
      : `https://${t}`;
  };

  // Helper to build full image URL
  const buildImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://depiplatform.runasp.net${url}`;
  };

  const avatarUrl =
    buildImageUrl(profileData?.profileImageUrl) ||
    buildImageUrl(userData?.profileImageUrl) ||
    "/images/shadow-avatar.svg";
  const storedName = localStorage.getItem("authUserName");

  const fullName =
    profileData?.displayName?.trim() ||
    (userData
      ? [userData.firstName, userData.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || userData.fullName
      : null) ||
    storedName ||
    "User";

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

  // ── Profile object wrapped in useMemo ────────────────────────
  const profile = useMemo(
    () => ({
      avatarUrl: avatarUrl,
      name: fullName,
      verified: userData?.isEmailVerified || false,
      roleTitle: profileData?.title || "Freelancer",
      availableText: profileData?.isAvailable
        ? "Available now"
        : "Not available",
      profileScore: profileCompletion,
      github: profileData?.githubUrl || "",
      linkedin: profileData?.linkedInUrl || "",
      website: profileData?.websiteUrl || "",
      contactItems: [
        profileData?.phoneNumber && {
          icon: "fas fa-phone",
          text: profileData.phoneNumber,
        },
        profileData?.address && {
          icon: "fas fa-map-marker-alt",
          text: profileData.address,
        },
      ].filter(Boolean),
      metaRow: [
        {
          icon: "fab fa-linkedin-in",
          url: profileData?.linkedInUrl
            ? formatUrl(profileData.linkedInUrl)
            : null,
          ariaLabel: "Open LinkedIn profile",
          isSocial: true,
          disabled: !profileData?.linkedInUrl,
          disabledMessage: "Please enter a LinkedIn link",
        },
        {
          icon: "fab fa-github",
          url: profileData?.githubUrl ? formatUrl(profileData.githubUrl) : null,
          ariaLabel: "Open GitHub profile",
          isSocial: true,
          disabled: !profileData?.githubUrl,
          disabledMessage: "Please enter a GitHub link",
        },
      ],
      actions: { hireText: "Hire Now" },
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
        onAdd: viewingOtherProfile ? null : handleAddSkill,
        onDelete: viewingOtherProfile ? null : handleDeleteSkill,
      },
      featuredWork: {
        title: "Portfolio",
        subtitle: viewingOtherProfile
          ? "Their recent work"
          : "Your recent work",
        rightLinkText: "",
        items: portfolioItems.slice(0, 6).map((item) => ({
          id: item.id,
          pillLabel: item.isFeatured ? "Featured" : "Project",
          imageUrl: item.imageUrl || "/images/profile1.jpg",
          title: item.title,
          description: item.description || "",
          tags: [],
          liveUrl: item.liveUrl || item.url,

          isPublished: item.isPublished,
          isFeatured: item.isFeatured,

          onEdit: viewingOtherProfile ? null : () => openEditPortfolio(item),

          onDelete: viewingOtherProfile
            ? null
            : () => handleDeletePortfolio(item),

          onPublish: viewingOtherProfile
            ? null
            : () => handlePublishPortfolio(item.id),

          onUnpublish: viewingOtherProfile
            ? null
            : () => handleUnpublishPortfolio(item.id),

          onFeature: viewingOtherProfile
            ? null
            : () => handleToggleFeatured(item.id),
        })),
        // Add button only for own profile
        onAdd: viewingOtherProfile ? null : openAddPortfolio,
      },
      bottomCta: {
        title: `Work with ${fullName.split(" ")[0]}?`,
        subtitle: profileData?.isAvailable
          ? "Available for new projects now."
          : "Currently not available.",
        buttonText: "Hire Now",
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [
      profileData,
      userData,
      apiSkills,
      portfolioItems,
      reviews,
      viewingOtherProfile,
      avatarUrl,
      fullName,
    ],
  );

  // ── Render helpers ────────────────────────────────────────────
  function handleReturn() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/dashboard");
  }

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
        {!viewingOtherProfile && (
          <button
            type="button"
            className="profilePage__backBtn"
            style={{ marginLeft: "140px" }}
            onClick={openProfileModal}
          >
            <i className="fa-solid fa-pen" aria-hidden="true" />
            Edit Profile
          </button>
        )}
      </div>

      <ProfileHeader profile={profile} />

      {/* ── SKILL MODAL ─────────────────────────────────────── */}
      {showSkillModal && (
        <div
          className="skillModalOverlay"
          onClick={() => setShowSkillModal(false)}
        >
          <div className="skillModal" onClick={(e) => e.stopPropagation()}>
            {/* X close button */}
            <button
              type="button"
              className="modalCloseBtn"
              onClick={() => setShowSkillModal(false)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <h2>Add Skill</h2>

            {skillError && <div className="error">{skillError}</div>}

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

      {/* ── EDIT PROFILE MODAL ──────────────────────────────── */}
      {showProfileModal && (
        <div className="skillModalOverlay" onClick={closeProfileModal}>
          <form
            className="skillModal"
            onSubmit={handleSaveProfile}
            onClick={(e) => e.stopPropagation()}
          >
            {/* X close button */}
            <button
              type="button"
              className="modalCloseBtn"
              onClick={closeProfileModal}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <h2>Edit Profile</h2>

            {profileFormError && (
              <div className="error" style={{ marginBottom: "12px" }}>
                {profileFormError}
              </div>
            )}
            {profileFormMessage && (
              <div style={{ color: "#8de8a3", marginBottom: "12px" }}>
                {profileFormMessage}
              </div>
            )}

            {[
              ["displayName", "Display Name"],
              ["title", "Title"],
              ["bio", "Bio"],
              ["address", "Address"],
              ["phoneNumber", "Phone"],
              ["linkedInUrl", "LinkedIn URL"],
              ["portfolioUrl", "Portfolio URL"],
              ["githubUrl", "GitHub URL"],
              ["websiteUrl", "Website URL"],
            ].map(([field, label]) => (
              <input
                key={field}
                type="text"
                placeholder={label}
                value={profileForm[field] || ""}
                onChange={(e) => handleProfileFormChange(field, e.target.value)}
                className="skillInput"
              />
            ))}

            {/* Country dropdown — sends UUID not text */}
            <select
              value={profileForm.countryId || ""}
              onChange={(e) =>
                handleProfileFormChange("countryId", e.target.value)
              }
              className="skillInput"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.nameEn || c.nameAr || c.id}
                </option>
              ))}
            </select>

            <label className="fileInputLabel" htmlFor="profileImageFile">
              Upload profile image
            </label>
            <input
              id="profileImageFile"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleAvatarFileChange(e.target.files?.[0] || null)
              }
              className="skillInput"
            />
            {profileForm.profileImageUrl && (
              <img
                src={
                  profileForm.profileImageUrl.startsWith("http")
                    ? profileForm.profileImageUrl
                    : `http://depiplatform.runasp.net${profileForm.profileImageUrl}`
                }
                alt="Profile preview"
                className="profileImagePreview"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}

            <input
              type="number"
              placeholder="Hourly Rate"
              value={profileForm.hourlyRate}
              onChange={(e) =>
                handleProfileFormChange("hourlyRate", e.target.value)
              }
              className="skillInput"
            />
            <input
              type="date"
              placeholder="Birth Date"
              value={
                profileForm.birthDate ? profileForm.birthDate.split("T")[0] : ""
              }
              onChange={(e) =>
                handleProfileFormChange("birthDate", e.target.value)
              }
              className="skillInput"
            />

            <div className="radioGroup">
              <span className="radioLabel">Gender</span>
              <label className="radioOption">
                <input
                  type="radio"
                  name="gender"
                  value="0"
                  checked={String(profileForm.gender) === "0"}
                  onChange={() => handleProfileFormChange("gender", 0)}
                />
                Female
              </label>
              <label className="radioOption">
                <input
                  type="radio"
                  name="gender"
                  value="1"
                  checked={String(profileForm.gender) === "1"}
                  onChange={() => handleProfileFormChange("gender", 1)}
                />
                Male
              </label>
            </div>

            <div className="skillActions">
              <button
                type="button"
                onClick={closeProfileModal}
                className="cancelBtn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="saveBtn"
                disabled={profileSubmitting}
              >
                {profileSubmitting ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── PORTFOLIO MODAL ─────────────────────────────────── */}
      {showPortfolioModal && (
        <div className="skillModalOverlay" onClick={closePortfolioModal}>
          <form
            className="skillModal"
            onSubmit={handleSavePortfolio}
            onClick={(e) => e.stopPropagation()}
          >
            {/* X close button */}
            <button
              type="button"
              className="modalCloseBtn"
              onClick={closePortfolioModal}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <h2>
              {editingPortfolioItem
                ? "Edit Portfolio Item"
                : "Add Portfolio Item"}
            </h2>

            {portfolioFormError && (
              <div className="error" style={{ marginBottom: "12px" }}>
                {portfolioFormError}
              </div>
            )}

            <input
              type="text"
              placeholder="Title *"
              value={portfolioForm.title}
              onChange={(e) =>
                setPortfolioForm((p) => ({ ...p, title: e.target.value }))
              }
              className="skillInput"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={portfolioForm.description}
              onChange={(e) =>
                setPortfolioForm((p) => ({ ...p, description: e.target.value }))
              }
              className="skillInput"
            />
            <input
              type="url"
              placeholder="Repository / Demo URL"
              value={portfolioForm.url}
              onChange={(e) =>
                setPortfolioForm((p) => ({ ...p, url: e.target.value }))
              }
              className="skillInput"
            />
            <input
              type="url"
              placeholder="Live URL"
              value={portfolioForm.liveUrl}
              onChange={(e) =>
                setPortfolioForm((p) => ({ ...p, liveUrl: e.target.value }))
              }
              className="skillInput"
            />

            <div className="skillActions">
              <button
                type="button"
                onClick={closePortfolioModal}
                className="cancelBtn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="saveBtn"
                disabled={portfolioSubmitting}
              >
                {portfolioSubmitting
                  ? "Saving..."
                  : editingPortfolioItem
                    ? "Update"
                    : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      {detailsLoading && (
        <div
          style={{
            margin: "16px 0",
            padding: "10px 14px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "12px",
            color: "#d1d5db",
            fontSize: "0.95rem",
            textAlign: "center",
          }}
        >
          Loading portfolio, skills, and reviews...
        </div>
      )}

      <div className="profilePage__contentWrap">
        <div className="profilePage__layout">
          <aside className="profilePage__sidebar">
            <ProfileSidebar profile={profile} />
          </aside>
          <main className="profilePage__main">
            <ProfileTabs
              tabs={profile.tabs}
              active={activeTab}
              onTabChange={setActiveTab}
            />
            <div className="profilePage__cards">
              {/* ── Overview Tab ── */}
              {activeTab === "Overview" && (
                <>
                  <ProfileAboutCard about={profile.about} />
                  <ProfileSkillsCard skills={profile.skills} />
                  <ProfileFeaturedWorkCard work={profile.featuredWork} />
                </>
              )}

              {/* ── Portfolio Tab ── */}
              {activeTab.startsWith("Portfolio") && (
                <ProfileFeaturedWorkCard work={profile.featuredWork} />
              )}

              {/* ── Reviews Tab ── */}
              {activeTab.startsWith("Reviews") && (
                <section style={{ padding: "24px 0" }}>
                  {urlUserId || profileData?.id ? (
                    <div className="reviewForm">
                      <h3>Leave a review</h3>
                      <label htmlFor="reviewRating">Rating</label>
                      <select
                        id="reviewRating"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="skillInput"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} Star{rating > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>

                      <label htmlFor="reviewType">Review type</label>
                      <select
                        id="reviewType"
                        value={reviewType}
                        onChange={(e) => setReviewType(Number(e.target.value))}
                        className="skillInput"
                      >
                        <option value={1}>Positive</option>
                        <option value={2}>Neutral</option>
                        <option value={3}>Negative</option>
                      </select>

                      <label htmlFor="reviewComment">Comment</label>
                      <textarea
                        id="reviewComment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="skillInput"
                        rows={4}
                        placeholder="Share your feedback."
                      />

                      <label htmlFor="reviewProjectId">Project ID</label>
                      <input
                        id="reviewProjectId"
                        type="text"
                        value={reviewProjectId}
                        onChange={(e) => setReviewProjectId(e.target.value)}
                        className="skillInput"
                        placeholder="Optional project ID"
                      />

                      <label htmlFor="reviewContractId">Contract ID</label>
                      <input
                        id="reviewContractId"
                        type="text"
                        value={reviewContractId}
                        onChange={(e) => setReviewContractId(e.target.value)}
                        className="skillInput"
                        placeholder="Optional contract ID"
                      />

                      {reviewError && (
                        <div className="reviewError">{reviewError}</div>
                      )}
                      {reviewSuccess && (
                        <div className="reviewMessage">{reviewSuccess}</div>
                      )}

                      <div className="reviewForm__actions">
                        <button
                          type="button"
                          className="cancelBtn"
                          onClick={() => {
                            setReviewComment("");
                            setReviewRating(5);
                            setReviewType(1);
                            setReviewProjectId("");
                            setReviewContractId("");
                            setReviewError("");
                            setReviewSuccess("");
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="saveBtn"
                          onClick={submitReview}
                          disabled={reviewSubmitting}
                        >
                          {reviewSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#94a3b8" }}>
                      Reviews are shown below for this profile. You can only
                      submit a review when viewing a different freelancer.
                    </p>
                  )}

                  {reviews.length === 0 ? (
                    <p style={{ color: "#94a3b8" }}>No reviews yet.</p>
                  ) : (
                    reviews.map((r, i) => (
                      <div
                        key={r.id || i}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "12px",
                          padding: "16px 20px",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#f1f5f9" }}>
                            {r.reviewerName || r.clientName || "Client"}
                          </span>
                          <span style={{ color: "#fbbf24" }}>
                            {"★".repeat(Math.round(r.rating || 0))}
                            {"☆".repeat(5 - Math.round(r.rating || 0))}
                            <span
                              style={{
                                color: "#94a3b8",
                                marginLeft: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              {r.rating}/5
                            </span>
                          </span>
                        </div>
                        {r.comment && (
                          <p
                            style={{
                              color: "#cbd5e1",
                              margin: 0,
                              fontSize: "0.95rem",
                            }}
                          >
                            {r.comment}
                          </p>
                        )}
                        {r.createdAt && (
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: "0.8rem",
                              marginTop: "8px",
                            }}
                          >
                            {new Date(r.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        )}
                        {(r.reviewerId === currentUserId || r.clientId === currentUserId) && (
                          <button
                            type="button"
                            className="cancelBtn"
                            style={{ marginTop: "10px" }}
                            disabled={reviewDeleting[r.id || i]}
                            onClick={() => deleteReview(r.id || i)}
                          >
                            {reviewDeleting[r.id || i] ? "Deleting..." : "Delete Review"}
                          </button>
                        )}
                        {!viewingOtherProfile && (
                          <div className="reviewResponseBox" style={{ marginTop: "14px" }}>
                            <label
                              htmlFor={`response-${r.id || i}`}
                              style={{ color: "#cbd5e1", display: "block", marginBottom: "8px" }}
                            >
                              Respond to this review
                            </label>
                            <textarea
                              id={`response-${r.id || i}`}
                              value={reviewResponses[r.id || i] || ""}
                              onChange={(e) =>
                                handleReviewResponseChange(r.id || i, e.target.value)
                              }
                              className="skillInput"
                              rows={3}
                              placeholder="Write your response here"
                            />
                            {responseError[r.id || i] && (
                              <div className="reviewError" style={{ marginTop: "8px" }}>
                                {responseError[r.id || i]}
                              </div>
                            )}
                            {responseSuccess[r.id || i] && (
                              <div className="reviewMessage" style={{ marginTop: "8px" }}>
                                {responseSuccess[r.id || i]}
                              </div>
                            )}
                            <button
                              type="button"
                              className="saveBtn"
                              style={{ marginTop: "10px" }}
                              onClick={() => submitReviewResponse(r.id || i)}
                              disabled={responseSubmitting[r.id || i]}
                            >
                              {responseSubmitting[r.id || i] ? "Sending..." : "Send Response"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      <ProfileBottomCta cta={profile.bottomCta} />
    </div>
  );
}
