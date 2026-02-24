import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getUserQuery = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const token = localStorage.getItem("auth-token");

      if (token) {
        const response = await fetch("https://dummyjson.com/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
      try {
        const response = await fetch("https://dummyjson.com/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();
        localStorage.setItem("auth-token", data.accessToken);
        return data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  if (getUserQuery.isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Авторизация...
      </div>
    );
  }

  const login = async (username: string, password: string) => {
    await postUserMutation.mutateAsync({ username, password });
    await getUserQuery.refetch();
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
