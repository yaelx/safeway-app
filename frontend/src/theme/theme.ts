import { createTheme } from "@mui/material/styles";

export const BRAND_COLORS = {
  black: "#080808",
  dark: "#101010",
  slate: "#1a1a1a",
  border: "#333333",
  blue: "#4dabf5",
  hover: "#2563eb",
  safest: "#10b981", // Emerald
  fastest: "#3b82f6", // Blue
  alt: "#94a3b8", // light grey
  error: "#ef4444",
  text: {
    main: "#ffffff", // hite
    muted: "#94a3b8", // light grey
  },
  startMarker: "#3b82f6",
  endMarker: "#ef4444",
  caution: "#eab308", // dark yellow
  exposed: "#ef4444", // red
};

declare module "@mui/material/styles" {
  interface Palette {
    brand: typeof BRAND_COLORS;
  }
  interface PaletteOptions {
    brand?: Partial<typeof BRAND_COLORS>;
  }
}

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: BRAND_COLORS.blue,
    },
    background: {
      default: BRAND_COLORS.black,
      paper: BRAND_COLORS.dark,
    },
    text: {
      primary: BRAND_COLORS.text.main,
      secondary: BRAND_COLORS.text.muted,
    },
    success: { main: BRAND_COLORS.safest },
    warning: { main: BRAND_COLORS.alt },
    info: { main: BRAND_COLORS.fastest },
    error: { main: BRAND_COLORS.error },
    brand: BRAND_COLORS,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiFilledInput-root": {
            backgroundColor: BRAND_COLORS.slate,
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
