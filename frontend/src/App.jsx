import "./App.css";
import ShelterMap from "./components/ShelterMap";
import { LocationProvider } from "./context/LocationContext";

function App() {
  return (
    <LocationProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>Israel Safe Zone</h1>
        </header>

        <main className="map-wrapper">
          <ShelterMap />
        </main>

        <footer className="app-footer">
          <small>Data provided by GovMap Israel • Emergency Services</small>
        </footer>
      </div>
    </LocationProvider>
  );
}

export default App;
