import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { User, LoginCredentials, RegisterData } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<{ user: User } | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: user?.user || null,
    isLoading,
    isAuthenticated: !!user?.user,
  };
}

export function useLogin() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/dashboard");
      toast({
        title: "Berhasil masuk",
        description: "Selamat datang kembali!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal masuk",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/dashboard");
      toast({
        title: "Berhasil mendaftar",
        description: "Akun Anda telah dibuat. Selamat datang di SurveyKu!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal mendaftar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
      toast({
        title: "Berhasil keluar",
        description: "Sampai jumpa!",
      });
    },
  });
}
