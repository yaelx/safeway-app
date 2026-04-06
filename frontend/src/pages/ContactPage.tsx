import { Box, Typography, Button, TextField, Container } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SendIcon from "@mui/icons-material/Send";

// Common style for all text fields to ensure visibility
const textFieldStyle = {
  "& .MuiFilledInput-root": {
    backgroundColor: "#2a2a2a",
    color: "white",
    borderRadius: "8px",
    "&:hover": { backgroundColor: "#333" },
    "&.Mui-focused": { backgroundColor: "#333" },
    "&:before, &:after": { display: "none" }, // Hide the default underline
  },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#4dabf5" },
  mb: 2,
};

export const ContactPage = () => {
  return (
    <Box sx={{ bgcolor: "#101010", minHeight: "100%", py: 8 }}>
      <Container maxWidth="sm" sx={{ color: "white" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Contact
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
          Have a question or feedback? Reach out below.
        </Typography>

        {/* LinkedIn Box (Keep your existing dark styling) */}
        <Box
          sx={{
            bgcolor: "#1a1a1a",
            p: 3,
            borderRadius: 2,
            mb: 6,
            border: "1px solid #333",
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Preferred Contact
          </Typography>
          <Button
            variant="contained"
            startIcon={<LinkedInIcon />}
            href="https://www.linkedin.com/in/yaelsa"
            sx={{ textTransform: "none", bgcolor: "#2563eb" }}
          >
            Connect on LinkedIn
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ color: "#4dabf5" }}>
          Send a Message
        </Typography>

        <Box component="form" sx={{ display: "flex", flexDirection: "column" }}>
          <TextField
            label="Name"
            variant="filled"
            fullWidth
            placeholder="Your name"
            sx={textFieldStyle}
          />
          <TextField
            label="Email"
            variant="filled"
            fullWidth
            placeholder="you@example.com"
            sx={textFieldStyle}
          />
          <TextField
            label="Message"
            variant="filled"
            fullWidth
            multiline
            rows={4}
            placeholder="How can I help?"
            sx={textFieldStyle}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            sx={{
              width: "fit-content",
              mt: 2,
              bgcolor: "#2563eb",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
            }}
          >
            Send Message
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
