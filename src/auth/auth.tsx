import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "./useAuth";
import { toast } from "sonner";
import { useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem("auth-token"),
  );

  const getUserQuery = useQuery({
    queryKey: ["auth", sessionToken],
    queryFn: async () => {
      if (sessionToken) {
        const response = await fetch("https://dummyjson.com/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (response.ok) {
          return await response.json();
        }
      }

      return null;
    },
  });

  const postUserMutation = useMutation({
    mutationKey: ["auth"],
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return await response.json();
    },
    onError: (error) => {
      toast.error("Неправильный логин или пароль");
      console.error(error);
    },
  });

  if (getUserQuery.isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Авторизация...
      </div>
    );
  }

  const login = async (
    username: string,
    password: string,
    remember: boolean,
  ) => {
    try {
      const data = await postUserMutation.mutateAsync({ username, password });

      if (remember) {
        localStorage.setItem("auth-token", data.accessToken);
      }
      setSessionToken(data.accessToken);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: getUserQuery.data,
        isAuthenticated: !!getUserQuery.data,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
