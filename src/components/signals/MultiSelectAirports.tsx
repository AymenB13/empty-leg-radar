import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

interface MultiSelectAirportsProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

export function MultiSelectAirports({ value, onChange, options }: MultiSelectAirportsProps) {
  const [open, setOpen] = useState(false);
  
  const toggleAirport = (airport: string) => {
    if (value.includes(airport)) {
      onChange(value.filter(a => a !== airport));
    } else {
      onChange([...value, airport]);
    }
  };
  
  const removeAirport = (airport: string) => {
    onChange(value.filter(a => a !== airport));
  };
  
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="text-sm">
              {value.length === 0 ? "Select airports" : `${value.length} selected`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-2 bg-popover z-50" align="start">
          <div className="space-y-1">
            {options.map((airport) => (
              <button
                key={airport}
                className="flex w-full items-center justify-between px-2 py-1.5 text-sm hover:bg-muted rounded"
                onClick={() => toggleAirport(airport)}
              >
                <span className="font-mono">{airport}</span>
                {value.includes(airport) && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((airport) => (
            <Badge key={airport} variant="secondary" className="gap-1 px-2 py-0.5">
              <span className="font-mono text-xs">{airport}</span>
              <button onClick={() => removeAirport(airport)} className="hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
