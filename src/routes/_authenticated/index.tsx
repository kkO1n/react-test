import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

type Product = {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: string;
  rating: string;
  sku: string;
  thumbnail: string;
};

type ProductsQuery = {
  limit: number;
  skip: 0;
  total: number;
  products: Product[];
};

function Index() {
  const { data } = useQuery<ProductsQuery>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("https://dummyjson.com/products");
      return await response.json();
    },
  });

  const products = data?.products;

  const table = useReactTable({
    data: products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  console.log(products?.[0]);

  return (
    <div>
      <div className="flex items-center justify-center w-full p-10">
        <div className="overflow-hidden rounded-md border w-1/2">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex w-25 items-center justify-center text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <Pagination>
        <PaginationContent>
          {Array.from({ length: table.getPageCount() }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => table.setPageIndex(index)}
                isActive={index === table.getState().pagination.pageIndex}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              className={
                table.getState().pagination.pageIndex <= 0
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              className={
                table.getState().pagination.pageIndex >=
                table.getPageCount() - 1
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "title",
    header: "Наименование",
    cell: ({ row }) => {
      console.log(row);
      return (
        <div className="flex gap-4 items-center">
          <div className="w-full max-w-12">
            <AspectRatio ratio={1 / 1} className="bg-muted rounded-lg">
              <img
                src={row.original.thumbnail}
                alt={row.original.title}
                className="rounded-lg grayscale dark:brightness-20 h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
          <div className="space-y-1">
            <p className="font-medium leading-none">{row.getValue("title")}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.category}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Вендор",
    cell: ({ getValue }) => {
      return <b>{getValue<string>()}</b>;
    },
  },
  {
    accessorKey: "sku",
    header: "Артикул",
  },
  {
    accessorKey: "rating",
    header: "Оценка",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("rating"));

      return (
        <span>
          <span className={amount < 3 ? "text-red-500" : ""}>{amount}</span>
          /5
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];
