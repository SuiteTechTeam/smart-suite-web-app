import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, Warehouse } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
    filterStock: string;
    setFilterStock: (stock: string) => void;
  // Make sure to handle "all" as the default value for all stock levels in your parent component logic.
  itemTypes: string[];
}

export const FilterBar = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStock,
  setFilterStock,
  itemTypes
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex w-full sm:w-auto items-center space-x-2">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" onClick={() => setSearchTerm("")} size="sm">
            Limpiar
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <SelectValue placeholder="Filtrar por tipo" />
            </div>
          </SelectTrigger>
          <SelectContent>
            Todos los tipos
            {itemTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStock} onValueChange={setFilterStock}>
          <SelectTrigger className="w-full sm:w-40">
            <div className="flex items-center gap-2">
              <Warehouse size={16} />
              <SelectValue placeholder="Filtrar por stock" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="low">Stock bajo (&lt;10)</SelectItem>
            <SelectItem value="normal">Stock normal (10-30)</SelectItem>
            <SelectItem value="high">Stock alto (&gt;30)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 