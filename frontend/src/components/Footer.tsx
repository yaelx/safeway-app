import { Box, Link, Typography, Container } from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import { FooterStrings } from "../config/constants";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        bgcolor: "brand.black",
        borderTop: "1px solid",
        borderColor: "brand.slate",
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
            sx={{ color: "brand.text.muted", fontWeight: 500 }}
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
                  color: "brand.text.muted",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  "&:hover": { color: "brand.blue" },
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
