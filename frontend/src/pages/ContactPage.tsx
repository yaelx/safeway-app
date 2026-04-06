import { Box, Typography, Button, TextField, Container } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SendIcon from "@mui/icons-material/Send";
import { ContactPageStrings } from "../config/constants";

// Common style for all text fields to ensure visibility
const textFieldStyle = {
  "& .MuiFilledInput-root": {
    backgroundColor: "brand.slate",
    color: "brand.text.main",
    borderRadius: "8px",
    "&:hover": { backgroundColor: "brand.border" },
    "&.Mui-focused": { backgroundColor: "brand.border" },
    "&:before, &:after": { display: "none" }, // Hide the default underline
  },
  "& .MuiInputLabel-root": { color: "brand.text.muted" },
  "& .MuiInputLabel-root.Mui-focused": { color: "brand.blue" },
  mb: 2,
};

export const ContactPage = () => {
  return (
    <Box sx={{ bgcolor: "brand.dark", minHeight: "100%", py: 8 }}>
      <Container maxWidth="sm" sx={{ color: "brand.text.main" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {ContactPageStrings.Title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
          {ContactPageStrings.Subtitle}
        </Typography>

        {/* LinkedIn Box (Keep your existing dark styling) */}
        <Box
          sx={{
            bgcolor: "brand.slate",
            p: 3,
            borderRadius: 2,
            mb: 6,
            border: "1px solid",
            borderColor: "brand.border",
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {ContactPageStrings.PreferredContactHeading}
          </Typography>
          <Button
            variant="contained"
            startIcon={<LinkedInIcon />}
            href={ContactPageStrings.LinkedInUrl}
            sx={{ textTransform: "none", bgcolor: "brand.hover" }}
          >
            {ContactPageStrings.BtnLinkedIn}
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ color: "brand.blue" }}>
          {ContactPageStrings.SendMessageHeading}
        </Typography>

        <Box component="form" sx={{ display: "flex", flexDirection: "column" }}>
          <TextField
            label={ContactPageStrings.FieldLabelName}
            variant="filled"
            fullWidth
            placeholder={ContactPageStrings.FieldPlaceholderName}
            sx={textFieldStyle}
          />
          <TextField
            label={ContactPageStrings.FieldLabelEmail}
            variant="filled"
            fullWidth
            placeholder={ContactPageStrings.FieldPlaceholderEmail}
            sx={textFieldStyle}
          />
          <TextField
            label={ContactPageStrings.FieldLabelMessage}
            variant="filled"
            fullWidth
            multiline
            rows={4}
            placeholder={ContactPageStrings.FieldPlaceholderMessage}
            sx={textFieldStyle}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            sx={{
              width: "fit-content",
              mt: 2,
              bgcolor: "brand.hover",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
            }}
          >
            {ContactPageStrings.BtnSendMessage}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
