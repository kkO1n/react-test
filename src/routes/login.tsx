import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Input } from "../components/ui/input";
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
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
      navigate({ to: redirect });
    },
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Добро пожаловать!</CardTitle>
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
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Введите логин"
                          />
                          <FieldDescription>
                            Пожалуйста введите логин
                          </FieldDescription>
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
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Введите пароль"
                            autoComplete="off"
                          />
                          <FieldDescription>
                            Пожалуйста введите пароль
                          </FieldDescription>
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
                        <FieldLabel htmlFor={field.name}>
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
                        <Button type="submit" disabled={isSubmitting}>
                          Войти
                        </Button>
                      )}
                    </form.Subscribe>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
