import "./App.css";
import ShelterMap from "./components/ShelterMap";

function App() {
  return (
    <div className="app-container">
      {/* Header for context */}
      <header className="app-header">
        <h1>Israel Safe Zone</h1>
        <p>Click the map to find nearby public shelters</p>
      </header>

      {/* Main Map Section */}
      <main className="map-wrapper">
        <ShelterMap />
      </main>

      {/* Footer / Status Bar */}
      <footer className="app-footer">
        <small>Data provided by GovMap Israel • Emergency Services</small>
      </footer>
    </div>
  );
}

export default App;
