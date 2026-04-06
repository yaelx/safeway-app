import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export const PrivacyPage = () => {
  return (
    <Box sx={{ bgcolor: "#101010", minHeight: "100%", py: 8 }}>
      <Container maxWidth="md" sx={{ color: "#E0E0E0" }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "white" }}
        >
          Privacy Policy
        </Typography>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ color: "#4dabf5" }}>
            What Data We Collect
          </Typography>
          <Typography variant="body1" paragraph sx={{ opacity: 0.8 }}>
            SafeWay is designed with "Privacy by Design." We do not require
            accounts, names, or phone numbers to use the mapping features.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              bgcolor: "#1a1a1a",
              p: 4,
              my: 4,
              border: "1px solid #333",
              borderRadius: "12px",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: "white", mb: 2 }}
            >
              Technical Data Processing:
            </Typography>
            <List disablePadding>
              {[
                {
                  primary: "Anonymized Routing Requests",
                  secondary:
                    "When you request a route, coordinates are sent to our logic server. These are not stored permanently or linked to your identity.",
                },
                {
                  primary: "Security Logs & Rate Limiting",
                  secondary:
                    "We use Upstash (Redis) to store temporary request counts per IP address to prevent DDoS attacks. This data expires automatically within 24 hours.",
                },
                {
                  primary: "Google Maps API",
                  secondary:
                    "The map interface uses Google Maps. Their privacy policy applies to the interaction with the map tile data.",
                },
              ].map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: index < 2 ? "1px solid #2a2a2a" : "none",
                  }}
                >
                  <ListItemText
                    primary={item.primary}
                    secondary={item.secondary}
                    primaryTypographyProps={{
                      sx: { color: "#4dabf5", fontWeight: 500 },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: "rgba(255,255,255,0.5)", mt: 0.5 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#4dabf5", mt: 4 }}
          >
            Third-Party Services
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Our infrastructure is hosted on <strong>Vercel</strong>
            (Frontend/Orchestrator) and <strong>Google Cloud</strong> (Python
            Logic Server). These providers may log basic metadata (IP, Browser
            version) for security and maintenance purposes.
          </Typography>

          <Box
            sx={{
              mt: 8,
              p: 3,
              borderLeft: "4px solid #4dabf5",
              bgcolor: "#1a1a1a",
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              For privacy inquiries or to request data deletion (for the Contact
              form), please reach out via the Contact page.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
