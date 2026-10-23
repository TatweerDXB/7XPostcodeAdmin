# 7X UAE Postcode Digital Addressing System — Project Knowledge Base

> **Document Version:** 1.0.0  
> **Last Updated:** October 2026  
> **Corpus / Repository:** `TatweerDXB/7XPostcodeAdmin` (`d:\7x`)  
> **Status:** Active MVP Development & PostcodeGrid Integration

---

## 1. Project Overview & Business Purpose

The **7X UAE Postcode Digital Addressing System** is a mission-critical web application developed for **Emirates Post Group (7X)** to administer, explore, visualize, search, and manage postcodes, building structures, units, plots, and physical/digital addresses across all seven emirates of the United Arab Emirates (Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah).

### Core Business Objectives
- **Standardize Addressing:** Unify disparate legacy addressing conventions (Dubai Makani, Abu Dhabi Onwani, free-text addresses) into a 4-tier hierarchical grid-based postcode system.
- **Hierarchical Grid Resolution:** Translate geographical coordinates (latitude and longitude) into structured administrative and spatial hierarchy cells (Tier 1 Emirate, Tier 2 Sector/Region, Tier 3 District/Block, Tier 4 Plot/Building).
- **Search & Verification Console:** Empower operators and administrators to query coordinates, addresses, landmarks, Makani numbers, and postcodes with real-time Google Places and backend geospatial resolution.
- **Address Registry Administration:** Maintain authoritative address records, link addresses to buildings/units, edit coordinates with interactive tier selection, and monitor verification statuses (`Verified`, `Pending`, `Restricted`, `Unverified`).
- **Geospatial Analytics & Heatmap:** Visualize delivery density, repeat delivery failure rates, and unstructured address volumes across UAE grid tiers to optimize logistics and postal delivery routing.

---

## 2. Technology Stack & Dependencies

### Core Framework & Runtime
- **Next.js:** `16.3.6` (App Router, React Compiler enabled, modern `src/proxy.ts` request proxying convention replacing deprecated `middleware.ts`).
- **React:** `19.2.8`
- **React DOM:** `19.2.8`
- **TypeScript:** `^5` (Strict type checking enabled, target `ES2017`, `moduleResolution: "bundler"`, `@/*` path alias to `src/*`).

### UI Framework & Styling
- **Material UI (MUI):** `@mui/material` `^9.4.0`, `@mui/icons-material` `^9.4.0`, `@mui/material-nextjs` `^9.4.0` (AppRouterCacheProvider).
- **Emotion:** `@emotion/react` `^11.14.0`, `@emotion/styled` `^11.14.1`.
- **Typography:** Google Fonts loaded via `next/font/google`:
  - `Space Grotesk` (weights 400, 500, 600, 700) for brand headlines, display headers, and grid titles.
  - `Cairo` (weights 400, 500, 600, 700) for body text, navigation menus, labels, and table cells.
- **CSS:** Vanilla CSS tokens and resets in `src/styles/globals.css`.

### State Management & Storage
- **Redux Toolkit:** `@reduxjs/toolkit` `^2.13.0` & `react-redux` `^9.3.0` for global authentication state (`authSlice`).
- **Cookies:** `js-cookie` `^3.0.8` (`@types/js-cookie` `^3.0.6`) for secure token and session cookie persistence (`jwtToken`, `refreshToken`, `auth_session`).

### Geospatial & Mapping Libraries
- **Leaflet:** `leaflet` `^1.9.4` & `@types/leaflet` `^1.9.22` for dynamic raster layers, GeoJSON polygon boundary rendering, interactive click-to-resolve events, and density heatmap rectangles.
- **Google Maps JavaScript API SDK:** Places Autocomplete, Geocoding, and Reverse Geocoding via dynamic async loading (`@types/google.maps` `^3.66.4`).

### Tooling & Compilation
- **Babel Plugin React Compiler:** `babel-plugin-react-compiler` `1.0.0` (enabled via `reactCompiler: true` in `next.config.ts`).
- **ESLint:** `eslint` `^9` with `eslint-config-next` `16.3.6`.

---

## 3. Project Architecture & Folder Structure

```
d:\7x\
├── .agents/                        # Agent configurations, plugins (Figma plugin)
│   └── plugins/figma/
├── .env.example                    # Sample environment variables
├── .env.local                      # Local active environment variables (API Gateway & Maps key)
├── AGENTS.md                       # Persistent agent operational guidelines
├── CLAUDE.md                       # Reference link to AGENTS.md
├── next.config.ts                  # Next.js 16 config: compiler, security headers, /api rewrites
├── package.json                    # Project metadata, scripts, and dependencies
├── tsconfig.json                   # TypeScript configuration with @/* path mappings
├── public/                         # Public static assets
│   ├── favicon.ico
│   ├── loginbg.jpg                 # Background banner for login screen
│   ├── mohamed.jpg                 # Default profile avatar
│   └── images/
│       ├── epg-logo.png            # Emirates Post Group brand logo
│       ├── uae-border.png          # UAE map silhouette for sidebar
│       └── uae-skyline.png         # Silhouette graphic
└── src/
    ├── proxy.ts                    # Next.js 16 Edge proxy (auth verification & route guards)
    ├── app/                        # App Router Pages and Layouts
    │   ├── layout.tsx              # Root HTML wrapper: fonts, ThemeRegistry, PortalLayout
    │   ├── page.tsx                # Public Root Login page
    │   ├── login/page.tsx          # Re-export of root login page
    │   ├── portal/page.tsx         # Redirects /portal to /search
    │   ├── search/page.tsx         # Search Console page (renders GoogleMapView)
    │   ├── postcode-list/page.tsx  # Postcode directory with detail card
    │   ├── grid-engine/page.tsx    # Hierarchical tree explorer for grid cells
    │   ├── address-registry/page.tsx# Address list with slide-over edit/add drawers
    │   └── heatmap/page.tsx        # Heatmap analytics page (dynamic SSR-disabled)
    ├── components/                 # Reusable UI Components
    │   ├── address/                # Address registry dialogs, filters, and cards
    │   │   ├── AddAddressDialog.tsx
    │   │   ├── AddAddressMap.tsx
    │   │   ├── AddressDetailsCard.tsx
    │   │   ├── AddressRegistryFilter.tsx
    │   │   ├── AddressRegistryInlinePanel.tsx
    │   │   ├── BuildingDetailsCard.tsx
    │   │   └── index.ts
    │   ├── common/                 # Brand and SVG vector graphics
    │   │   ├── SevenXLogo.tsx
    │   │   ├── UaeMapGraphic.tsx
    │   │   └── index.ts
    │   ├── grid/                   # Postcode Grid Engine components
    │   │   ├── GridEngineStatsCards.tsx    # 4 KPI cards: Tier 1 (27), Tier 2 (100), Tier 3 (100), Tier 4 (100)
    │   │   ├── GridMatrixExplorer.tsx      # 10x10 matrix (00..99) with address density dots & legend
    │   │   ├── GridCellInspectorCard.tsx   # Right-pane inspector with Leaflet mini map & accordions
    │   │   ├── GridTableView.tsx           # Full-width data table view with pagination
    │   │   ├── GridCellDetailsCard.tsx
    │   │   ├── GridStatisticsPanel.tsx
    │   │   └── index.ts
    │   ├── heatmap/                # Leaflet-based density map component
    │   │   ├── HeatmapView.tsx
    │   │   └── index.ts
    │   ├── layout/                 # Shell chrome components
    │   │   ├── PortalLayout.tsx    # Header + Sidebar wrapper for authenticated views
    │   │   ├── Sidebar.tsx         # Dark blue gradient navigation bar
    │   │   ├── TopHeader.tsx       # 70px top bar with page title and user menu
    │   │   └── index.ts
    │   ├── map/                    # Map console components
    │   │   ├── GoogleMapView.tsx   # 3,200+ line primary console component
    │   │   ├── PostcodeMiniMap.tsx # Static/mini Leaflet view for cards
    │   │   └── index.ts
    │   ├── postcode/               # Postcode list and search detail panels
    │   │   ├── PostcodeDetailsCard.tsx     # Split-view details card with interactive map & accordions
    │   │   ├── PostcodeDetailsPanel.tsx
    │   │   ├── PostcodeStatisticsCards.tsx # 4 KPI cards: Total, Published, Masked, Emirates
    │   │   ├── PostcodeFilterDrawer.tsx    # Slide-over filter drawer (Emirates & Status)
    │   │   ├── PostcodeExpandedMapModal.tsx# Fullscreen modal with 10x10 subgrid (00..99) & tier bar
    │   │   └── index.ts
    │   └── index.ts                # Barrel export of all components
    ├── context/
    │   └── AuthContext.tsx         # React context for login, logout, session idle timer
    ├── data/                       # Local mock datasets and GeoJSON coordinates
    │   ├── addressRegistryData.ts  # Mock addresses for Address Registry
    │   ├── gridEngineData.ts       # Nested tree nodes for Grid Engine
    │   ├── heatmapData.ts          # Cell density grids and KPI metrics
    │   ├── portalSearchData.ts     # Search mock results, statistics, UAE boundary points
    │   ├── postcodeListData.ts     # Postcode list table records
    │   ├── uaeBuildings.ts         # Coordinates and details for landmark buildings
    │   ├── exact_cell_border.json  # Calibrated polygon points
    │   ├── fitted_border_coords.json
    │   ├── new_border_coords.json
    │   └── perfect_uae_coords.json
    ├── services/                   # HTTP API client and domain services
    │   ├── apiClient.ts            # Central fetch wrapper with retry and error sanitization
    │   ├── auth.ts                 # Authentication service (/api/auth/*)
    │   ├── googleMaps.ts           # Google Maps SDK loader, geocoder, and autocomplete
    │   ├── gridService.ts          # PostcodeGrid backend service (/api/grid/*)
    │   ├── postcodeService.ts      # Postcode search service (/api/postcodes/*)
    │   └── index.ts
    ├── store/                      # Redux Toolkit store
    │   ├── StoreProvider.tsx       # Redux Provider wrapper
    │   ├── hooks.ts                # useAppDispatch and useAppSelector typed hooks
    │   ├── index.ts                # Root store configuration
    │   └── slices/
    │       └── authSlice.ts        # Redux slice for current user state
    ├── styles/
    │   ├── globals.css             # Base styles, Leaflet overrides, pulse animations
    │   └── page.module.css
    ├── theme/
    │   ├── theme.ts                # MUI createTheme tokens (Primary #0000FF, Cairo, Space Grotesk)
    │   └── ThemeRegistry.tsx       # Material UI Next.js App Router cache provider
    └── utils/
        ├── security.ts             # HTML sanitization, coordinate bounds check, text sanitization
        └── securityLogger.ts       # Audit logging for security and authentication events
```

---

## 4. Module-by-Module Functionality

### 4.1. Authentication & Session Module
- **Route:** `/` and `/login` (via `src/app/page.tsx` and `src/app/login/page.tsx`)
- **Visual Design:** Split screen with Emirates Post Group branding on the left (interactive UAE SVG graphic, feature highlights) and a clean login form on the right.
- **Form Controls:** Username/email, password with show/hide toggle, "Remember Me" checkbox, and submit button.
- **Security & Session Policy:**
  - 15-minute inactivity auto-logout managed in `AuthContext.tsx` via user event listeners (`mousedown`, `keydown`, `scroll`, `touchstart`).
  - Auth cookies (`jwtToken`, `refreshToken`, `auth_session`) configured with `SameSite=Lax` and `Secure` (in HTTPS/production).
  - All login attempts, successes, failures, and timeouts are logged with `logSecurityEvent` in `securityLogger.ts`.
- **Implementation Status:** Fully implemented and integrated with the identity service gateway.

### 4.2. Search Console (Main GIS Map Portal)
- **Route:** `/search` (Legacy route `/portal` permanently redirects here)
- **Component:** `src/components/map/GoogleMapView.tsx` (rendered via `src/app/search/page.tsx`)
- **Key Features:**
  - **Full-Screen Interactive Map:** Leaflet map engine rendering UAE National Grid cells, unmasked regions, and satellite/street imagery.
  - **Live Search & Autocomplete:** Real-time dual search:
    1. Postcode prefix query via `postcodeService.searchPostcodes`.
    2. Google Places autocomplete via `getPlacePredictions` (restricted to UAE `country: "ae"`).
  - **Point Resolution on Click:** Clicking on any UAE map location triggers `gridService.resolvePoint({ lat, lon })` to resolve the 4-tier hierarchy, normalized coordinates, and postcode in real time.
  - **Grid Navigation & Breadcrumbs:** Visual breadcrumbs (`UAE (Tier 1)` → `Sector (Tier 2)` → `Block (Tier 3)` → `Plot (Tier 4)`). Clicking any cell drills down into its children via `gridService.getCellChildren`.
  - **Adjacent Cell Analysis:** Retrieves neighbor cells touching or crossing the selected cell via `gridService.getCellNeighbors`.
  - **Detail Panels:** Collapsible sidebar overlays for `GridStatisticsPanel` (fetching real-time grid metrics) and `PostcodeDetailsPanel` (displaying postal code metadata, lineage, and component breakdown).
- **Implementation Status:** Live API integration with graceful mock fallbacks and transient 502 retry handling.

### 4.3. Postcode List Module
- **Route:** `/postcode-list`
- **Page File:** `src/app/postcode-list/page.tsx`
- **Key Features:**
  - **KPI Statistics Cards (`PostcodeStatisticsCards.tsx`):** Displays 4 top-level KPI metrics above the table: Total Postcodes (`27`, `#0000FF`), Published Postcodes (`100`, `#3F8E50`), Masked Postcodes (`100`, `#D83731`), and Emirates (`7`, `#7E1BFE`).
  - **Search & Filter Drawer (`PostcodeFilterDrawer.tsx`):** Real-time search by postcode, coordinates, address, and status. Dedicated "Filter" button opens a right slide-over drawer to filter by Emirate and Status (`Published` / `Masked`).
  - **Data Table:** Lists postcodes with 4 colored tier chips (T1, T2, T3, T4), emirate tags, and status badges (`Published`, `Masked`).
  - **Master-Detail Split View (`PostcodeDetailsCard.tsx`):** Clicking any row transitions the view into a split layout with the interactive detail card on the right, featuring:
    - Postcode mailbox header, title, and status badge.
    - `Grid Level:` selector bar (`T1`, `T2`, `T3`, `T4`) with active royal blue border.
    - Interactive Leaflet mini map (`PostcodeMiniMap.tsx`) with 10x10 subgrid labels (00..99), target cell highlight, red pin, and full-screen expand button.
    - Accordions for **Grid Information** (Buildings, Units, Recipients), **Location Details** (Building, Location, Emirate, Area, Coordinates), and **Linked Records on This Postcode** (with sub-tabs for Buildings, Units, Recipients, Makani/Onwani).
  - **Expanded Map View Modal (`PostcodeExpandedMapModal.tsx`):** Full-screen interactive map modal with search bar, 10x10 subgrid overlay, floating grid level selector, and map controls.
  - **Pagination Bar:** Dual pagination controls featuring first/previous/next/last chevrons, numbered pages (`1`, `2`, `3`, `...`, `6`), and a "Page [X] of 10" dropdown selector.
- **Implementation Status:** Fully functioning UI matching Figma canvas `8086:52358`; powered by `src/data/postcodeListData.ts`. Ready to connect to `postcodeService.searchPostcodes` for server-side pagination.

### 4.4. Postcode Grid Engine Module
- **Route:** `/grid-engine`
- **Page File:** `src/app/grid-engine/page.tsx`
- **Key Features:**
  - **KPI Statistics Cards (`GridEngineStatsCards.tsx`):** Displays 4 top-level KPI cards matching Figma frame `8171:47190`: Tier 1 Grids (`27`, `#0000FF`, `UAE Total`), Tier 2 Grids (`100`, `#EB861F`, `Per T1 Grid`), Tier 3 Grids (`100`, `#3F8E50`, `Per T2 Grid`), and Tier 4 Grids (`100`, `#7E1BFE`, `Per T3 Grid`).
  - **Dual View Modes (Grid View vs. List View):** Toggled via top-right switch button (`element-3` vs `task-square` icons).
  - **Grid Lineage Selector Bar:** Interactive pills for `T1 (46)`, `T2 (45)`, `T3 (67)`, and `T4 (76)` with active blue border.
  - **Grid View (`GridMatrixExplorer.tsx` & `GridCellInspectorCard.tsx`):**
    - **10x10 Matrix Explorer:** Visualizes 100 cells (`00`..`99`) with address density indicators (green for high, orange for medium, red for low), diagonal hatched cells for non-UAE territory, and an interactive legend (Default, Selected, Outside UAE, UAE Borders, High Addresses, Medium, Low).
    - **Current Cell Inspector:** Displays active cell code (e.g. `46`), `T1 70 Km` badge, interactive Leaflet mini map with red pin and grid overlay, and two expandable accordions:
      1. `Postcodes on The Grid (140)`: Lists registered postcodes in the cell with tier chips.
      2. `Address on This grid, With Type Filters (4) (1,890)`: Interactive sub-filter tabs (`All`, `Buildings`, `Units`, etc.) and canonical addresses.
  - **List View (`GridTableView.tsx`):** Full-width data table matching Screenshot 2 with columns `Full ID`, `Cell`, `Parent`, `Level`, `North`, `South`, `West`, `East`, and `Size` (`70*70 Km`), paired with dual pagination controls (`<< < 1 2 3 ... 6 > >> Page [ 1 v ] of 10`).
  - **Full-Screen Map Modal (`PostcodeExpandedMapModal.tsx`):** Expands the cell's spatial view into a full-screen interactive Leaflet map.
- **Implementation Status:** Fully implemented matching Figma frames `8170:44740` & `8176:53392`; backed by `src/data/gridMatrixCells.ts` and `src/data/gridEngineData.ts`. Ready to connect to `gridService.getCells`.

### 4.5. Address Registry Module
- **Route:** `/address-registry`
- **Page File:** `src/app/address-registry/page.tsx`
- **Key Features:**
  - **Address Table:** Displays Address ID (`VA-2026-XXXX`), label, classification (`Building`, `Unit`, `Individual Recipient`, `Land / Plot`, `Facility`), Makani number, Onwani code, status, and emirate.
  - **Filter Drawer (`AddressRegistryFilter.tsx`):** Filter by Tier 1-4 codes, emirate, classification type, and verification status.
  - **Inline View/Edit Panel (`AddressRegistryInlinePanel.tsx`):** Slide-over panel to view address details, building info (`BuildingDetailsCard`), and edit properties.
  - **Add Address Slide-Over Dialog (`AddAddressDialog.tsx`):** Interactive modal with embedded interactive map (`AddAddressMap.tsx`), tier cell picker, coordinate validation (`validateCoordinates`), and security auditing (`logSecurityEvent`).
- **Implementation Status:** Client-side state management backed by `src/data/addressRegistryData.ts`. Changes update local state in real time. Backend address CRUD endpoints can be attached when available.

### 4.6. Heatmap & Analytics Module
- **Route:** `/heatmap`
- **Page File:** `src/app/heatmap/page.tsx`
- **Component:** `src/components/heatmap/HeatmapView.tsx` (dynamically imported with `ssr: false`)
- **Key Features:**
  - **Tiered Density Map:** Visualizes 4 tiers of grid rectangles color-coded across 6 density levels (`Minimal`, `Low`, `Medium-Low`, `Medium`, `High`, `Peak`).
  - **Metric Toggle:** Toggle between "Total Deliveries", "Repeat Delivery Rate", and "Unstructured Address Rate".
  - **KPI Cards:** Top-level metrics for Deliveries (6.45M), Postcodes (2,567), Active Grid Cells (18,567), Repeat Attempts (17.0%), and Unstructured Addresses (45.0%).
  - **Filter Drawer:** Right-sliding drawer to filter by postcode, area, tier, emirate, property type, and delivery attempts.
- **Implementation Status:** Fully implemented client-side GIS simulation with Leaflet vector rectangles.

---

## 5. Routing & Navigation Map

```
/ (Root)
│
├── GET / ────────────────────────── Public Login Page (Redirects to /search if authed)
├── GET /login ───────────────────── Re-export of / (Login)
│
├── (Protected Routes via src/proxy.ts)
│   ├── GET /search ──────────────── Main GIS Search Console (GoogleMapView)
│   ├── GET /portal ──────────────── Redirects permanently to /search
│   ├── GET /portal/* ────────────── Redirects to /* (legacy backward compatibility)
│   ├── GET /postcode-list ───────── Postcode Listing & Inspection
│   ├── GET /grid-engine ─────────── Grid Hierarchy Explorer
│   ├── GET /address-registry ────── Address Management & Registration
│   └── GET /heatmap ─────────────── Density & Performance Analytics
│
└── Next.js API Proxy Rewrites (configured in next.config.ts)
    ├── /api/auth/:path* ─────────── Forwarded to https://identity-service-qh42.onrender.com/api/auth/:path*
    ├── /api/:path* ──────────────── Forwarded to https://epg-post-dev-gateway.onrender.com/api/:path*
    └── /health/:path* ───────────── Forwarded to https://epg-post-dev-gateway.onrender.com/health/:path*
```

---

## 6. API Integration Reference

All backend communications flow through `apiClient.ts` with automatic bearer token insertion, cookie synchronization, and error sanitization.

### 6.1. Authentication Service (`src/services/auth.ts`)
| Endpoint | Method | Purpose | Request Body | Response Structure |
|---|---|---|---|---|
| `/api/auth/login` | `POST` | User login | `{ username, email?, password, rememberMe }` | `LoginResponse` (`jwtToken`, `refreshToken`, `refreshTokenExpiresOn`, `id`, `userName`, `email`) |
| `/api/auth/me` | `GET` | Get profile & roles | None (Bearer header) | `MeResponse` (`userId`, `userName`, `email`, `roles[]`, `permissions[]`, `isAdmin`) |
| `/api/auth/logout` | `POST` | Terminate session | `{}` | `LogoutResponse` (`success`, `message`) |
| `/api/auth/refresh-token` | `POST` | Refresh expired JWT | `{ refreshToken }` | `RefreshTokenResponse` (`jwtToken`, `refreshToken`, `refreshTokenExpiresOn`) |

### 6.2. Postcode Grid Service (`src/services/gridService.ts`)
| Endpoint | Method | Purpose | Parameters / Payload | Response Structure |
|---|---|---|---|---|
| `/api/grid/resolve` | `POST` | Resolve point coordinates | `{ lat: number, lon: number, srid?: number }` | `BaseResponse<ResolvePointResponse>` (`status`, `cell`, `hierarchy[]`, `postcode`, `postcodeDisplay`, `normalized`) |
| `/api/grid/resolve/batch` | `POST` | Batch resolve points | `ResolveBatchItemRequest[]` | `BaseResponse<ResolveBatchResponse>` |
| `/api/grid/cells` | `GET` | Fetch GeoJSON cells | `params: { tier, parentId, bbox, code, emirate, Page, PageSize }` | `BaseResponse<GeoJsonFeatureCollection>` |
| `/api/grid/cells/{id}` | `GET` | Cell detail by UUID | Path `id: string` | `BaseResponse<GridCellDetailDto>` |
| `/api/grid/cells/by-code/{code}` | `GET` | Cell detail by code | Path `code: string`, param `includeHierarchy=true` | `BaseResponse<GridCellDetailDto>` |
| `/api/grid/cells/by-codes` | `GET` | Multiple cells by codes | `params: { codes: "46,47,48" }` | `BaseResponse<GeoJsonFeatureCollection>` |
| `/api/grid/cells/{id}/children` | `GET` | Sub-cells of parent | Path `id: string`, params `{ Page, PageSize }` | `BaseResponse<GeoJsonFeatureCollection>` |
| `/api/grid/cells/{id}/neighbors` | `GET` | Adjacent touching cells | Path `id: string` | `BaseResponse<NeighborCellDto[]>` |
| `/api/grid/statistics` | `GET` | Grid cell statistics | `params: { emirate?, code? }` | `BaseResponse<GridStatisticsDto>` |
| `/api/grid/tiers` | `GET` | Available tier list | None | `BaseResponse<unknown>` |
| `/health/grid` | `GET` | Gateway health check | None | `BaseResponse<string>` |

### 6.3. Postcode Directory Service (`src/services/postcodeService.ts`)
| Endpoint | Method | Purpose | Parameters / Payload | Response Structure |
|---|---|---|---|---|
| `/api/postcodes` | `GET` | Search postcodes | `params: { search, emirate, bbox, Page, PageSize }` | `BaseResponse<PostcodeRowDto[]>` |
| `/api/postcodes/{postcode}` | `GET` | Postcode detail & grid | Path `postcode: string` | `BaseResponse<GridCellDetailDto>` |

---

## 7. Authentication, Authorization & Security Architecture

### 7.1. Edge Proxy Route Protection (`src/proxy.ts`)
Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. The proxy function executes before routing:
- Strips sensitive query parameter tokens (`token`, `access_token`, `apikey`, `secret`) to prevent token leakage in browser history or referrer headers.
- Inspects `AUTH_COOKIE_KEYS` for an active session.
- Protects prefixes: `/search`, `/heatmap`, `/address-registry`, `/grid-engine`, `/postcode-list`, `/portal`.
- Redirects unauthenticated requests to `/?from={pathname}`.
- Redirects authenticated visitors on `/` directly to `/search`.
- Injects strict security response headers:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### 7.2. Client-Side Session & State Flow
1. User logs in at `/` via `authService.login`.
2. Response token is stored in cookies via `setAuthTokens` with `SameSite=Lax` and `Secure`.
3. User profile is retrieved via `authService.getMe()` and stored in Redux (`authSlice`).
4. Inactivity watcher triggers after 15 minutes without mouse/touch/keyboard interactions, cleans cookies, and redirects to `/?reason=inactivity`.
5. User clicks logout in `TopHeader` or `Sidebar`, calling `authService.logout()`, clearing all cookies, and navigating to `/`.

### 7.3. Audit Logging (`src/utils/securityLogger.ts`)
All security-relevant actions are formatted into structured audit logs (`StructuredSecurityLog`):
- Action types: `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILURE`, `AUTH_LOGOUT`, `AUTH_SESSION_INACTIVITY_TIMEOUT`, `ACCESS_CONTROL_FAILURE`, `FEATURE_CREATE`, `FEATURE_EDIT`, `INPUT_VALIDATION_FAILURE`.
- Sensitive fields (passwords, tokens, api keys) are automatically sanitized and replaced with `[REDACTED]`.

---

## 8. Shared Components, Theme & Design Conventions

### 8.1. Color Palette Tokens (`src/theme/theme.ts`)
- **Primary Brand Royal Blue:** `#0000FF` (Figma specification)
- **Primary Dark:** `#0000CC`, **Primary Light:** `#3333FF`
- **Sidebar Gradient:** `linear-gradient(180deg, #081D40 0%, #0E2555 100%)`
- **Background Default:** `#F0F6FC`, **Paper Surface:** `#FFFFFF`
- **Page Container Surface:** `#F9FBFD`
- **Text Primary:** `#101828`, **Text Secondary:** `#6A7282`, **Muted / Placeholder:** `#919191`
- **Divider:** `#DEDEDE`
- **Status Colors:**
  - `Verified`: Green `#16A34A` / bg `rgba(22, 163, 74, 0.1)`
  - `Pending`: Amber `#D97706` / bg `rgba(217, 119, 6, 0.1)`
  - `Restricted`: Red `#DC2626` / bg `rgba(220, 38, 38, 0.1)`
  - `Unverified`: Slate `#64748B` / bg `rgba(100, 116, 139, 0.1)`

### 8.2. Component Organization
All components are organized into feature subfolders under `src/components/` and re-exported via root and subfolder `index.ts` barrel files:
- `layout/`: `PortalLayout`, `Sidebar` (236px width), `TopHeader` (70px height).
- `map/`: `GoogleMapView`, `PostcodeMiniMap`.
- `address/`: `AddAddressDialog`, `AddAddressMap`, `AddressRegistryFilter`, `AddressRegistryInlinePanel`, `AddressDetailsCard`, `BuildingDetailsCard`.
- `grid/`: `GridStatisticsPanel`, `GridCellDetailsCard`.
- `heatmap/`: `HeatmapView`.
- `postcode/`: `PostcodeDetailsCard`, `PostcodeDetailsPanel`.
- `common/`: `SevenXLogo`, `UaeMapGraphic`.

---

## 9. Data Models & TypeScript Interfaces

### Key Interfaces
- **`GridCellProperties` (`src/services/gridService.ts`):**
  `{ id?, gridId?, tier?, code?, hierarchyCode?, parentGridId?, name?, nameEn?, nameAr?, postcodeCount?, childCount?, isMasked?, emirate?, emirateCode? }`
- **`ResolvePointResponse` (`src/services/gridService.ts`):**
  `{ status: string, cell?: GridCellProperties, hierarchy?: HierarchyItemDto[], postcode?: string, postcodeDisplay?: string, normalized?: { lat, lon } }`
- **`GridStatisticsDto` (`src/services/gridService.ts`):**
  `{ tiers?, postcodeCount?, maskedCellCount?, unmaskedCellCount?, buildingCount?, addressCount?, unitCount?, makaniListedCount?, makaniMappedCount?, onwaniListedCount?, onwaniMappedCount?, verifiedAddressCount?, buildingCoveragePercent? }`
- **`AddressRegistryItem` (`src/data/addressRegistryData.ts`):**
  `{ id, addressId, addressLabel, classType, makani, onwani, status, emirate, postcode?, t1?, t2?, t3?, t4?, unitNumber?, buildingName?, area?, latitude?, longitude? }`
- **`PostcodeItem` (`src/data/postcodeListData.ts`):**
  `{ id, postcode, emirate, subtitle, status, chips: { tier1, tier2, tier3, tier4 }, lat, lng }`
- **`SearchResultItem` (`src/data/portalSearchData.ts`):**
  `{ id, name, type, status, addressLine, postCode, tiers: { tier1..tier4 }, latitude, longitude, makaniNumber, onwaniAddress, coordinates, buildingName, addressType, addressIdentifier, floors, units, street, areaLocality, emirateAdminArea, countryCode, countryName, lastUpdate, gridLineage }`

---

## 10. Environment Configuration

The application requires the following environment variables (stored in `.env.local` for local execution and injected into deployment runtime):

| Variable Name | Required | Purpose | Example / Notes |
|---|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JS SDK Key for Places Autocomplete & Geocoding | Must have HTTP Referrer restrictions configured for local & production domains. |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL for Identity and PostcodeGrid services | e.g. `https://epg-post-dev-gateway.onrender.com` |
| `API_PROXY_TARGET` | Optional | Server-side rewrite target used by Next.js `rewrites()` in `next.config.ts` | Defaults to `NEXT_PUBLIC_API_BASE_URL` if omitted. |

> [!CAUTION]
> Never commit actual API keys or secret tokens to Git. Keep `.env.local` in `.gitignore`.

---

## 11. Known Issues, Technical Debt & Incomplete Work

### Verified Issues
1. **Lint Warnings / Errors in `GoogleMapView.tsx`:**
   - Line 1295 accesses `handleSelectItem` inside the Leaflet map click listener before its definition at line 1325 (`react-hooks/immutability`).
   - Unused imports (`MyLocationIcon`, `RefreshIcon`) and `any` types on event handlers.
   - Stray comment syntax in JSX children on lines 2139 and 3150.
2. **ESLint Hook Warnings in Address & Grid Dialogs:**
   - Synchronous `setState` within `useEffect` when pre-populating form state in `AddAddressDialog.tsx`, `AddressRegistryInlinePanel.tsx`, and `GridStatisticsPanel.tsx`.
3. **Mock Data Reliance in Sub-Modules:**
   - `address-registry/page.tsx` uses in-memory mock data from `addressRegistryData.ts`. When the backend Address CRUD endpoints become available on the Gateway, this should be wired to live API calls.
   - `grid-engine/page.tsx` uses static tree data from `gridEngineData.ts`. It can be wired to `gridService.getCells({ tier: 1 })` and `gridService.getCellChildren(parentId)`.
   - `postcode-list/page.tsx` uses `postcodeListData.ts`. Can be integrated with server-side pagination via `postcodeService.searchPostcodes`.
4. **Free-Tier Render Instance Wake-Up Latency:**
   - The backend gateway hosted on Render occasionally spins down when idle, returning initial 502/503 responses. `apiClient.ts` has automatic exponential retry logic, and `GoogleMapView.tsx` displays user-friendly service notices.
5. **No Automated Test Suite:**
   - The project currently has no Jest/Vitest or React Testing Library suites configured.

---

## 12. Build, Development, Lint & Test Commands

Run all scripts via Windows cmd prompt or standard shell:

- **Run Dev Server:**
  ```bash
  npm run dev
  ```
  Accessible at `http://localhost:3000`.
- **Run Production Build:**
  ```bash
  npm run build
  ```
- **Start Production Server:**
  ```bash
  npm run start
  ```
- **Type Checking:**
  ```bash
  cmd /c npx tsc --noEmit
  ```
  (Compiles cleanly with 0 TypeScript errors).
- **Run Linter:**
  ```bash
  npm run lint
  ```

---

## 13. Important Implementation Decisions & Constraints

1. **Next.js 16 Edge Proxy Pattern:**
   Do not revert `src/proxy.ts` to `middleware.ts`. Next.js 16 explicitly deprecates `middleware.ts` and uses `export function proxy(request: NextRequest)` in `src/proxy.ts`.
2. **Material UI v9 Next.js Integration:**
   All styling is wrapped through `AppRouterCacheProvider` in `src/theme/ThemeRegistry.tsx` to ensure zero-FOUC (Flash of Unstyled Content) with SSR.
3. **Dual Map Architecture (Leaflet + Google Maps API):**
   - **Leaflet** is used for the interactive GIS surface: drawing custom raster tile layers, rendering complex multi-polygon boundaries, coloring density cells, and handling click-to-resolve.
   - **Google Maps JS API** is used specifically as an auxiliary service for Places Autocomplete and reverse geocoding inside the search bar.
4. **Security & Input Sanitization:**
   Any coordinate received from user inputs or query parameters must be validated using `validateCoordinates()` from `src/utils/security.ts` to ensure it falls within the UAE geographic bounding box (`lat: 21.0-27.8, lng: 50.0-57.2`). All error messages presented in the UI must pass through `sanitizeErrorMessage()`.

---

## 14. Current Project Status & Recommended Next Steps

### Current Status
- **Architecture & Infrastructure:** Modern, cleanly organized into modular folders with TypeScript strict typing, Redux Toolkit, and Next.js 16 App Router.
- **Search Console:** Fully interactive with live API connection to `epg-post-dev-gateway.onrender.com` for grid cells, hierarchy resolution, and statistics.
- **Auth & Security:** Complete login/logout lifecycle with session inactivity timer and Edge proxy route protection.
- **UI & Design:** High fidelity matching Figma specifications, Space Grotesk and Cairo typography, responsive layouts.

### Recommended Next Actions (Pending User Authorization)
1. **Clean up Linter Diagnostics:**
   Resolve the declaration ordering of `handleSelectItem` in `GoogleMapView.tsx` and fix JSX comment syntax to achieve a completely clean `npm run lint`.
2. **Wire Address Registry to Backend:**
   Replace the local mock state in `src/app/address-registry/page.tsx` with live CRUD service calls once the backend address endpoints are ready on the gateway.
3. **Server-Side Pagination for Postcode List:**
   Connect `src/app/postcode-list/page.tsx` to `postcodeService.searchPostcodes` with page and page size query parameters.
4. **Dynamic Grid Engine Tree:**
   Update `src/app/grid-engine/page.tsx` to load Tier 1 cells via `gridService.getCells({ tier: 1 })` and lazy-load child tiers on expand.
5. **Add Automated Unit & Integration Tests:**
   Introduce Vitest and React Testing Library to test `apiClient`, `validateCoordinates`, and key component renderings.
