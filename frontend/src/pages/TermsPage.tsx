import { Container, Typography, Box, Paper } from "@mui/material";
import { TermsPageStrings } from "../config/constants";

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
          {TermsPageStrings.Title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 6, opacity: 0.5 }}>
          {TermsPageStrings.LastUpdated}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <section>
            <Typography variant="h5" sx={{ color: "#4dabf5", mb: 2 }}>
              {TermsPageStrings.Section1Heading}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {TermsPageStrings.Section1Body}
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
              {TermsPageStrings.Section2Heading}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#ffcdd2", fontWeight: 500, lineHeight: 1.7 }}
            >
              <strong>{TermsPageStrings.Section2Bold}</strong>
              {TermsPageStrings.Section2Body.replace(
                TermsPageStrings.Section2Bold,
                "",
              )}
            </Typography>
          </Paper>

          <section>
            <Typography variant="h5" sx={{ color: "#4dabf5", mb: 2 }}>
              {TermsPageStrings.Section3Heading}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {TermsPageStrings.Section3Body}
            </Typography>
          </section>

          <section>
            <Typography variant="h5" sx={{ color: "#4dabf5", mb: 2 }}>
              {TermsPageStrings.Section4Heading}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {TermsPageStrings.Section4Body}
            </Typography>
          </section>
        </Box>
      </Container>
    </Box>
  );
};
