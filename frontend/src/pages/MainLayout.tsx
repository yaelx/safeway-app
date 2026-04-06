import React, { useState } from "react";
import { useLocation, Link } from "@tanstack/react-router";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Footer } from "../components/Footer";
import { MainLayoutStrings } from "../config/constants";

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMapView = location.pathname === "/";

  const menuItems = [
    { text: MainLayoutStrings.MenuItemMap, to: "/" },
    { text: MainLayoutStrings.MenuItemAbout, to: "/about" },
    { text: MainLayoutStrings.MenuItemContact, to: "/contact" },
    { text: MainLayoutStrings.MenuItemPrivacy, to: "/privacy" },
    { text: MainLayoutStrings.MenuItemTerms, to: "/terms" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // This is the fix: Map is fixed height, others grow naturally
        height: isMapView ? "100vh" : "auto",
        minHeight: "100vh",
        bgcolor: "brand.black",
        overflow: isMapView ? "hidden" : "visible",
      }}
    >
      {/* Burger Button - Floating in top right */}
      <IconButton
        onClick={() => setIsOpen(true)}
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "brand.slate",
          border: "1px solid",
          borderColor: "brand.border",
          color: "brand.blue",
          "&:hover": { bgcolor: "brand.border" },
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Side Drawer Menu */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "brand.dark",
            color: "brand.text.main",
            borderLeft: "1px solid",
            borderColor: "brand.border",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="primary">
            {MainLayoutStrings.AppName}
          </Typography>
          <IconButton onClick={() => setIsOpen(false)} sx={{ color: "brand.text.main" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.to}
                onClick={() => setIsOpen(false)}
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "brand.slate" } }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Content Area: No margin on Map, Margin on sub-pages */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // If it's the map, fill the screen. If not, add padding for the menu button.
          pt: isMapView ? 0 : 8,
          // pb: isMapView ? 0 : 4,
          height: isMapView ? "100%" : "auto",
        }}
      >
        {children}
      </Box>

      {/* Footer: Hidden on Map view */}
      {!isMapView && <Footer />}
    </Box>
  );
};
