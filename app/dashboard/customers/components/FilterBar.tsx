import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  onFilterChange: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const FilterBar = ({
  onFilterChange,
  placeholder = "Buscar...",
  initialValue = "",
}: FilterBarProps) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onFilterChange(value);
  };

  const clearInput = () => {
    setInputValue("");
    onFilterChange("");
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="pl-9 pr-10 h-10 bg-background border-border/60 focus-visible:ring-primary/20 transition-all"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 opacity-70 hover:opacity-100"
            onClick={clearInput}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;