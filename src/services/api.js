// ─── Central API Service ──────────────────────────────────────────────────────
// Base URL for all endpoints
export const BASE_URL = "http://depiplatform.runasp.net";

// ─── Token Helpers ────────────────────────────────────────────────────────────
export function getToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken") || "";
}

export function saveTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("authToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUserName");
  localStorage.removeItem("authEmail");
}

// ─── Base Fetch with Auto-Refresh ─────────────────────────────────────────────
let _refreshing = null;

async function refreshTokens() {
  if (_refreshing) return _refreshing;
  _refreshing = fetch(`${BASE_URL}/api/Auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: getRefreshToken() }),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error("Refresh failed");
      const data = await r.json();
      saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    })
    .finally(() => {
      _refreshing = null;
    });
  return _refreshing;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // FormData: don't set Content-Type (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  console.log("REQUEST:", url, headers);
  let res = await fetch(url, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && getRefreshToken()) {
    try {
      const newToken = await refreshTokens();
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } catch {
      clearTokens();
      window.location.href = "/signin";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    let errData;
    try {
      errData = await res.json();
    } catch {
      errData = null;
    }
    const msg =
      errData?.message ||
      errData?.title ||
      errData?.detail ||
      (errData?.errors ? Object.values(errData.errors).flat()[0] : null) ||
      `Request failed: ${res.status}`;
    const error = new Error(msg);
    error.status = res.status;
    error.data = errData;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return null;

  try {
    const data = await res.json();
    console.log("API FETCH:", path, data);
    return data;
  } catch {
    return null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
export const authService = {
  login: (email, password) =>
    apiFetch("/api/Auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email, password, firstName, lastName, userType) =>
    apiFetch("/api/Auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName, userType }),
    }),

  logout: () => {
    const refreshToken = getRefreshToken();
    return apiFetch("/api/Auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).finally(clearTokens);
  },

  me: () => apiFetch("/api/Auth/me"),

  forgotPassword: (email) =>
    apiFetch("/api/Auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email, token, newPassword) =>
    apiFetch("/api/Auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, newPassword }),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiFetch("/api/Auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────────────────────────────────
export const jobsService = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.searchTerm) q.set("searchTerm", params.searchTerm);
    if (params.type !== undefined) q.set("type", params.type);
    if (params.location) q.set("location", params.location);
    if (params.featured !== undefined) q.set("featured", params.featured);
    q.set("page", params.page || 1);
    q.set("pageSize", params.pageSize || 20);
    return apiFetch(`/api/jobs?${q}`);
  },

  get: (id) => apiFetch(`/api/jobs/${id}`),

  create: (data) =>
    apiFetch("/api/jobs", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/api/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id) => apiFetch(`/api/jobs/${id}`, { method: "DELETE" }),

  apply: (jobId, coverLetter, proposedRate, proposedTimeline) =>
    apiFetch("/api/jobs/apply", {
      method: "POST",
      body: JSON.stringify({
        jobId,
        coverLetter,
        proposedRate,
        proposedTimeline,
      }),
    }),

  myApplications: () => apiFetch("/api/jobs/my-applications"),
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
export const projectsService = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.Status) q.set("Status", params.Status);
    if (params.Type) q.set("Type", params.Type);
    if (params.Search) q.set("Search", params.Search);
    if (params.MinBudget) q.set("MinBudget", params.MinBudget);
    if (params.MaxBudget) q.set("MaxBudget", params.MaxBudget);
    if (params.Page) q.set("Page", params.Page);
    if (params.PageSize) q.set("PageSize", params.PageSize);
    return apiFetch(`/api/Projects?${q}`);
  },

  myProjects: (params = {}) => {
    const q = new URLSearchParams();
    if (params.Status) q.set("Status", params.Status);
    if (params.Search) q.set("Search", params.Search);
    return apiFetch(`/api/Projects/my-projects?${q}`);
  },

  get: (id) => apiFetch(`/api/Projects/${id}`),

  create: (data) =>
    apiFetch("/api/Projects", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/api/Projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) => apiFetch(`/api/Projects/${id}`, { method: "DELETE" }),

  open: (id) => apiFetch(`/api/Projects/${id}/open`, { method: "POST" }),
  cancel: (id) => apiFetch(`/api/Projects/${id}/cancel`, { method: "POST" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// PROPOSALS
// ─────────────────────────────────────────────────────────────────────────────
export const proposalsService = {
  submit: (projectId, proposedAmount, estimatedDays, coverLetter) =>
    apiFetch("/api/Proposals", {
      method: "POST",
      body: JSON.stringify({
        projectId,
        proposedAmount,
        estimatedDays,
        coverLetter,
      }),
    }),

  myProposals: () => apiFetch("/api/Proposals/my-proposals"),
  myAll: () => apiFetch("/api/Proposals/my-all"),

  forProject: (projectId) => apiFetch(`/api/Proposals/project/${projectId}`),

  accept: (id, milestones) =>
    apiFetch(`/api/Proposals/${id}/accept`, {
      method: "POST",
      body: JSON.stringify({ milestones }),
    }),

  reject: (id, reason) =>
    apiFetch(`/api/Proposals/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(reason),
    }),

  withdraw: (id) =>
    apiFetch(`/api/Proposals/${id}/withdraw`, { method: "POST" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACTS
// ─────────────────────────────────────────────────────────────────────────────
export const contractsService = {
  myContracts: () => apiFetch("/api/Contracts/my-contracts"),
  get: (id) => apiFetch(`/api/Contracts/${id}`),
  canAccept: (id) => apiFetch(`/api/Contracts/${id}/can-accept`),

  create: (projectId, totalAmount) =>
    apiFetch("/api/Contracts", {
      method: "POST",
      body: JSON.stringify({ projectId, totalAmount }),
    }),

  accept: (id) => apiFetch(`/api/Contracts/${id}/accept`, { method: "POST" }),

  reject: (id, reason) =>
    apiFetch(`/api/Contracts/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  start: (id) => apiFetch(`/api/Contracts/${id}/start`, { method: "POST" }),
  submitReview: (id) =>
    apiFetch(`/api/Contracts/${id}/submit-review`, { method: "POST" }),
  complete: (id) =>
    apiFetch(`/api/Contracts/${id}/complete`, { method: "POST" }),

  openDispute: (id, reason) =>
    apiFetch(`/api/Contracts/${id}/disputes`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  fundEscrow: (id) =>
    apiFetch(`/api/Contracts/${id}/escrow/fund`, { method: "POST" }),
  releaseEscrow: (id) =>
    apiFetch(`/api/Contracts/${id}/escrow/release`, { method: "POST" }),
  refundEscrow: (id, reason) =>
    apiFetch(`/api/Contracts/${id}/escrow/refund`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Milestones
  createMilestone: (contractId, data) =>
    apiFetch(`/api/Contracts/${contractId}/milestones`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  startMilestone: (contractId, milestoneId) =>
    apiFetch(`/api/Contracts/${contractId}/milestones/${milestoneId}/start`, {
      method: "POST",
    }),

  submitMilestone: (contractId, milestoneId, deliverables) =>
    apiFetch(`/api/Contracts/${contractId}/milestones/${milestoneId}/submit`, {
      method: "POST",
      body: JSON.stringify({ deliverables }),
    }),

  approveMilestone: (contractId, milestoneId) =>
    apiFetch(`/api/Contracts/${contractId}/milestones/${milestoneId}/approve`, {
      method: "POST",
    }),

  requestPayment: (contractId, milestoneId) =>
    apiFetch(
      `/api/Contracts/${contractId}/milestones/${milestoneId}/request-payment`,
      { method: "POST" },
    ),

  releasePayment: (contractId, milestoneId) =>
    apiFetch(
      `/api/Contracts/${contractId}/milestones/${milestoneId}/release-payment`,
      { method: "POST" },
    ),

  requestRevision: (contractId, milestoneId, reason) =>
    apiFetch(
      `/api/Contracts/${contractId}/milestones/${milestoneId}/request-revision`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    ),

  // Contract messages
  getMessages: (contractId, skip = 0, take = 50) =>
    apiFetch(`/api/contracts/${contractId}/Messages?skip=${skip}&take=${take}`),

  sendMessage: (contractId, message) =>
    apiFetch(`/api/contracts/${contractId}/Messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  deleteMessage: (contractId, messageId) =>
    apiFetch(`/api/contracts/${contractId}/Messages/${messageId}`, {
      method: "DELETE",
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS / MESSAGES
// ─────────────────────────────────────────────────────────────────────────────
export const conversationsService = {
  list: () => apiFetch("/api/Conversations"),

  create: (userId, title, isGroup = false, projectId = null) =>
    apiFetch("/api/Conversations", {
      method: "POST",
      body: JSON.stringify({ userId, title, isGroup, projectId }),
    }),

  getMessages: (id, page = 1, pageSize = 50) =>
    apiFetch(
      `/api/Conversations/${id}/messages?page=${page}&pageSize=${pageSize}`,
    ),

  sendMessage: (id, content, type = 1, replyToMessageId = null) =>
    apiFetch(`/api/Conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({
        conversationId: id,
        content,
        type,
        replyToMessageId,
      }),
    }),

  markRead: (id) =>
    apiFetch(`/api/Conversations/${id}/read`, { method: "POST" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────────────────────────────────────
export const profilesService = {
  me: () => apiFetch("/api/Profiles/me"),

  update: async (data) => {
    const { isAvailable, ...profileData } = data;
    const updatedProfile = await apiFetch("/api/Profiles/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (typeof isAvailable === "boolean") {
      await apiFetch("/api/Profiles/me/availability", {
        method: "PUT",
        body: JSON.stringify({ isAvailable }),
      });
    }

    return updatedProfile;
  },

  create: (data) =>
    apiFetch("/api/Profiles", { method: "POST", body: JSON.stringify(data) }),

  get: (userId) => apiFetch(`/api/Profiles/${userId}`),

  available: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    q.set("page", params.page || 1);
    q.set("pageSize", params.pageSize || 20);
    return apiFetch(`/api/Profiles/available?${q}`);
  },

  setAvailability: (isAvailable) =>
    apiFetch("/api/Profiles/me/availability", {
      method: "PUT",
      body: JSON.stringify({ isAvailable }),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────────────────────────────────────
export const skillsService = {
  list: (isActive) => {
    const q = isActive !== undefined ? `?isActive=${isActive}` : "";
    return apiFetch(`/api/Skills${q}`);
  },

  search: (query) =>
    apiFetch(`/api/skills/search?query=${encodeURIComponent(query)}`),

  create: (data) =>
    apiFetch("/api/Skills", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/api/Skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  mySkills: () => apiFetch("/api/freelancer-skills"),

  addMySkill: (skillId, proficiencyLevel, yearsOfExperience) =>
    apiFetch("/api/freelancer-skills", {
      method: "POST",
      body: JSON.stringify({ skillId, proficiencyLevel, yearsOfExperience }),
    }),

  updateMySkill: (skillId, proficiencyLevel, yearsOfExperience) =>
    apiFetch(`/api/freelancer-skills/${skillId}`, {
      method: "PUT",
      body: JSON.stringify({ proficiencyLevel, yearsOfExperience }),
    }),

  deleteMySkill: (skillId) =>
    apiFetch(`/api/freelancer-skills/${skillId}`, {
      method: "DELETE",
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO
// ─────────────────────────────────────────────────────────────────────────────
export const portfolioService = {
  my: () => apiFetch("/api/Portfolio/my"),
  featured: () => apiFetch("/api/Portfolio/featured"),
  get: (userId) => apiFetch(`/api/Portfolio/${userId}`),

  create: (data) =>
    apiFetch("/api/Portfolio", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/api/Portfolio/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) => apiFetch(`/api/Portfolio/${id}`, { method: "DELETE" }),

  publish: (id) => apiFetch(`/api/Portfolio/${id}/publish`, { method: "PUT" }),
  unpublish: (id) =>
    apiFetch(`/api/Portfolio/${id}/unpublish`, { method: "PUT" }),
  toggleFeatured: (id) =>
    apiFetch(`/api/Portfolio/${id}/toggle-featured`, { method: "PUT" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────────────────────────────────────
export const aiService = {
  jobMatches: () => apiFetch("/api/ai/jobs/matches"),
  jobAnalysis: (jobId) => apiFetch(`/api/ai/jobs/${jobId}/analysis`),
  jobLocalAnalysis: (jobId) => apiFetch(`/api/ai/jobs/${jobId}/local-analysis`),
  recommendations: () => apiFetch("/api/ai/recommendations"),
  topFreelancers: () => apiFetch("/api/ai/freelancers/top"),
  freelancerScore: (freelancerId) =>
    apiFetch(`/api/ai/freelancer/${freelancerId}/score`),
  profileScore: (freelancerId) =>
    apiFetch(`/api/ai/profile-score/${freelancerId}/detailed`),
  skillGap: () => apiFetch("/api/ai/skill-gap"),
  projectMatches: (projectId) =>
    apiFetch(`/api/ai/matches/project/${projectId}`),

  analyzeProfile: (freelancerId) =>
    apiFetch(`/api/ai/analyze/profile/${freelancerId}`, { method: "POST" }),

  analyzeProposal: (coverLetter, projectId) =>
    apiFetch("/api/ai/analyze/proposal", {
      method: "POST",
      body: JSON.stringify({ coverLetter, projectId }),
    }),

  chat: (messages) =>
    apiFetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const notificationsService = {
  list: (unreadOnly = false) =>
    apiFetch(`/api/Notifications?unreadOnly=${unreadOnly}`),
  markRead: (id) =>
    apiFetch(`/api/Notifications/${id}/read`, { method: "POST" }),

  getPreferences: () => apiFetch("/api/notification-preferences"),
  updatePreferences: (data) =>
    apiFetch("/api/notification-preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
export const reviewsService = {
  create: (data) =>
    apiFetch("/api/Reviews", { method: "POST", body: JSON.stringify(data) }),

  respond: (id, response) =>
    apiFetch(`/api/Reviews/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ response }),
    }),

  forUser: (userId, params = {}) => {
    const query = new URLSearchParams({ ...params }).toString();
    return apiFetch(
      `/api/Reviews/user/${userId}${query ? `?${query}` : ""}`,
    );
  },

  mine: () => apiFetch("/api/Reviews/me"),
  delete: (id) => apiFetch(`/api/Reviews/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────────────────────────────────────────
export const walletService = {
  create: () => apiFetch("/api/Wallets", { method: "POST" }),
  myWallet: () => apiFetch("/api/Wallets/my-wallet"),
  summary: () => apiFetch("/api/Wallets/summary"),
  transactions: (page = 1, pageSize = 20) =>
    apiFetch(`/api/Wallets/transactions?page=${page}&pageSize=${pageSize}`),
  transaction: (id) => apiFetch(`/api/Wallets/transactions/${id}`),

  deposit: (amount, paymentMethod, description) =>
    apiFetch("/api/Wallets/deposit", {
      method: "POST",
      body: JSON.stringify({ amount, paymentMethod, description }),
    }),

  withdraw: (amount, description) =>
    apiFetch("/api/Wallets/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, description }),
    }),

  transfer: (toUserId, amount, description) =>
    apiFetch("/api/Wallets/transfer", {
      method: "POST",
      body: JSON.stringify({ toUserId, amount, description }),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA / UPLOADS
// ─────────────────────────────────────────────────────────────────────────────
export const mediaService = {
  myFiles: (type) => {
    const q = type !== undefined ? `?type=${type}` : "";
    return apiFetch(`/api/Media/my-files${q}`);
  },

  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch("/api/Media/upload-avatar", { method: "POST", body: fd });
  },

  uploadCover: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch("/api/Media/upload-cover", { method: "POST", body: fd });
  },

  setAvatar: (imageUrl) =>
    apiFetch("/api/Media/set-avatar", {
      method: "POST",
      body: JSON.stringify({ imageUrl }),
    }),

  setCover: (imageUrl) =>
    apiFetch("/api/Media/set-cover", {
      method: "POST",
      body: JSON.stringify({ imageUrl }),
    }),

  delete: (id) => apiFetch(`/api/Media/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────────────────────────────────────
export const bookmarksService = {
  list: () => apiFetch("/api/bookmarks"),
  ids: () => apiFetch("/api/bookmarks/ids"),
  toggle: (projectId) =>
    apiFetch(`/api/bookmarks/${projectId}`, { method: "POST" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
export const categoriesService = {
  list: () => apiFetch("/api/categories"),
  subcategories: (id) => apiFetch(`/api/categories/${id}/subcategories`),
  subcategorySkills: (id) =>
    apiFetch(`/api/categories/subcategories/${id}/skills`),
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────────────────────────────────────
export const companiesService = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.searchTerm) q.set("searchTerm", params.searchTerm);
    if (params.verifiedOnly) q.set("verifiedOnly", params.verifiedOnly);
    q.set("page", params.page || 1);
    q.set("pageSize", params.pageSize || 20);
    return apiFetch(`/api/Companies?${q}`);
  },
  get: (id) => apiFetch(`/api/Companies/${id}`),
  create: (data) =>
    apiFetch("/api/Companies", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/api/Companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => apiFetch(`/api/Companies/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTS
// ─────────────────────────────────────────────────────────────────────────────
export const connectsService = {
  packs: () => apiFetch("/api/connects/packs"),
  balance: () => apiFetch("/api/connects/balance"),
  history: () => apiFetch("/api/connects/history"),
  purchase: (connectPackId, paymentMethod) =>
    apiFetch("/api/connects/purchase", {
      method: "POST",
      body: JSON.stringify({ connectPackId, paymentMethod }),
    }),
  earningRules: () => apiFetch("/api/connects/earning/rules"),
  earningSummary: () => apiFetch("/api/connects/earning/summary"),
  earningHistory: () => apiFetch("/api/connects/earning/history"),
};

// ─────────────────────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────────────────────
export const pricingService = {
  predict: (data) =>
    apiFetch("/api/pricing/predict", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const verificationsService = {
  submit: (data) =>
    apiFetch("/api/Verifications/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  my: () => apiFetch("/api/Verifications/my"),
  pending: () => apiFetch("/api/Verifications/pending"),
  approve: (id) =>
    apiFetch(`/api/Verifications/${id}/approve`, { method: "POST" }),
  reject: (id, rejectionReason) =>
    apiFetch(`/api/Verifications/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectionReason }),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY
// ─────────────────────────────────────────────────────────────────────────────
export const communityService = {
  posts: (params = {}) => {
    const q = new URLSearchParams();
    if (params.featured) q.set("featured", params.featured);
    if (params.category) q.set("category", params.category);
    if (params.searchTerm) q.set("searchTerm", params.searchTerm);
    q.set("page", params.page || 1);
    q.set("pageSize", params.pageSize || 20);
    return apiFetch(`/api/community/posts?${q}`);
  },
  createPost: (data) =>
    apiFetch("/api/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePost: (id, data) =>
    apiFetch(`/api/community/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePost: (id) =>
    apiFetch(`/api/community/posts/${id}`, { method: "DELETE" }),

  forumThreads: (params = {}) => {
    const q = new URLSearchParams();
    if (params.categoryId) q.set("categoryId", params.categoryId);
    if (params.searchTerm) q.set("searchTerm", params.searchTerm);
    q.set("page", params.page || 1);
    q.set("pageSize", params.pageSize || 20);
    return apiFetch(`/api/community/forum/threads?${q}`);
  },
  createThread: (data) =>
    apiFetch("/api/community/forum/threads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createReply: (threadId, content) =>
    apiFetch("/api/community/forum/replies", {
      method: "POST",
      body: JSON.stringify({ threadId, content }),
    }),
  deleteThread: (id) =>
    apiFetch(`/api/community/forum/threads/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────
export const usersService = {
  search: (search, userType, page = 1, pageSize = 20) => {
    const q = new URLSearchParams({ page, pageSize });
    if (search) q.set("search", search);
    if (userType) q.set("userType", userType);
    return apiFetch(`/api/Users/search?${q}`);
  },
  profile: (id) => apiFetch(`/api/Users/${id}/profile`),
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCROWS
// ─────────────────────────────────────────────────────────────────────────────
export const countriesService = {
  list: () => apiFetch("/api/Countries"),
};

export const escrowsService = {
  list: () => apiFetch("/api/escrows"),
};

export default {
  authService,
  jobsService,
  projectsService,
  proposalsService,
  contractsService,
  conversationsService,
  profilesService,
  skillsService,
  portfolioService,
  aiService,
  notificationsService,
  reviewsService,
  walletService,
  mediaService,
  bookmarksService,
  categoriesService,
  companiesService,
  connectsService,
  pricingService,
  verificationsService,
  communityService,
  usersService,
  escrowsService,
  countriesService,
};
