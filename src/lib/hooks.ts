import {
  type RouteIds,
  type RegisteredRouter,
  getRouteApi,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cleanEmptyParams } from "./utils";

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useFilters<T extends RouteIds<RegisteredRouter["routeTree"]>>(
  routeId: T,
) {
  const routeApi = getRouteApi<T>(routeId);
  const navigate = useNavigate();
  const filters = routeApi.useSearch();

  const setFilters = (partialFilters: Partial<typeof filters>) =>
    navigate({
      to: ".",
      search: (prev) => cleanEmptyParams({ ...prev, ...partialFilters }),
    });

  return { filters, setFilters };
}
