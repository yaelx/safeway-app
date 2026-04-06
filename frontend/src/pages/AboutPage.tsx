import { Container, Typography, Box, Paper, Grid } from "@mui/material";
import { AboutPageStrings } from "../config/constants";

export const AboutPage = () => {
  return (
    /* We use 'background.default' from your new global theme */
    <Box sx={{ bgcolor: "brand.black", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: "brand.text.main" }}>
          {AboutPageStrings.Title}
        </Typography>

        <Typography
          variant="h6"
          sx={{ color: "primary.main", mb: 4, fontWeight: 600 }}
        >
          {AboutPageStrings.Subtitle}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "brand.text.muted",
            mb: 6,
            lineHeight: 1.8,
            fontSize: "1.1rem",
            borderLeft: "4px solid",
            borderColor: "brand.blue",
            pl: 3,
          }}
        >
          {AboutPageStrings.MissionStatement}
        </Typography>

        <Grid container spacing={3}>
          {AboutPageStrings.Cards.map((item, i) => (
            /* Using 'size' for MUI v7 compatibility */
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "brand.slate",
                  border: "1px solid",
                  borderColor: "brand.border",
                  borderRadius: "16px",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "brand.text.main", fontWeight: "bold" }}
                >
                  {item.Title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "brand.text.muted", lineHeight: 1.6 }}
                >
                  {item.Desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
