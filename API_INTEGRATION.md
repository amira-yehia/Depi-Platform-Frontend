# DEPI Platform — API Integration Summary

**Base URL:** `http://depiplatform.runasp.net`

## Central Service Layer: `src/services/api.js`

كل الـ API مربوطة في ملف واحد `src/services/api.js` — فيه:

| Service | Endpoints Covered |
|---|---|
| `authService` | login, register, logout, me, forgotPassword, resetPassword, changePassword |
| `jobsService` | list, get, create, update, delete, apply, myApplications |
| `projectsService` | list, myProjects, get, create, update, delete, open, cancel |
| `proposalsService` | submit, myProposals, myAll, forProject, accept, reject, withdraw |
| `contractsService` | myContracts, get, create, accept, reject, start, complete, milestones (CRUD), escrow, messages |
| `conversationsService` | list, create, getMessages, sendMessage, markRead |
| `profilesService` | me, update, create, get, available, setAvailability |
| `skillsService` | list, search, create, update, delete, mySkills, addMySkill, updateMySkill, deleteMySkill |
| `portfolioService` | my, featured, get, create, update, delete, publish, toggleFeatured |
| `aiService` | jobMatches, jobAnalysis, jobLocalAnalysis, recommendations, topFreelancers, profileScore, skillGap, chat |
| `notificationsService` | list, markRead, getPreferences, updatePreferences |
| `reviewsService` | create, respond, forUser, mine, delete |
| `walletService` | myWallet, summary, transactions, deposit, withdraw, transfer |
| `mediaService` | myFiles, uploadAvatar, uploadCover, setAvatar, setCover, delete |
| `bookmarksService` | list, ids, toggle |
| `categoriesService` | list, subcategories, subcategorySkills |
| `companiesService` | list, get, create, update, delete |
| `connectsService` | packs, balance, history, purchase, earningRules, earningSummary |
| `pricingService` | predict |
| `verificationsService` | submit, my, pending, approve, reject |
| `communityService` | posts, createPost, forumThreads, createThread, createReply |
| `usersService` | search, profile |
| `escrowsService` | list |

## Auth Flow
- Tokens stored in `localStorage`: `accessToken` + `refreshToken`
- Auto-refresh on 401 — transparent to all pages
- `clearTokens()` + redirect to `/signin` on refresh failure

## Pages Connected to API
| Page | API Used |
|---|---|
| SignInPage | `authService.login` |
| SignUpPage | `authService.register` |
| ForgotPassword | `authService.forgotPassword`, `authService.resetPassword` |
| ChangePassword | `authService.changePassword` |
| DashboardPage | `aiService.jobMatches`, `contractsService.myContracts`, `walletService.summary` |
| FindProjectsPage | `jobsService.list` |
| ProjectDetailsPage | `jobsService.get`, `aiService.jobLocalAnalysis`, `jobsService.apply` |
| MarketplacePage | `jobsService.list`, `bookmarksService` |
| Marketplace (Talent) | `aiService.topFreelancers`, `profilesService.available` |
| ProposalsPage | `proposalsService.myAll`, `proposalsService.withdraw` |
| ContractsMilestonesPage | `contractsService.myContracts` |
| Messages | `conversationsService.list/getMessages/sendMessage/markRead` |
| ProfilePage | `authService.me`, `profilesService.me`, `skillsService.mySkills`, `portfolioService.my`, `reviewsService.mine` |
