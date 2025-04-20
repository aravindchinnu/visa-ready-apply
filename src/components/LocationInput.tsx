
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
}

const LocationInput = ({ value, onChange }: LocationInputProps) => {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      if (search.length < 3) {
        setLocations([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            search
          )}&type=city&filter=countrycode:us&format=json&apiKey=d803f774f174403a90a2d03fc1c8287d`
        );
        const data = await response.json();
        const suggestions = data.results?.map(
          (result: any) => `${result.city}, ${result.state}`
        ) || [];
        setLocations(suggestions);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, [search]);

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            id="location"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSearch(e.target.value);
            }}
            className="w-full"
            placeholder="Enter a location..."
          />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search locations..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-auto">
              {locations.map((location) => (
                <CommandItem
                  key={location}
                  value={location}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                >
                  {location}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === location ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationInput;
