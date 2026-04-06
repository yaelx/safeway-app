import { Container, Typography, Box, Paper, Grid } from "@mui/material";

export const AboutPage = () => {
  return (
    /* We use 'background.default' from your new global theme */
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" gutterBottom color="white">
          About SafeWay
        </Typography>

        <Typography
          variant="h6"
          sx={{ color: "primary.main", mb: 4, fontWeight: 600 }}
        >
          Intelligence-Driven Safety Navigation
        </Typography>

        {/* RESTORED MISSION STATEMENT */}
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
          SafeWay was developed to bridge the gap between static shelter maps
          and real-time navigation needs. Focusing initially on the Haifa and
          Krayot regions, the platform calculates the "Safety Score" of a route
          based on the density and proximity of public shelters.
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              title: "The Problem",
              desc: "Static maps tell you where a shelter is, but they don't help when you are in motion. SafeWay solves the 'dynamic exposure' problem.",
            },
            {
              title: "The Engineering",
              desc: "Built with a Python logic tier that processes Multi-Level Dijkstra (MLD) routing to evaluate safety metrics in milliseconds.",
            },
            {
              title: "The Vision",
              desc: "Our goal is to provide peace of mind for residents of the North, ensuring that every journey is calculated with safety as the first priority.",
            },
          ].map((item, i) => (
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
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.6 }}
                >
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
