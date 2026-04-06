import { Box, Link, Typography, Container } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: "auto",
        bgcolor: "#080808",
        borderTop: "1px solid #1a1a1a",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 4,
            mb: 2,
          }}
        >
          {["About", "Contact", "Privacy", "Terms"].map((text) => (
            <Link
              key={text}
              component={RouterLink}
              to={`/${text.toLowerCase()}`}
              sx={{
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontSize: "0.9rem",
                "&:hover": { color: "#4dabf5" },
              }}
            >
              {text}
            </Link>
          ))}
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          © {new Date().getFullYear()} SafeWay Israel. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
