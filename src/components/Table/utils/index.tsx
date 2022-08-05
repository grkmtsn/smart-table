import * as React from "react";
import { SortingState } from "@tanstack/react-table";

import { FilterDef } from "../types";
import DebouncedInput from "@/components/DebouncedInput";

export function encodeSorting(sorting: SortingState) {
  const result = sorting.map((item) => {
    if (item.desc) {
      return `-${item.id}`;
    }
    return item.id;
  });
  return result.join(",");
}

export function decodeSorting(sorting: string): SortingState {
  const splited = sorting.split(",");
  const result = splited.map((item) => {
    return item
      ? {
          id: item.includes("-") ? item.substring(1) : item,
          desc: item.includes("-"),
        }
      : null;
  });
  return result.filter(Boolean) as SortingState;
}

export function filterRenderer(
  filterState: { [key: string]: any },
  filtersProp: FilterDef<any>,
  setFilters: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    }>
  >
) {
  return filtersProp.map((filter) => {
    switch (filter.uiType) {
      case "select":
        return (
          <div key={filter.id as string}>
            <select
              id={filter.id.toString()}
              value={filterState[filter.id as string] || ""}
              onChange={(e) => {
                setFilters((currFilters) => {
                  const value = e.target.value;
                  const selectedIndex = e.target.selectedIndex;

                  if (value && selectedIndex > 0) {
                    return {
                      ...currFilters,
                      [filter.id as string]: value,
                    };
                  }

                  return {
                    ...currFilters,
                    [filter.id as string]: "",
                  };
                });
              }}
              {...filter.props}
            >
              <option value="" key="none">
                None
              </option>
              {filter.config.options.map((option: any) => (
                <option value={option.value} key={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "checkbox":
        return (
          <div>
            <input
              id={filter.id.toString()}
              type="checkbox"
              onChange={(e) => {
                setFilters((currFilters) => {
                  const value = e.target.checked;
                  if (value) {
                    return {
                      ...currFilters,
                      [filter.id as string]: value,
                    };
                  }

                  const { [filter.id as string]: _, ...rest } = currFilters;
                  return rest;
                });
              }}
              {...filter.props}
            />
            <label htmlFor={filter.id.toString()}>{filter.id.toString()}</label>
          </div>
        );
      case "text":
        return (
          <div>
            <DebouncedInput
              id={filter.id.toString()}
              type="text"
              value={filterState[filter.id as string] || ""}
              onChange={(value) => {
                setFilters((currFilters) => {
                  return {
                    ...currFilters,
                    [filter.id as string]: value || "",
                  };
                });
              }}
              {...filter.props}
            />
          </div>
        );
      default:
        return null;
    }
  });
}

export function convertFalsyToUndefined(obj: { [key: string]: any }) {
  const processedFilters: { [key: string]: any } = {};
  Object.keys(obj).forEach((key) => {
    processedFilters[key] = obj[key] || undefined;
  });

  return processedFilters;
}
