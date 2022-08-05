import { PaginationState, SortingState } from "@tanstack/react-table";

const BASE_URL = "https://jsonplaceholder.typicode.com";

function getSortParams(sortBy: SortingState) {
  return sortBy?.length > 0 ? sortBy?.map((item) => item.id).join(",") : "";
}

function getOrderParams(sortBy: SortingState) {
  return sortBy?.length > 0
    ? sortBy?.map((item) => (item.desc ? "desc" : "asc")).join(",")
    : "";
}

function getFilterParams(filters: { [key: string]: any }) {
  return Object.keys(filters || {})
    .map((key) => {
      return filters?.[key]
        ? `${key.toString()}=${filters?.[key].toString()}`
        : "";
    })
    .join("&");
}

export const generatePath = (
  resource: string,
  query?: string,
  pagination?: PaginationState,
  sortBy?: SortingState,
  filters?: { [key: string]: any }
) => {
  const sortParam = getSortParams(sortBy || []);
  const orderParam = getOrderParams(sortBy || []);
  const filterParams = getFilterParams(filters || {});

  if (pagination) {
    let rootPath = `${BASE_URL}/${resource}?_page=${
      pagination.pageIndex + 1
    }&_limit=${pagination.pageSize}`;

    if (query) rootPath += `&q=${query}`;
    if (orderParam) rootPath += `&_sort=${sortParam}`;
    if (sortParam) rootPath += `&_order=${orderParam}`;
    if (filterParams) rootPath += `&${filterParams}`;

    return rootPath;
  } else {
    return `${BASE_URL}/${resource}`;
  }
};
