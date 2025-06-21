import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  return (
    <div className="flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            defaultValue={initialValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="pl-8"
          />
        </div>
    </div>
  );
};

export default FilterBar;