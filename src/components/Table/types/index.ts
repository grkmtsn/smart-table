import {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";

type Updater<T> = T | ((old: T) => T);

export type UITypes = "checkbox" | "select" | "text";

export type FilterDef<T> = {
  id: Omit<keyof T, symbol>;
  uiType: UITypes;
  config?: any;
  props?: any;
}[];

export type TableProps = {
  data: unknown[];
  columns: ColumnDef<any>[];
  isLoading?: boolean;
  error?: string;
  totalCount: number;
  initialSelectedRows?: RowSelectionState;
  initialSearchQuery?: string | null;
  initialPagination?: PaginationState;
  initialSort?: SortingState;
  syncWithUrl?: boolean;
  filterConfig?: FilterDef<any>;
  onRowSelect?: (rows: Updater<RowSelectionState>) => void;
  onSearch?: (query: string) => void;
  onFetch?: (
    pagination: PaginationState,
    query: string,
    sortBy: SortingState,
    filters: { [key: string]: any }
  ) => void;
  onFilterChange?: (filters: { [key: string]: any }) => void;
  initialFilters?: { [key: string]: any };
};
