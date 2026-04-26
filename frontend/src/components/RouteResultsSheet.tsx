// RouteResultsSheet.tsx
import { useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { SafetySidebar } from "./SafetySidebar";
import { RouteData } from "../types/types";
import { RouteResultsSheetStrings } from "../config/constants";

export const RouteResultsSheet = ({ routes }: { routes: RouteData[] }) => {
  const [open, setOpen] = useState(false);

  // Define the 'snap points' for mobile
  const handleSnapPoints = ({
    maxHeight,
  }: {
    minHeight: number;
    maxHeight: number;
  }) => [
    // Minimized (only the handle/summary is visible)
    100, // Show a 100px summary
    // Partially open
    maxHeight * 0.4, // Open 40% of the screen
    // Fully expanded
    maxHeight * 0.9, // Open 90%
  ];

  return (
    <>
      {/* Floating Summary Bar (Alternative trigger) */}
      {!open && routes.length > 0 && (
        <div className="fixed bottom-10 left-4 right-4 z-1000 p-4">
          <button
            onClick={() => setOpen(true)}
            className="w-full bg-brand-slate text-text-main rounded-xl py-3 text-center shadow-xl active:scale-95 transition"
          >
            {routes.length} {RouteResultsSheetStrings.BtnRoutesSummary}
          </button>
        </div>
      )}

      <BottomSheet
        open={open}
        onDismiss={() => setOpen(false)}
        snapPoints={handleSnapPoints}
        // Tailwind styling for the sheet itself
        className="bg-brand-slate text-text-main rounded-t-3xl shadow-2xl border-t border-brand-border"
        header={
          // The Handle (Library adds this, but you can style the header)
          <div className="p-4 border-b border-brand-border flex justify-center">
            <div className="w-12 h-1.5 bg-brand-border rounded-full" />{" "}
            {/* The swipe handle */}
          </div>
        }
      >
        {/* Inject your Route Comparison Cards here! */}
        <div className="p-4 space-y-4">
          <SafetySidebar
            routes={routes}
            selectedRouteId={routes[0].id}
            onSelect={() => {
              // TODO: Implement route selection
            }}
          />
          {/* Add a close button within the content for clarity */}
          <button
            onClick={() => setOpen(false)}
            className="w-full mt-6 text-text-muted text-sm"
          >
            {RouteResultsSheetStrings.BtnDismiss}
          </button>
        </div>
      </BottomSheet>
    </>
  );
};
