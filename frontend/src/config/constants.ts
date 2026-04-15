export const API_ENDPOINTS = {
  SHELTERS_IN_BOUNDS: "/api/shelters/in-bounds",
  SAFE_ROUTE: "/api/get-safe-route",
  GET_ABLY_TOKEN: "/api/auth/ably-token",
  CONTACT_FORM: "/api/contact",
  GOV_MAP: "https://www.govmap.gov.il/govmap/api/govmap.api.js?token=",
};

export const MAP_CONFIG = {
  DEFAULT_CENTER: [32.0853, 34.7818] as [number, number],
  DEFAULT_ZOOM: 14,
  MIN_DISCOVERY_ZOOM: 12,
  DISCOVERY_DELAY: 800,
};

export const BUTTON_TEXT = {
  FIND_SAFE_ROUTE: "Find Safest Route",
  CALCULATING_SAFETY: "Calculating Safety...",
};

export const COLORS = {
  SAFE: "#2ecc71",
  WARNING: "#f39c12",
  USER_BLUE: "#4285F4",
  SHELTER_BLUE: "#0288d1",
};

export const RouteColors = {
  Safest: "var(--color-route-safest)",
  Fastest: "var(--color-route-fastest)",
  Alternative: "var(--color-route-alt)",
};
export const RouteColorsArray = Object.values(RouteColors);

export const MarkerColors = {
  Start: "var(--color-marker-start)",
  End: "var(--color-marker-end)",
};

export const SHELTER_COLORS = {
  OFFICIAL: "#1976d2", // Deep Blue for Prisma DB
  COMMUNITY: "#7b1fa2", // Purple for OSM/Community
  ROUTE_SAFE: "#2e7d32", // Green for Python-verified points
  PUBLIC_SHELTER: "#1976d2",
  SCHOOL: "#e06819ff",
  PARKING: "#83da1f85",
  PROTECTED_SPACE: "#f54de1ff",
  CARMELIT: "#120fdeff",
  default: "#757575", // Grey for unknown types
};

// ─── UnifiedShelterMarker ────────────────────────────────────────────────────
export const UnifiedShelterMarkerStrings = {
  DefaultShelterName: "Shelter",
  OfficialShelter: "✅ Official Shelter",
  CommunityShelter: "📍 Community Shelter",
};

export const TileLayerUrl =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// ─── Footer ──────────────────────────────────────────────────────────────────
export const FooterStrings = {
  Copyright: `© ${new Date().getFullYear()} SafeWay Israel. All rights reserved.`,
  NavLinks: ["Privacy", "Terms"] as const,
};

// ─── NavigationPanel ─────────────────────────────────────────────────────────
export const NavigationPanelStrings = {
  RouteLabel: "Route",
  MinsUnit: "mins",
  RouteModeRecommended: "Recommended",
  RouteModeAlternative: "Alternative",
  RouteModeFastest: "Fastest",
  ShelterSummaryLabel: "Unique Shelters",
  ShelterSummaryTrail: "along this trajectory.",
  BtnGoogleMaps: "Navigate with Google Maps",
  BtnWaze: "Open in Waze",
};

// ─── RouteResultsSheet ───────────────────────────────────────────────────────
export const RouteResultsSheetStrings = {
  BtnRoutesSummary: "Routes Found. Tap to compare.",
  BtnDismiss: "Dismiss",
};

// ─── SafetySidebar ───────────────────────────────────────────────────────────
export const SafetySidebarStrings = {
  LabelSafestRoute: "Safest Route",
  LabelAlternative: "Alternative",
  LabelPathSafety: "Path Safety",
  WarningExposureGaps: "Route has exposure gaps",
};

// ─── SearchInputWrapper ──────────────────────────────────────────────────────
export const SearchInputWrapperStrings = {
  YourLocation: "Your location",
  RecentDestinations: "Recent Destinations",
};

// ─── TripSearch ──────────────────────────────────────────────────────────────
export const TripSearchStrings = {
  PlaceholderFrom: "From...",
  PlaceholderWhereTo: "Where to?",
  PillPlanRoute: "Plan safe route...",
  PillTapToCompare: "Tap lines on map to compare",
  PillRoutesFound: "Routes Found",
  HeaderRoutePlanner: "Route Planner",
  LoadingAnalyzing: "Analyzing route...",
  LoadingStillWorking: "Still working... Calculating the safest path.",
  CurrentLocation: "Current Location",
};

// ─── MainLayout ──────────────────────────────────────────────────────────────
export const MainLayoutStrings = {
  AppName: "SafeWay",
  MenuItemMap: "Map",
  MenuItemAbout: "About",
  MenuItemContact: "Contact",
  MenuItemPrivacy: "Privacy",
  MenuItemTerms: "Terms",
};

// ─── AboutPage ───────────────────────────────────────────────────────────────
export const AboutPageStrings = {
  Title: "About SafeWay",
  Subtitle: "Intelligence-Driven Safety Navigation",
  MissionStatement:
    'SafeWay was developed to bridge the gap between static shelter maps and real-time navigation needs. Focusing initially on the Haifa and Krayot regions, the platform calculates the "Safety Score" of a route based on the density and proximity of public shelters.',
  Cards: [
    {
      Title: "The Problem",
      Desc: "Static maps tell you where a shelter is, but they don't help when you are in motion. SafeWay solves the 'dynamic exposure' problem.",
    },
    {
      Title: "The Engineering",
      Desc: "Built with a Python logic tier that processes Multi-Level Dijkstra (MLD) routing to evaluate safety metrics in milliseconds.",
    },
    {
      Title: "The Vision",
      Desc: "Our goal is to provide peace of mind for residents of the North, ensuring that every journey is calculated with safety as the first priority.",
    },
  ],
};

// ─── ContactPage ─────────────────────────────────────────────────────────────
export const ContactPageStrings = {
  Title: "Contact",
  Subtitle: "Have a question or feedback? Reach out below.",
  PreferredContactHeading: "Preferred Contact",
  BtnLinkedIn: "Connect on LinkedIn",
  LinkedInUrl: "https://www.linkedin.com/in/yaelsa",
  SendMessageHeading: "Send a Message",
  FieldLabelName: "Name",
  FieldPlaceholderName: "Your name",
  FieldLabelEmail: "Email",
  FieldPlaceholderEmail: "you@example.com",
  FieldLabelMessage: "Message",
  FieldPlaceholderMessage: "How can I help?",
  BtnSendMessage: "Send Message",
};

// ─── PrivacyPage ─────────────────────────────────────────────────────────────
export const PrivacyPageStrings = {
  Title: "Privacy Policy",
  DataCollectionHeading: "What Data We Collect",
  DataCollectionBody:
    'SafeWay is designed with "Privacy by Design." We do not require accounts, names, or phone numbers to use the mapping features.',
  TechDataHeading: "Technical Data Processing:",
  DataItems: [
    {
      Primary: "Anonymized Routing Requests",
      Secondary:
        "When you request a route, coordinates are sent to our logic server. These are not stored permanently or linked to your identity.",
    },
    {
      Primary: "Security Logs & Rate Limiting",
      Secondary:
        "We use Upstash (Redis) to store temporary request counts per IP address to prevent DDoS attacks. This data expires automatically within 24 hours.",
    },
    {
      Primary: "Google Maps API",
      Secondary:
        "The map interface uses Google Maps. Their privacy policy applies to the interaction with the map tile data.",
    },
  ],
  ThirdPartyHeading: "Third-Party Services",
  ThirdPartyBody:
    "Our infrastructure is hosted on Vercel (Frontend/Orchestrator) and Google Cloud (Python Logic Server). These providers may log basic metadata (IP, Browser version) for security and maintenance purposes.",
  FootnoteBody:
    "For privacy inquiries or to request data deletion (for the Contact form), please reach out via the Contact page.",
};

// ─── TermsPage ───────────────────────────────────────────────────────────────
export const TermsPageStrings = {
  Title: "Terms of Use",
  LastUpdated: "Last Updated: April 2026",
  Section1Heading: "1. Purpose of Service",
  Section1Body:
    'SafeWay is a research and development project designed to visualize public shelter locations and safe routing. It is provided "as-is" for informational and educational purposes only.',
  Section2Heading: "2. Emergency Disclaimer",
  Section2Body:
    "DO NOT rely solely on this application during a real-time emergency. Always prioritize instructions from the Home Front Command (Pikud HaOref) and official sirens. Accuracy of shelter availability, real-time accessibility, or physical condition is not guaranteed.",
  Section2Bold:
    "DO NOT rely solely on this application during a real-time emergency.",
  Section3Heading: "3. Prohibited Use",
  Section3Body:
    'Users may not attempt to scrape, reverse engineer, or "spam" the API endpoints. Strict security measures, including Rate Limiting and CORS protections, are in place to ensure system stability and prevent abuse.',
  Section4Heading: "4. Limitation of Liability",
  Section4Body:
    "The developer (Yael) shall not be held liable for any injuries, damages, or losses resulting from the use of, or the inability to use, this application. By using SafeWay, you acknowledge that you do so at your own risk.",
};

// ─── TripMarkers ─────────────────────────────────────────────────────────────
export const TripMarkersStrings = {
  PopupStartPoint: "Start Point",
  PopupEndPoint: "Destination",
};

// ─── UserMarker ──────────────────────────────────────────────────────────────
export const UserMarkerStrings = {
  PopupYouAreHere: "You are here",
};
