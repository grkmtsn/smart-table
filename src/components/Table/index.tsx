/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/prop-types */
import * as React from "react";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { NumberParam, StringParam, useQueryParams } from "use-query-params";
import useDidUpdateEffect from "@/hooks/useDidUpdateEffect";

import { TableProps } from "./types";
import {
  convertFalsyToUndefined,
  decodeSorting,
  encodeSorting,
  filterRenderer,
} from "./utils";
import DebouncedInput from "../DebouncedInput";

export default function SmartTable(props: TableProps) {
  const {
    data = [],
    columns,
    isLoading = false,
    error,
    totalCount,
    initialSelectedRows,
    initialSearchQuery,
    initialPagination,
    initialSort,
    initialFilters,
    syncWithUrl = false,
    filterConfig: filterConfigProp = [],
    onRowSelect,
    onSearch,
    onFetch,
    onFilterChange,
  } = props;

  // Generate dynamic url param config
  const filterParamsConfig: { [key: string]: any } = {};
  filterConfigProp.forEach((filter) => {
    filterParamsConfig[filter.id as string] = StringParam;
  });

  // Url Param Query States
  const [params, setParams] = useQueryParams({
    pageSize: NumberParam,
    page: NumberParam,
    q: StringParam,
    sort: StringParam,
    ...filterParamsConfig,
  });

  const {
    page: pageParam,
    pageSize: pageSizeParam,
    q: qParam,
    sort: sortParam,
    ...filterParams
  } = params;

  const [rowSelection, setRowSelection] = React.useState(
    initialSelectedRows || {}
  );

  const [sorting, setSorting] = React.useState<SortingState>(() => {
    if (initialSort) {
      return initialSort;
    }
    return syncWithUrl ? decodeSorting(sortParam || "") : [];
  });

  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex:
        initialPagination?.pageIndex || (pageParam ? pageParam - 1 : 0),
      pageSize: initialPagination?.pageSize || pageSizeParam || 10,
    });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const [searchQuery, setSearchQuery] = React.useState(
    qParam || initialSearchQuery || ""
  );

  const [filters, setFilters] = React.useState<{
    [key: string]: any;
  }>(initialFilters || filterParams || {});

  const isServerSide = !!onFetch;

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      ...(isServerSide
        ? {
            pagination,
          }
        : {
            globalFilter: searchQuery,
          }),
    },
    onRowSelectionChange: (rows) => {
      setRowSelection(rows);
      onRowSelect?.(rows);
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    debugTable: true,
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    onSortingChange: setSorting,
    ...(isServerSide
      ? {
          pageCount: Math.ceil(totalCount / (pagination.pageSize || 10)),
          onPaginationChange: setPagination,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          onGlobalFilterChange: setSearchQuery,
          enableGlobalFilter: true,
          globalFilterFn: "includesString",
          getSortedRowModel: getSortedRowModel(),
        }),
  });

  const handleChangeSearch = (value: string) => {
    //TODO: Static global filter does not work.
    setSearchQuery(value);
    onSearch?.(value);
  };

  React.useEffect(() => {
    // initial effect
    // Convert all falsy values to undefined for remove from url.
    const processedFilters = convertFalsyToUndefined(filters);
    onFetch?.(pagination, searchQuery, sorting, processedFilters);
    onFilterChange?.(filters);

    if (
      initialSelectedRows &&
      Object.values(initialSelectedRows || {}).length > 0
    ) {
      setRowSelection(initialSelectedRows);
      onRowSelect?.(initialSelectedRows);
    }

    if (syncWithUrl) {
      // TODO: Not working without timeout
      setTimeout(() => {
        setParams(
          {
            ...processedFilters,
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            q: searchQuery || undefined,
            sort: encodeSorting(sorting) || undefined,
          },
          "replace"
        );
      }, 100);
    }
  }, []);

  useDidUpdateEffect(() => {
    // effects exclude initial effect

    // Convert all falsy values to undefined for remove from url.
    const processedFilters = convertFalsyToUndefined(filters);

    onFetch?.(pagination, searchQuery, sorting, processedFilters);
    onFilterChange?.(processedFilters);

    if (syncWithUrl) {
      setParams(
        {
          ...params,
          ...processedFilters,
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          q: searchQuery || undefined,
          sort: encodeSorting(sorting) || undefined,
        },
        "replace"
      );
    }
  }, [pagination, searchQuery, sorting, filters]);

  if (error) return <div>{error}</div>;

  return (
    <div>
      <div style={{ display: "flex" }}>
        <DebouncedInput
          placeholder="Search"
          value={searchQuery}
          onChange={handleChangeSearch}
        />
        {filterRenderer(filters, filterConfigProp, setFilters)}
        {isLoading && <div>Loading...</div>}
      </div>
      {/*Table Start*/}
      <table
        style={{
          border: "1px solid #ccc",
          textAlign: "left",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              style={{
                borderBottom: "1px solid #ccc",
              }}
            >
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ padding: 12 }}
                  >
                    {header.isPlaceholder ? null : (
                      <div onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                style={{
                  borderBottom: "1px solid #ccc",
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id} style={{ padding: 12 }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/*Table End*/}
      {/*Pagination Start*/}
      <div>
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span>
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span>
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      {/*Pagination End*/}
    </div>
  );
}
