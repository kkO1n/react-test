import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";

interface UseGetProductsParams {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: { id: string; desc: boolean }[];
  searchQuery?: string;
}

type SortParams = { sortBy: `${string}.${"asc" | "desc"}` };
type Filters<T> = Partial<T & PaginationState & SortParams>;
export type ProductsFilters = Filters<Product>;

export function useGetProductsQuery({
  pagination,
  sorting,
  searchQuery,
}: UseGetProductsParams) {
  return useQuery<ProductsQuery>({
    queryKey: ["products", pagination, sorting, searchQuery],
    queryFn: async () => {
      const response = await fetch(
        buildUrl({ pagination, sorting, searchQuery }),
      );
      return await response.json();
    },
    placeholderData: keepPreviousData,
  });
}

function buildUrl({
  pagination,
  sorting,
  searchQuery,
}: UseGetProductsParams): string {
  const url = new URL("https://dummyjson.com/products/search");

  url.searchParams.set("limit", String(pagination.pageSize));
  url.searchParams.set(
    "skip",
    String(pagination.pageIndex * pagination.pageSize),
  );

  if (searchQuery) {
    url.searchParams.set("q", searchQuery);
  }

  if (sorting.length > 0) {
    const sort = sorting[0];
    url.searchParams.set("sortBy", sort.id);
    url.searchParams.set("order", sort.desc ? "desc" : "asc");
  }

  return url.toString();
}

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: string;
  rating: string;
  sku: string;
  thumbnail: string;
};

export type ProductsQuery = {
  limit: number;
  skip: 0;
  total: number;
  products: Product[];
};
