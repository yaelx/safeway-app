import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "@tanstack/react-router";
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

// export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   return (
//     <div className="flex flex-col min-h-screen bg-[#101010] text-[#E0E0E0]">
//       {/* This is the KEY for termination: The map container
//         takes up all available height, pushing the footer down.
//       */}
//       <main className="flex-grow overflow-y-auto bg-[#101010] h-[calc(100vh-80px)]">
//         {children}
//       </main>

//       {/* Footer has a defined height, matching the layout math.
//        */}
//       <div className="h-[80px] bg-[#1a1a1a] text-[#E0E0E0] p-4 flex flex-col justify-between border-t border-[#333]">
//         <Footer />
//       </div>
//     </div>
//   );
// };

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMapView = location.pathname === "/";

  const menuItems = [
    { text: "Map", to: "/" },
    { text: "About", to: "/about" },
    { text: "Contact", to: "/contact" },
    { text: "Privacy", to: "/privacy" },
    { text: "Terms", to: "/terms" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // This is the fix: Map is fixed height, others grow naturally
        height: isMapView ? "100vh" : "auto",
        minHeight: "100vh",
        bgcolor: "#080808",
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
          zIndex: 2000,
          bgcolor: "#1a1a1a",
          border: "1px solid #333",
          color: "#4dabf5",
          "&:hover": { bgcolor: "#222" },
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
            bgcolor: "#101010",
            color: "white",
            borderLeft: "1px solid #333",
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
            SafeWay
          </Typography>
          <IconButton onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
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
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "#1a1a1a" } }}
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
