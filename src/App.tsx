/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/prop-types */
import * as React from "react";
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

import Table from "./components/Table";
import { FilterDef } from "./components/Table/types";
import IndeterminateCheckbox from "./components/IndeterminateCheckbox";
import { generatePath } from "./utils";

type ITodo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

const INITIAL_PAGINATION = {
  pageIndex: 2, // index start at zero, i want page 3
  pageSize: 20,
};

const INITIAL_QUERY = "si";

const INITIAL_ROWS = {
  1: true,
};

const INITIAL_SORT = [
  {
    id: "title",
    desc: true,
  },
];

const INITIAL_FILTERS = {
  id: "1",
};

export default function App() {
  // Component States
  const [data, setData] = React.useState(() => []);
  const [isLoading, setIsLoading] = React.useState(() => false);
  const [error, setError] = React.useState(() => "");

  // External Table States
  const [rows, setRows] = React.useState({});
  const [currentFilters, setCurrentFilters] = React.useState({});

  const [totalCount, setTotalCount] = React.useState(0);

  const columns = React.useMemo<ColumnDef<ITodo>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div>
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "Completed",
        accessorKey: "completed",
        cell: ({ row }) => <div>{row.original.completed ? "Yes" : "No"}</div>,
      },
    ],
    []
  );

  const filterConfig = React.useMemo<FilterDef<ITodo>>(
    () => [
      {
        id: "id",
        uiType: "text",
        props: {
          placeholder: "Type ID",
        },
      },
      {
        id: "completed",
        uiType: "select",
        config: {
          options: [
            {
              id: 1,
              value: true,
              label: "Completed",
            },
            {
              id: 2,
              value: false,
              label: "Not Completed",
            },
          ],
        },
      },
    ],
    []
  );

  const fetchData = async (
    pagination?: PaginationState,
    query?: string,
    sortBy?: SortingState,
    filters?: { [key: string]: any }
  ) => {
    try {
      setIsLoading(true);

      const RESOURCE = "todos";
      const path = generatePath(RESOURCE, query, pagination, sortBy, filters);

      const response = await fetch(path);

      if (!response.ok) throw new Error("Opps");

      const json = await response.json();
      setTotalCount(
        parseInt(response?.headers?.get?.("x-total-count") || "0", 10) || 0
      );
      setData(json);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        console.log("Unexpected error", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Remove comment if you want to run static table
  // React.useEffect(() => {
  //   fetchData();
  // }, []);

  return (
    <div>
      <Table
        data={data}
        columns={columns}
        totalCount={totalCount}
        isLoading={isLoading}
        error={error}
        onRowSelect={setRows}
        filterConfig={filterConfig}
        onFilterChange={setCurrentFilters}
        syncWithUrl={true}
        onFetch={fetchData} // comment this prop when use static table
        // initialFilters={INITIAL_FILTERS}
        // initialSort={INITIAL_SORT}
        // initialSelectedRows={INITIAL_ROWS}
        // initialSearchQuery={INITIAL_QUERY}
        // initialPagination={INITIAL_PAGINATION}
      />
      <div style={{ marginTop: 48 }}>
        <div>
          <div>Selected Rows:</div>
          <div>{JSON.stringify(rows)}</div>
        </div>
        <div>
          <div>Current Filter:</div>
          <div>{JSON.stringify(currentFilters)}</div>
        </div>
      </div>
    </div>
  );
}
