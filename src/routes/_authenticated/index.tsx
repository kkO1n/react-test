import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type RowSelectionState,
  type SortingState,
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
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";

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

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function useSorting() {
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

function Index() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useSorting();
  const searchQuery = useDebounce(search, 500);

  const { data, refetch } = useQuery<ProductsQuery>({
    queryKey: [
      "products",
      pagination.pageIndex,
      pagination.pageSize,
      sorting[0]?.id,
      sorting[0]?.desc,
      sorting.length,
      searchQuery,
    ],
    queryFn: async () => {
      const response = await fetch(
        `https://dummyjson.com/products?limit=${pagination.pageSize}&skip=${
          pagination.pageIndex * pagination.pageSize
        }${searchQuery ? `&search=${searchQuery}` : ""}${sorting.length > 0 ? `&sortBy=${sorting[0]?.id}` : ""}${
          sorting.length > 0
            ? `&order=${sorting[0]?.desc ? "desc" : "asc"}`
            : ""
        }`,
      );
      return await response.json();
    },
  });

  const products = data?.products;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data: products || [],
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,

    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,

    manualPagination: true,
    manualSorting: true,

    pageCount: data?.total ? Math.ceil(data.total / pagination.pageSize) : 0,
  });

  const firstItemIndexShown =
    table.getState().pagination.pageSize *
    table.getState().pagination.pageIndex;

  const lastItemIndexShow =
    table.getState().pagination.pageSize *
      table.getState().pagination.pageIndex +
    table.getRowCount();

  return (
    <div className="w-full p-10">
      <div className="flex items-center py-4 justify-center">
        <h1 className="mr-2 absolute left-10">Товары</h1>
        <Input
          placeholder="Найти"
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-1/2"
        />
      </div>
      <div className="flex justify-between mb-10">
        <h2>Все позиции</h2>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => refetch()}>
            <Loader />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Добавить</Button>
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
      <div className="flex items-center justify-center">
        <div className="overflow-hidden rounded-md border w-full">
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
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
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
      <div className="flex justify-between items-center mt-10">
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
        aria-label="Выбрать все позиции"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Выбрать позицию"
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

const formSchema = z.object({
  title: z.string().nonempty("Наименование обязательно"),
  brand: z.string(),
  price: z.number().nonnegative("Цена не может быть отрицательной"),
  sku: z.string(),
});

function AddProductForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      brand: "",
      price: 0,
      sku: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async () => {
      toast("Добавлено");
    },
  });

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Наименование</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Введите наименование"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="brand"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Вендор</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Введите вендора"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="sku"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Артикул</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Введите артикул"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="price"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Цена</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      className="bg-background text-center"
                      min="1"
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      type="number"
                      aria-invalid={isInvalid}
                      placeholder="Введите цену"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <Field>
              <form.Subscribe selector={(formState) => formState.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    Добавить
                  </Button>
                )}
              </form.Subscribe>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
