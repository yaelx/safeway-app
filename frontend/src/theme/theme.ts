import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4dabf5",
    },
    background: {
      default: "#080808",
      paper: "#101010",
    },
    text: {
      primary: "#ffffff",
      secondary: "#94a3b8",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiFilledInput-root": {
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            "&:hover": { backgroundColor: "#222" },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    },
  },
});
