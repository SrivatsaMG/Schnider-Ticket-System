import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Admin login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", "admin");
      toast.success("Admin login successful!");
      setLocation("/admin-dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Admin login failed");
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    await loginMutation.mutateAsync(data);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Card className="w-full max-w-md shadow-lg border-2 border-purple-200">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-purple-900">Admin Access</CardTitle>
          <CardDescription>Login to admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-purple-50 border-purple-200">
            <AlertDescription className="text-sm text-purple-800">
              <strong>Demo Admin Credentials:</strong>
              <br />
              Email: admin@example.com
              <br />
              Password: admin123
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-admin-email"
                placeholder="admin@example.com"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500" data-testid="error-admin-email">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-admin-password"
                placeholder="••••••••"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500" data-testid="error-admin-password">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              data-testid="button-admin-login"
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Admin Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              data-testid="link-back-to-login"
              onClick={() => setLocation("/login")}
              className="text-purple-600 hover:underline font-medium"
            >
              Back to User Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
