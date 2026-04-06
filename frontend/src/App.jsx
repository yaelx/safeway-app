import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme/theme";
import ShelterMap from "./components/ShelterMap";
import { LocationProvider } from "./context/LocationContext";
import { RoutingProvider } from "./context/RoutingContext";
import { ContactPage } from "./pages/ContactPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { AboutPage } from "./pages/AboutPage";
import { MainLayout } from "./pages/MainLayout";

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <LocationProvider>
        <RoutingProvider>
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<ShelterMap />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Routes>
            </MainLayout>
          </Router>
        </RoutingProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}

export default App;
