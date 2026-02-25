import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type RowSelectionState,
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
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  CircleEllipsis,
  CirclePlus,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn, sortByToState, stateToSortBy } from "@/lib/utils";
import { useDebounce, useFilters } from "@/lib/hooks";
import {
  useGetProductsQuery,
  type Product,
  type ProductsFilters,
} from "@/api/products/useGetProductsQuery";
import { AddProductForm } from "@/components/add-product-form";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
  validateSearch: () => ({}) as ProductsFilters,
});

const initialPagination = {
  pageIndex: 0,
  pageSize: 20,
};

function Index() {
  const [pagination, setPagination] = useState(initialPagination);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [search, setSearch] = useState("");
  const searchQuery = useDebounce(search, 500);

  useEffect(() => {
    setPagination(initialPagination);
  }, [searchQuery]);

  const { filters, setFilters } = useFilters(Route.id);
  const sortingState = sortByToState(filters.sortBy);

  const { data, refetch } = useGetProductsQuery({
    pagination,
    sorting: sortingState,
    searchQuery,
  });

  const table = useReactTable({
    data: data?.products || [],
    columns,
    state: {
      sorting: sortingState,
      pagination,
      rowSelection,
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,

    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updaterOrValue) => {
      const newSortingState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sortingState)
          : updaterOrValue;
      return setFilters({ sortBy: stateToSortBy(newSortingState) });
    },

    manualPagination: true,
    manualSorting: true,

    pageCount: data?.total ? Math.ceil(data.total / pagination.pageSize) : 0,
  });

  const firstItemIndexShown =
    table.getState().pagination.pageSize *
      table.getState().pagination.pageIndex +
    1;

  const lastItemIndexShow =
    table.getState().pagination.pageSize *
      table.getState().pagination.pageIndex +
    table.getRowCount();

  return (
    <div className="w-full">
      <div className="flex items-center p-8 justify-center border-y-20 border-muted relative">
        <h1 className="mr-2 absolute left-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          Товары
        </h1>
        <InputGroup className="max-w-1/2 bg-muted border-none shadow-none h-11">
          <InputGroupInput
            placeholder="Найти"
            onChange={(event) => setSearch(event.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex justify-between p-8">
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight ">
          Все позиции
        </h2>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="text-muted-foreground" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <CirclePlus />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить товар</DialogTitle>
              </DialogHeader>
              <AddProductForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="overflow-hidden border-b w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}

                          {{
                            asc: (
                              <ArrowDownNarrowWide
                                className="text-muted-foreground"
                                width={16}
                              />
                            ),
                            desc: (
                              <ArrowUpNarrowWide
                                className="text-muted-foreground"
                                width={16}
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
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
                    onClick={row.getToggleSelectedHandler()}
                    className={cn(
                      "border-l-2 border-l-transparent",
                      row.getIsSelected() && "border-l-[#3c538e]",
                    )}
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
                    Нет данных
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex justify-between items-center p-8">
        <div className="flex">
          <div className="text-muted-foreground flex-1 text-sm">
            Показано{" "}
            <b>
              {firstItemIndexShown}-{lastItemIndexShow}{" "}
            </b>
            из <b>{data?.total}</b>
          </div>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
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
      </div>
    </div>
  );
}

const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        className="data-[state=checked]:bg-[#3c538e]"
        aria-label="Выбрать все позиции"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Выбрать позицию"
        className="data-[state=checked]:bg-[#3c538e]"
        hideIcon
      />
    ),
  },
  {
    accessorKey: "title",
    header: "Наименование",
    cell: ({ row }) => {
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
            <p className="font-semibold leading-none">
              {row.getValue("title")}
            </p>
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
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button
            className="h-5 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Plus />
          </Button>
          <button onClick={(e) => e.stopPropagation()}>
            <CircleEllipsis className="text-muted-foreground/50" />
          </button>
        </div>
      );
    },
  },
];
