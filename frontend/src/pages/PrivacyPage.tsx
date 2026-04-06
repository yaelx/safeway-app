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
    <Box sx={{ bgcolor: "brand.dark", minHeight: "100%", py: 8 }}>
      <Container maxWidth="md" sx={{ color: "brand.text.muted" }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "brand.text.main" }}
        >
          {PrivacyPageStrings.Title}
        </Typography>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ color: "brand.blue" }}>
            {PrivacyPageStrings.DataCollectionHeading}
          </Typography>
          <Typography variant="body1" paragraph sx={{ opacity: 0.8 }}>
            {PrivacyPageStrings.DataCollectionBody}
          </Typography>

          <Paper
            elevation={0}
            sx={{
              bgcolor: "brand.slate",
              p: 4,
              my: 4,
              border: "1px solid",
              borderColor: "brand.border",
              borderRadius: "12px",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: "brand.text.main", mb: 2 }}
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
                    borderBottom: index < 2 ? "1px solid" : "none",
                    borderColor: "brand.border",
                  }}
                >
                  <ListItemText
                    primary={item.Primary}
                    secondary={item.Secondary}
                    primaryTypographyProps={{
                      sx: { color: "brand.blue", fontWeight: 500 },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: "brand.text.muted", mt: 0.5 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "brand.blue", mt: 4 }}
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
              borderLeft: "4px solid",
              borderColor: "brand.blue",
              bgcolor: "brand.slate",
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
