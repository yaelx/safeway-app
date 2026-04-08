import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SendIcon from "@mui/icons-material/Send";
import { ContactPageStrings } from "../config/constants";
import { useContactMessage } from "../hooks/useContactMessage";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

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
  const { sendMessage, loading, error, success, resetStatus } =
    useContactMessage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "SafeWay Inquiry", // Default subject
    message: "",
    honeypot: "",
  });

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate({ to: "/" });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  // Handle input changes and reset the status (clears old errors/success messages)
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    resetStatus();
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isSent = await sendMessage(form);

    if (isSent) {
      // Clear form on success
      setForm({
        name: "",
        email: "",
        subject: "SafeWay Inquiry",
        message: "",
        honeypot: "",
      });
    }
  };

  return (
    <Box sx={{ bgcolor: "brand.dark", minHeight: "100%", py: 8 }}>
      <Container maxWidth="sm" sx={{ color: "brand.text.main" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {ContactPageStrings.Title}
          </Typography>

          {/* Moved the button here to be adjacent to the title */}
          <Button
            variant="contained"
            startIcon={<LinkedInIcon />}
            target="_blank"
            rel="noopener noreferrer"
            href={ContactPageStrings.LinkedInUrl}
            sx={{
              textTransform: "none",
              bgcolor: "brand.blue",
              "&:hover": { bgcolor: "brand.hover" },
            }}
          >
            {ContactPageStrings.BtnLinkedIn}
          </Button>
        </Box>

        <Typography variant="body1" sx={{ mb: 6, color: "brand.text.muted" }}>
          {ContactPageStrings.Subtitle}
        </Typography>

        {/* Status Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: "8px" }}>
            Your message has been sent successfully! Redirecting you to the map.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom sx={{ color: "brand.blue" }}>
          {ContactPageStrings.SendMessageHeading}
        </Typography>

        {/* Form Section */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <TextField
            name="name"
            label={ContactPageStrings.FieldLabelName}
            variant="filled"
            fullWidth
            required
            value={form.name}
            onChange={handleChange}
            placeholder={ContactPageStrings.FieldPlaceholderName}
            sx={textFieldStyle}
          />
          <TextField
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange}
            sx={{
              display: "none",
              position: "absolute",
              left: "-9999px",
            }}
            autoComplete="off"
          />
          <TextField
            name="email"
            type="email"
            label={ContactPageStrings.FieldLabelEmail}
            variant="filled"
            fullWidth
            required
            value={form.email}
            onChange={handleChange}
            placeholder={ContactPageStrings.FieldPlaceholderEmail}
            sx={textFieldStyle}
          />
          <TextField
            name="message"
            label={ContactPageStrings.FieldLabelMessage}
            variant="filled"
            fullWidth
            required
            multiline
            rows={4}
            value={form.message}
            onChange={handleChange}
            placeholder={ContactPageStrings.FieldPlaceholderMessage}
            sx={textFieldStyle}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            endIcon={!loading && <SendIcon />}
            sx={{
              width: "fit-content",
              mt: 2,
              bgcolor: "brand.blue",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              "&:hover": { bgcolor: "brand.hover" },
              "&.Mui-disabled": {
                bgcolor: "brand.border",
                color: "brand.text.muted",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "brand.text.main" }} />
            ) : (
              ContactPageStrings.BtnSendMessage
            )}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
