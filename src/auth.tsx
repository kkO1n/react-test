import { useMutation, useQuery } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getUserQuery = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const token = localStorage.getItem("auth-token");

      if (token) {
        try {
          const response = await fetch("https://dummyjson.com/auth/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          const userData = await response.json();

          if (userData.ok) {
            return userData.user;
          } else {
            localStorage.removeItem("auth-token");
          }
        } catch (error) {
          console.error(error);
          localStorage.removeItem("auth-token");
        }
      }

      return null;
    },
  });

  const postUserMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const data = await response.json();

      localStorage.setItem("auth-token", data.token);

      return data;
    },
  });

  if (getUserQuery.isLoading || postUserMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const login = async (username: string, password: string) => {
    await postUserMutation.mutateAsync({ username, password });
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
  };

  return (
    <AuthContext.Provider
      value={{
        user: getUserQuery.data,
        isAuthenticated: !!getUserQuery.data,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
