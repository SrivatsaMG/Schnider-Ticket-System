import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const password = watch("password");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Registration successful! Please login.");
      setLocation("/login");
    },
    onError: (error: any) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    await registerMutation.mutateAsync(data);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join us today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-username"
                placeholder="your username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
              />
              {errors.username && (
                <p className="text-sm text-red-500" data-testid="error-username">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-email"
                placeholder="your@email.com"
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
                <p className="text-sm text-red-500" data-testid="error-email">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-password"
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
                <p className="text-sm text-red-500" data-testid="error-password">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                data-testid="input-confirm-password"
                placeholder="••••••••"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500" data-testid="error-confirm-password">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              data-testid="button-register"
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span>Already have an account? </span>
            <button
              data-testid="link-login"
              onClick={() => setLocation("/login")}
              className="text-purple-600 hover:underline font-medium"
            >
              Login here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
