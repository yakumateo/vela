import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Search } from "lucide-react";
import { Input } from "./ui/input";

export interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (name: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // To prevent fetching when the user selects a suggestion (which updates the value)
  const [skipNextFetch, setSkipNextFetch] = useState(false);

  useEffect(() => {
    // Click outside to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.trim().length < 4) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (skipNextFetch) {
      setSkipNextFetch(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Nominatim search API. Limited to Peru (pe) to give better results for Lima
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            value
          )}&format=json&limit=5&countrycodes=pe`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (e) {
        console.error("Error fetching addresses", e);
      } finally {
        setIsSearching(false);
      }
    }, 800); // 800ms debounce to respect Nominatim limits

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (s: AddressSuggestion) => {
    // Format the name a bit cleaner if possible, or just take the first 3 parts
    const cleanName = s.display_name.split(",").slice(0, 3).join(",").trim();
    
    setSkipNextFetch(true);
    onChange(cleanName);
    onSelect(cleanName, parseFloat(s.lat), parseFloat(s.lon));
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative group">
        <Input
          type="text"
          placeholder={placeholder || "Buscar dirección..."}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          className={`h-[64px] text-[16px] bg-[#14141C] border-[#2A2A38]/50 focus:bg-[#1E1E2A] focus:border-[#39FF6E]/50 shadow-inner rounded-2xl pl-12 pr-12 ${className || ""}`}
        />
        <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888AA] group-focus-within:text-[#39FF6E] transition-colors pointer-events-none" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888AA]">
          {isSearching ? <Loader2 size={20} className="animate-spin text-[#39FF6E]" /> : <Search size={20} />}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#1E1E2A] border border-[#2A2A38] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden max-h-[250px] overflow-y-auto no-scrollbar">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 border-b border-[#2A2A38]/50 hover:bg-[#2A2A38] transition-colors last:border-0 flex items-start gap-3"
            >
              <MapPin size={16} className="text-[#8888AA] mt-0.5 shrink-0" />
              <span className="text-[14px] text-[#F0F0F5] leading-snug">
                {s.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
