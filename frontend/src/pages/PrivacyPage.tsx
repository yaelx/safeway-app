import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { PrivacyPageStrings } from "../config/constants";

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
          {PrivacyPageStrings.Title}
        </Typography>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ color: "#4dabf5" }}>
            {PrivacyPageStrings.DataCollectionHeading}
          </Typography>
          <Typography variant="body1" paragraph sx={{ opacity: 0.8 }}>
            {PrivacyPageStrings.DataCollectionBody}
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
              {PrivacyPageStrings.TechDataHeading}
            </Typography>
            <List disablePadding>
              {PrivacyPageStrings.DataItems.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: index < 2 ? "1px solid #2a2a2a" : "none",
                  }}
                >
                  <ListItemText
                    primary={item.Primary}
                    secondary={item.Secondary}
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
            {PrivacyPageStrings.ThirdPartyHeading}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {PrivacyPageStrings.ThirdPartyBody}
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
              {PrivacyPageStrings.FootnoteBody}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
