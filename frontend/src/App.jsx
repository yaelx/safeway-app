import "./App.css";
import ShelterMap from "./components/ShelterMap";
import { LocationProvider } from "./context/LocationContext";
import { RoutingProvider } from "./context/RoutingContext";

function App() {
  return (
    <LocationProvider>
      <RoutingProvider>
        <ShelterMap />
      </RoutingProvider>
    </LocationProvider>
  );
}

export default App;
