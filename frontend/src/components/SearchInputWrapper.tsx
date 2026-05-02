import React, { useState } from "react";
import { Close } from "@mui/icons-material";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import { OSMLocation, Location } from "../types/types";
import { converOSMLocationToLocation } from "../utils/utils";
import { SearchInputWrapperStrings } from "../config/constants";

interface SearchInputWrapperProps {
  placeholder: string;
  query: string;
  setQuery: (val: string) => void;
  results: OSMLocation[];
  recentResults: Location[];
  onSelect: (result: any) => void;
  onClear: () => void;
  showRecent?: boolean;
  recentSearches?: any[];
  handleLocate?: () => void;
  onFocus: () => void;
}

export const SearchInputWrapper: React.FC<SearchInputWrapperProps> = ({
  placeholder,
  query,
  setQuery,
  results,
  onSelect,
  onClear,
  handleLocate,
  recentResults,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      <div className="bg-brand-dark rounded-2xl px-4 py-1.5 flex items-center gap-2 border border-brand-border focus-within:border-brand-blue transition-all">
        <input
          className="bg-transparent border-none text-[15px] flex-1 outline-none text-slate-400 placeholder:text-slate-300 font-medium py-1.5"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            onFocus();
            setIsFocused(true);
          }}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />

        {/* Actions Group: X and GPS */}
        <div className="flex items-center gap-2 shrink-0">
          {query && (
            <button
              onClick={onClear}
              className="text-slate-500 hover:text-white p-1 transition-colors"
            >
              <Close sx={{ fontSize: 14 }} />
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown (Same as before) */}
      {isFocused && (
        <ul className="absolute z-3000 w-full mt-2 bg-brand-slate border border-brand-border shadow-2xl rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
          {handleLocate && !query && (
            <li
              onMouseDown={(e) => {
                // Use onMouseDown to trigger before onBlur
                e.preventDefault();
                handleLocate();
              }}
              className="px-4 py-4 hover:bg-brand-border cursor-pointer text-sm text-brand-blue font-bold flex items-center gap-3 border-b border-brand-border sticky top-0 bg-brand-slate z-10 transition-colors"
            >
              <MyLocationRoundedIcon sx={{ fontSize: 20 }} />
              {SearchInputWrapperStrings.YourLocation}
            </li>
          )}

          {!query && recentResults.length > 0 && (
            <>
              <li className="px-4 py-2 text-[10px] font-bold text-slate-500 bg-brand-dark uppercase tracking-wider">
                {SearchInputWrapperStrings.RecentDestinations}
              </li>
              {recentResults.map((r: Location, i: number) => (
                <li
                  key={`recent-${i}`}
                  onClick={() => onSelect(r)}
                  className="px-4 py-3 hover:bg-brand-border cursor-pointer text-sm text-slate-200 flex items-center gap-3 border-b border-brand-border transition-colors"
                >
                  <span className="opacity-40">🕒</span> {r.address}
                </li>
              ))}
            </>
          )}
          {query &&
            results.map((r: OSMLocation) => (
              <li
                key={r.place_id}
                onClick={() => {
                  const location = converOSMLocationToLocation(r);
                  onSelect(location);
                }}
                className="px-4 py-3 hover:bg-brand-border cursor-pointer text-sm text-slate-200 border-b border-brand-border last:border-none transition-colors"
              >
                {r.display_name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};
