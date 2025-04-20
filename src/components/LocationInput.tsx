
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
}

const LocationInput = ({ value, onChange }: LocationInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionBoxRef.current && 
        !suggestionBoxRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch locations when input changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            inputValue
          )}&type=city&filter=countrycode:us&format=json&apiKey=d803f774f174403a90a2d03fc1c8287d`
        );
        
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.results && Array.isArray(data.results)) {
          const locationSuggestions = data.results
            .map((result: any) => {
              const city = result.city || '';
              const state = result.state || '';
              return city && state ? `${city}, ${state}` : '';
            })
            .filter(Boolean); // Remove empty strings
          
          setSuggestions(locationSuggestions);
        } else {
          console.error("Unexpected API response format:", data);
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  // Make sure to handle focus on input to show suggestions
  const handleInputFocus = () => {
    if (inputValue.trim().length >= 3) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="location">Location</Label>
      <div className="relative">
        <Input
          id="location"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full"
          placeholder="Enter a location..."
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      
      {showSuggestions && (inputValue.trim().length >= 3) && (
        <div 
          ref={suggestionBoxRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {loading ? (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              Loading locations...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion}-${index}`}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === suggestion ? "bg-accent text-accent-foreground" : ""
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                  {value === suggestion && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-center py-2 text-muted-foreground">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
