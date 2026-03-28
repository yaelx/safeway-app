import React, { useState } from "react";
import { Search, Close, Navigation } from "@mui/icons-material";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import { OSMLocation, Location } from "../types/types";
import { converOSMLocationToLocation } from "../utils/utils";

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
  handleLocate: () => void;
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
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      <div className="bg-[#f8fafc] rounded-2xl px-4 py-3 flex items-center gap-2 border border-transparent focus-within:border-slate-200 transition-all min-h-[48px]">
        <input
          className="bg-transparent border-none text-[15px] flex-1 outline-none text-slate-800 placeholder:text-slate-400 font-medium py-2.5"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />

        {/* Actions Group: X and GPS */}
        <div className="flex items-center gap-2 shrink-0">
          {query && (
            <button
              onClick={onClear}
              className="text-slate-300 hover:text-slate-500 p-1"
            >
              <Close sx={{ fontSize: 16 }} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLocate();
            }}
            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
            title="Locate Me"
          >
            <MyLocationRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Results Dropdown (Same as before) */}
      {isFocused &&
        (results.length > 0 || (recentResults.length > 0 && !query)) && (
          <ul className="absolute z-[3000] w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
            {!query && recentResults.length > 0 && (
              <>
                <li className="px-4 py-2 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-tighter">
                  Recent Destinations
                </li>
                {recentResults.map((r: Location, i: number) => (
                  <li
                    key={`recent-${i}`}
                    onClick={() => onSelect(r)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 flex items-center gap-3 border-b border-slate-50"
                  >
                    <span className="opacity-30">🕒</span> {r.address}
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
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-none"
                >
                  {r.display_name}
                </li>
              ))}
          </ul>
        )}
    </div>
  );
};
