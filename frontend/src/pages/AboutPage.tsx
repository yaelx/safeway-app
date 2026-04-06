import { Container, Typography, Box, Paper, Grid } from "@mui/material";
import { AboutPageStrings } from "../config/constants";

export const AboutPage = () => {
  return (
    /* We use 'background.default' from your new global theme */
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" gutterBottom color="white">
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
            color: "text.secondary",
            mb: 6,
            lineHeight: 1.8,
            fontSize: "1.1rem",
            borderLeft: "4px solid #4dabf5",
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
                  bgcolor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "16px",
                }}
              >
                <Typography
                  variant="h6"
                  color="white"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {item.Title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.6 }}
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
