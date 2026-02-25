import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import logoSvg from "@/assets/logo.svg";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { User, X } from "lucide-react";
import { PasswordInput } from "@/components/password-input";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/",
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect });
    }
  },
  component: LoginComponent,
});

const formSchema = z.object({
  username: z
    .string()
    .min(5, "Логин должен быть не менее 5 символов.")
    .max(32, "Логин должен быть не более 32 символов."),
  password: z
    .string()
    .min(5, "Логин должен быть не менее 5 символов.")
    .max(32, "Логин должен быть не более 32 символов."),
  remember: z.boolean(),
});

function LoginComponent() {
  const navigate = Route.useNavigate();

  const { auth } = Route.useRouteContext();
  const { redirect } = Route.useSearch();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await auth.login(value.username, value.password, value.remember);
      navigate({ to: redirect, from: "/" });
    },
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="p-10 bg-linear-to-b from-gray-50 to-white outline-white outline-6 border-gray-100 border">
            <CardHeader className="text-center">
              <img src={logoSvg} alt="logo" className="m-auto" />
              <CardTitle>
                <h1 className="text-3xl font-bold">Добро пожаловать!</h1>
              </CardTitle>
              <CardDescription>Пожалуйста, авторизуйтесь</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <FieldGroup>
                  <form.Field
                    name="username"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Логин</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Введите логин"
                              autoComplete="username"
                            />
                            <InputGroupAddon>
                              <User />
                            </InputGroupAddon>
                            <InputGroupButton
                              aria-label="clear-username"
                              title="clear"
                              size="icon-xs"
                              className="mr-2"
                              onClick={() => field.handleChange("")}
                            >
                              <X className="text-muted-foreground" />
                            </InputGroupButton>
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />

                  <form.Field
                    name="password"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Пароль</FieldLabel>
                          <PasswordInput field={field} isInvalid={isInvalid} />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />

                  <form.Field
                    name="remember"
                    children={(field) => (
                      <Field orientation="horizontal">
                        <Checkbox
                          id={field.name}
                          name={field.name}
                          checked={field.state.value}
                          onBlur={field.handleBlur}
                          onCheckedChange={(value) =>
                            field.handleChange(
                              value === "indeterminate" ? false : value,
                            )
                          }
                        />
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-muted-foreground"
                        >
                          Запомнить данные
                        </FieldLabel>
                      </Field>
                    )}
                  />

                  <Field>
                    <form.Subscribe
                      selector={(formState) => formState.isSubmitting}
                    >
                      {(isSubmitting) => (
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                          Войти
                        </Button>
                      )}
                    </form.Subscribe>
                  </Field>

                  <FieldSeparator badgeClassName="bg-white">или</FieldSeparator>

                  <FieldDescription className="text-center text-md">
                    Нет аккаунта?{" "}
                    <Button variant="link" className="p-1 text-md" asChild>
                      <Link to="/">Создать</Link>
                    </Button>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
