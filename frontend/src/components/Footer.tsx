import { Box, Link, Typography, Container } from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import { FooterStrings } from "../config/constants";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        bgcolor: "#080808",
        borderTop: "1px solid #1a1a1a",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Copyright Info */}
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}
          >
            {FooterStrings.Copyright}
          </Typography>

          {/* Minimal Secondary Links */}
          <Box sx={{ display: "flex", gap: 3 }}>
            {FooterStrings.NavLinks.map((text) => (
              <Link
                key={text}
                component={RouterLink}
                to={`/${text.toLowerCase()}`}
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  "&:hover": { color: "#4dabf5" },
                }}
              >
                {text}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
