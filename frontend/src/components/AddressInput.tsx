// src/components/AddressInput.tsx
import React, { useState } from "react";

interface Props {
  placeholder: string;
  onSelect: (coords: { lat: number; lng: number }) => void;
}

export const AddressInput: React.FC<Props> = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchAddress = async (text: string) => {
    setQuery(text);
    if (text.length < 3) return;

    // Nominatim is free, but follow their usage policy (don't spam)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${text}&countrycodes=il`,
    );
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="address-search-container">
      <input
        value={query}
        onChange={(e) => searchAddress(e.target.value)}
        placeholder={placeholder}
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((r: any) => (
            <li
              key={r.place_id}
              onClick={() => {
                onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
                setQuery(r.display_name);
                setResults([]);
              }}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
