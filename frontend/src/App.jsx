import "./App.css";
import ShelterMap from "./components/ShelterMap";
import { LocationProvider } from "./context/LocationContext";

function App() {
  return (
    <LocationProvider>
      <ShelterMap />
    </LocationProvider>
  );
}

export default App;
