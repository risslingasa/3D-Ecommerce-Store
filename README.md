# LUNO® — Organic Kids' Basics Storefront

A minimalist direct-to-consumer e-commerce storefront for **LUNO®**, featuring an interactive rotating garment ring hero, a filterable organic-cotton catalog for ages 1–6, a full product detail view with an interactive size guide, and Firebase-backed Google Sign-In with persistent shopping bags and order history.

---

## Highlights

- **Interactive Rotating Garment Ring Hero**
  - Six floating garments orbiting smoothly at 60fps (`requestAnimationFrame`) with continuous left-to-right front motion, perspective scaling, and outward lean.
  - Mouse and touch drag with inertia fling that blends seamlessly back into auto-rotation.
  - Click or keyboard activation smoothly transitions any garment into an inline product view with four live colourway cross-fades (**Peach**, **Pink**, **Sage**, **Butter**) and a 25-keyframe quadratic Bézier fly-to-bag animation.
  - Responsive desktop, portrait mobile, and landscape mobile layouts, plus full `prefers-reduced-motion` support.
- **Scrollable Editorial Storefront**
  - Filterable **The Basics** collection by garment silhouette (*Rompers, Dungarees, Long-sleeve tees, Cardigans, Bucket hats*) and colourway, with inline colour previews and quick-add controls.
  - **Organic Cotton & Craft** editorial section showcasing materials, garment-dyed tones, and construction details.
- **Full Product Detail View & Interactive Size Guide**
  - Contiguous purchase module with age-scoped size selectors, colourway switching, fabric/care/fit accordions, and companion garment pairings.
  - Interactive **Size & Fit Guide** with live `cm / in` conversion and a height slider recommender that applies the suggested size directly to the active garment.
- **Shopping Bag, Checkout & Order History (Firebase)**
  - Slide-over shopping bag with complimentary shipping progress, quantity steppers, and a validated checkout flow.
  - **Google Sign-In** automatically merges guest bag items into Cloud Firestore and unlocks real-time bag sync and immutable order receipts with one-click reordering.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Typography**: Google Sans & Google Sans Flex
- **Backend & Persistence**: Firebase Authentication (Google Sign-In) & Cloud Firestore
- **Security & Linting**: Hardened `firestore.rules` validated with `@firebase/eslint-plugin-security-rules`

---

## Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- A Firebase project with **Authentication (Google provider)** and **Cloud Firestore** enabled

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment & Firebase

1. Copy `.env.example` to `.env.local` if you plan to add server-side secrets (never commit `.env.local` or real API keys):
   ```bash
   cp .env.example .env.local
   ```
2. Provide your Firebase web app configuration in `firebase-applet-config.json`:
   ```json
   {
     "projectId": "your-firebase-project-id",
     "appId": "your-firebase-app-id",
     "apiKey": "your-firebase-web-api-key",
     "authDomain": "your-firebase-project-id.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "your-firebase-project-id.firebasestorage.app",
     "messagingSenderId": "your-messaging-sender-id"
   }
   ```
3. In the **Firebase Console**:
   - Enable **Google** under **Authentication → Sign-in method**.
   - Add your local (`localhost`) and production hostnames under **Authentication → Settings → Authorized domains**.
   - Deploy `firestore.rules` to your Firestore database.

### 3. Run Locally

```bash
npm run dev
```

The development server runs at `http://localhost:3000`.

### 4. Type-Check, Lint Rules & Build

```bash
# TypeScript check
npm run lint

# Lint Firestore security rules
npx eslint firestore.rules

# Production build
npm run build
```

---

## Firestore Data Structure & Security

All customer data is strictly isolated per authenticated user (`request.auth.uid == userId` with verified email):

- `users/{userId}` — Private customer profile (`uid`, `displayName`, `email`, server timestamps).
- `users/{userId}/cart/{lineId}` — Persisted shopping bag line items with strict field and quantity bounds (`1–20`).
- `users/{userId}/orders/{orderId}` — Immutable confirmed order receipts (`status: "confirmed"`, bounded line items, validated shipping fields; client updates and deletes denied).

---

## Project Structure

```text
├── index.html                   # Document metadata & Google Sans font imports
├── firestore.rules              # Owner-isolated Firestore security rules
├── firebase-blueprint.json      # Schema blueprint for profiles, carts, and orders
├── .env.example                 # Placeholder-only environment template
└── src/
    ├── App.tsx                  # Root layout, shared SVG #clean filter, overlays
    ├── index.css                # Design tokens, Tailwind CSS, hero ring scaling
    ├── lib/firebase.ts          # Firebase Auth & Firestore SDK setup
    ├── data/catalog.ts          # Garment catalog, sprite coordinates & size chart
    ├── context/StoreContext.tsx # Auth, Firestore sync, guest cart merge & UI state
    └── components/
        ├── HeroRing.tsx         # Rotating 6-garment ring & Bézier fly-to-bag
        ├── StickyHeader.tsx     # Post-hero navigation bar
        ├── CatalogSection.tsx   # Filterable collection grid
        ├── CraftSection.tsx     # Organic cotton craft story & footer
        ├── ProductDetailModal.tsx
        ├── SizeGuideModal.tsx
        ├── BagDrawer.tsx
        ├── OrdersDrawer.tsx
        ├── MenuDrawer.tsx
        └── ErrorBoundary.tsx
```

---

## License

MIT
