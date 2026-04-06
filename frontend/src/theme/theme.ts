import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "var(--brand-blue)" as any,
    },
    background: {
      default: "var(--brand-black)",
      paper: "var(--brand-dark)",
    },
    text: {
      primary: "var(--text-main)",
      secondary: "var(--text-muted)",
    },
    success: { main: "var(--color-route-safest)" },
    info: { main: "var(--color-route-fastest)" },
    warning: { main: "var(--color-route-alt)" },
    error: { main: "var(--color-marker-end)" },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiFilledInput-root": {
            backgroundColor: "var(--brand-slate)",
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
