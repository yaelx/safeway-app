import "./App.css";
import "./index.css";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme/theme";
import { LocationProvider } from "./context/LocationContext";
import { RoutingProvider } from "./context/RoutingContext";
import { router } from "./routes";

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <LocationProvider>
        <RoutingProvider>
          <RouterProvider router={router} />
        </RoutingProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}

export default App;
