import type { SortingState } from "@tanstack/react-table";
import { useState, useEffect } from "react";

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

export function useSorting() {
  const [sorting, setSorting] = useState<SortingState>(() => {
    const localStorageItem = localStorage.getItem("sorting");

    if (localStorageItem) {
      return JSON.parse(localStorageItem);
    }

    return [{ id: "id", desc: false }];
  });

  const setSortingHandler = (
    value: SortingState | ((prevState: SortingState) => SortingState),
  ) => {
    setSorting(value);
    localStorage.setItem(
      "sorting",
      JSON.stringify(typeof value === "function" ? value(sorting) : value),
    );
  };

  return [sorting, setSortingHandler] as const;
}
