# Mobile Navigation Guide — Smart Router

> **Audience:** Programmer 9 (iOS) and Programmer 10 (Android)  
> **Owner:** Programmer 3 (Frontend)  
> **Status:** Updated for Dynamic Onboarding Survey v1.1
> **Last updated:** 2026-08-08

This guide explains how to implement the **Smart Navigation Router** on iOS and Android so that mobile users get the same automatic routing behavior as the web app.

---

## 1. Concept

The web app uses two primitives:

- `useSmartNavigation()` — a React hook that reads auth state and onboarding status, then redirects.
- `<SmartRouter />` — a global component that runs the hook once at app startup.

On mobile, you will implement the **same state machine** in your native navigation layer:

```
[Auth State] + [Onboarding State] + [Role] -> Decision -> Screen
```

---

## 2. State Machine

| Auth | Onboarded | Current Screen | Decision |
|------|-----------|----------------|----------|
| No | - | Any protected screen | Go to Login |
| Yes | No | Any screen except Onboarding | Go to Onboarding |
| Yes | Yes | Login / Register / Onboarding | Go to Role Default Screen |
| Yes | Yes | Any other screen | Allow |

---

## 3. API Contract

Use the same endpoint as the web app:

```http
GET /api/v1/entity-registry/me
Authorization: Bearer <access_token>
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "isOnboarded": true,
    "profile": { },
    "entity": { }
  }
}
```

### Not Onboarded (200)

```json
{
  "success": true,
  "data": {
    "isOnboarded": false,
    "profile": null,
    "entity": null
  }
}
```

### Unauthorized (401)

Treat as "not authenticated" -> Login screen.

---

## 4. Role Default Screens

| Role | Default Mobile Screen |
|------|-----------------------|
| ADMIN | AdminDashboard |
| SUPER_ADMIN | AdminDashboard |
| SUPPLIER | MarketplaceScreen |
| TRADER | MarketplaceScreen |
| CONTRACTOR | ProjectsScreen |
| SUBCONTRACTOR | ProjectsScreen |
| WORKSHOP | ProjectsScreen |
| CONSULTANT | ProjectsScreen |
| OWNER | ProjectsScreen |
| FREELANCER | JobsScreen |

---

## 5. iOS Example (SwiftUI)

```swift
import SwiftUI

class NavigationRouter: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var isOnboarded: Bool? = nil
    @Published var role: String? = nil
    @Published var isLoading: Bool = true

    func checkNavigation() async {
        isLoading = true
        defer { isLoading = false }

        let token = AuthService.shared.token
        guard let token else {
            isAuthenticated = false
            return
        }

        isAuthenticated = true
        isOnboarded = false

        do {
            let status = try await EntityRegistryAPI.fetchMe(token: token)
            isOnboarded = status.isOnboarded
            role = AuthService.shared.role
        } catch {
            isOnboarded = false
        }
    }

    var destination: String {
        guard isAuthenticated else { return "Login" }
        guard isOnboarded == true else { return "Onboarding" }
        return roleDefaultRoute(role: role ?? "")
    }
}

func roleDefaultRoute(role: String) -> String {
    switch role {
    case "ADMIN", "SUPER_ADMIN": return "AdminDashboard"
    case "SUPPLIER", "TRADER": return "Marketplace"
    case "FREELANCER": return "Jobs"
    default: return "Projects"
    }
}

struct RootView: View {
    @StateObject private var router = NavigationRouter()

    var body: some View {
        Group {
            if router.isLoading {
                SplashScreen()
            } else {
                switch router.destination {
                case "Login": LoginScreen()
                case "Onboarding": OnboardingScreen()
                case "AdminDashboard": AdminDashboard()
                case "Marketplace": MarketplaceScreen()
                case "Jobs": JobsScreen()
                default: ProjectsScreen()
                }
            }
        }
        .task {
            await router.checkNavigation()
        }
    }
}
```

---

## 6. Android Example (Kotlin + Jetpack Compose)

```kotlin
class NavigationViewModel : ViewModel() {
    var isLoading by mutableStateOf(true)
        private set
    var isAuthenticated by mutableStateOf(false)
        private set
    var isOnboarded by mutableStateOf(false)
        private set
    var role by mutableStateOf<String?>(null)
        private set

    fun checkNavigation() {
        viewModelScope.launch {
            isLoading = true
            val token = AuthRepository.token
            isAuthenticated = token != null
            if (token != null) {
                try {
                    val status = EntityRegistryApi.fetchMe(token)
                    isOnboarded = status.isOnboarded
                    role = AuthRepository.role
                } catch (e: Exception) {
                    isOnboarded = false
                }
            }
            isLoading = false
        }
    }

    val destination: String
        get() = when {
            !isAuthenticated -> "Login"
            !isOnboarded -> "Onboarding"
            else -> roleDefaultRoute(role)
        }
}

fun roleDefaultRoute(role: String?): String = when (role) {
    "ADMIN", "SUPER_ADMIN" -> "AdminDashboard"
    "SUPPLIER", "TRADER" -> "Marketplace"
    "FREELANCER" -> "Jobs"
    else -> "Projects"
}

@Composable
fun RootNavigation(viewModel: NavigationViewModel = viewModel()) {
    LaunchedEffect(Unit) { viewModel.checkNavigation() }

    when {
        viewModel.isLoading -> SplashScreen()
        viewModel.destination == "Login" -> LoginScreen()
        viewModel.destination == "Onboarding" -> OnboardingScreen()
        viewModel.destination == "AdminDashboard" -> AdminDashboard()
        viewModel.destination == "Marketplace" -> MarketplaceScreen()
        viewModel.destination == "Jobs" -> JobsScreen()
        else -> ProjectsScreen()
    }
}
```

---

## 7. Review Checklist

Use this checklist during the review session with Programmer 3:

- [ ] Mobile apps call `GET /api/v1/entity-registry/me` on app launch.
- [ ] The endpoint is called with a valid Bearer token.
- [ ] Unauthenticated users are sent to Login.
- [ ] Authenticated users without `isOnboarded == true` are sent to Onboarding.
- [ ] Authenticated onboarded users opening Login/Register/Onboarding are redirected to the role default screen.
- [ ] Role mapping matches exactly the web table.
- [ ] Splash screen is shown while auth + onboarding status are loading.
- [ ] RTL layouts are supported.
- [ ] Deep links / push notifications respect the same rules.

---

## 9. Onboarding Survey Flow (Dynamic Subcategories)

The onboarding survey (Step 3 of 3) now uses a dynamic category/subcategory structure:

- **12 Main Categories** (e.g., "Construction Materials", "Electrical & Low Current", etc.)
- **133 Subcategories** total, dynamically loaded based on selected main categories
- User flow: Select main categories → Subcategory panels appear for each selected category → Select subcategories

### Mobile Implementation Notes

- Onboarding screen must support expandable category cards with checkbox grids
- RTL/LTR mirroring applies to the category/subcategory grids
- Translation keys: `obSurveyCategoriesTitle`, `obSurveyCategoriesSubtitle`, `obSurveySubcategoriesTitle`, `obSurveySubcategoriesSubtitle`
- Validation: At least one main category AND at least one subcategory required
- API payload includes `selectedCategories[]` and `subcategories[]` arrays

### Payload Sent to Backend

```json
{
  "entity": { ... },
  "profile": {
    "businessActivity": "supplier",
    "companySize": "medium",
    "relevantCategories": ["construction-materials", "electrical-low-current"],
    "capabilities": ["portland-cement", "reinforcement-steel", "power-cables"]
  }
}
```

> **Note:** Subcategories are currently stored in the `capabilities` field pending a DB migration to add a dedicated `subcategories` column (coordinate with Programmer 2).

---

## 10. Questions & Contact

- Source of truth for rules: `src/lib/navigation/types.ts`
- Web implementation: `src/lib/navigation/useSmartNavigation.ts`
- API endpoint: `src/app/api/v1/entity-registry/me/route.ts`
- Onboarding survey data: `src/lib/data/survey-categories.ts`
- Contact: Programmer 3 (Frontend)

---

> **Maintained by:** Programmer 3 (Frontend)
> **Last updated:** 2026-08-08
