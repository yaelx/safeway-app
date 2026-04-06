// src/layouts/MainLayout.tsx
import React from "react";
import { Footer } from "../components/Footer";

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#101010] text-[#E0E0E0]">
      {/* This is the KEY for termination: The map container 
        takes up all available height, pushing the footer down.
      */}
      <main className="flex-grow overflow-y-auto bg-[#101010] h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Footer has a defined height, matching the layout math.
       */}
      <div className="h-[80px] bg-[#1a1a1a] text-[#E0E0E0] p-4 flex flex-col justify-between border-t border-[#333]">
        <Footer />
      </div>
    </div>
  );
};
