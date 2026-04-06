import { Container, Typography, Box, Divider, Paper } from "@mui/material";

export const TermsPage = () => {
  return (
    <Box
      sx={{
        bgcolor: "#101010",
        minHeight: "100%",
        py: 8,
        overflowY: "visible",
      }}
    >
      <Container maxWidth="md" sx={{ color: "#E0E0E0" }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "white" }}
        >
          Terms of Use
        </Typography>
        <Typography variant="body2" sx={{ mb: 6, opacity: 0.5 }}>
          Last Updated: April 2026
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <section>
            <Typography variant="h5" sx={{ color: "#4dabf5", mb: 2 }}>
              1. Purpose of Service
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              SafeWay is a research and development project designed to
              visualize public shelter locations and safe routing. It is
              provided "as-is" for informational and educational purposes only.
            </Typography>
          </section>

          <Paper
            elevation={0}
            sx={{
              bgcolor: "rgba(211, 47, 47, 0.05)",
              p: 4,
              borderRadius: "12px",
              border: "1px solid #d32f2f",
            }}
          >
            <Typography
              variant="h5"
              color="error"
              gutterBottom
              fontWeight="bold"
            >
              2. Emergency Disclaimer
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#ffcdd2", fontWeight: 500, lineHeight: 1.7 }}
            >
              <strong>
                DO NOT rely solely on this application during a real-time
                emergency.
              </strong>
              Always prioritize instructions from the Home Front Command (Pikud
              HaOref) and official sirens. Accuracy of shelter availability,
              real-time accessibility, or physical condition is not guaranteed.
            </Typography>
          </Paper>

          <section>
            <Typography variant="h5" sx={{ color: "#4dabf5", mb: 2 }}>
              3. Prohibited Use
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              Users may not attempt to scrape, reverse engineer, or "spam" the
              API endpoints. Strict security measures, including Rate Limiting
              and CORS protections, are in place to ensure system stability and
              prevent abuse.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" sx={{ color: "#4dabf5", mb: 2 }}>
              4. Limitation of Liability
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              The developer (Yael) shall not be held liable for any injuries,
              damages, or losses resulting from the use of, or the inability to
              use, this application. By using SafeWay, you acknowledge that you
              do so at your own risk.
            </Typography>
          </section>
        </Box>
      </Container>
    </Box>
  );
};
