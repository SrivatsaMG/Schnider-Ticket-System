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

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { register: registerUser, handleSubmit: handleSubmitUser, formState: { errors: errorsUser }, reset: resetUser } = useForm<LoginFormData>();
  const { register: registerAdmin, handleSubmit: handleSubmitAdmin, formState: { errors: errorsAdmin }, reset: resetAdmin } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", "user");
      toast.success("Login successful!");
      
      if (data.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/dashboard");
      }
      resetUser();
      resetAdmin();
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed");
    },
  });

  const onSubmitUser = async (data: LoginFormData) => {
    setIsLoading(true);
    await loginMutation.mutateAsync(data);
    setIsLoading(false);
  };

  const onSubmitAdmin = async (data: LoginFormData) => {
    setIsLoading(true);
    await loginMutation.mutateAsync(data);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Ticket Management System</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdminMode ? (
            <>
              <form onSubmit={handleSubmitUser(onSubmitUser)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    placeholder="your@email.com"
                    type="email"
                    {...registerUser("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errorsUser.email && (
                    <p className="text-sm text-red-500" data-testid="error-email">
                      {errorsUser.email.message}
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
                    {...registerUser("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {errorsUser.password && (
                    <p className="text-sm text-red-500" data-testid="error-password">
                      {errorsUser.password.message}
                    </p>
                  )}
                </div>

                <Button
                  data-testid="button-login"
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="mt-4 space-y-3 text-center text-sm">
                <div>
                  <span>Don't have an account? </span>
                  <button
                    data-testid="link-register"
                    onClick={() => setLocation("/register")}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Register here
                  </button>
                </div>
                <div className="pt-2 border-t">
                  <button
                    data-testid="link-admin"
                    onClick={() => setIsAdminMode(true)}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Admin Access
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Alert className="mb-4 bg-purple-50 border-purple-200">
                <AlertDescription className="text-sm text-purple-800">
                  <strong>Demo Admin Credentials:</strong>
                  <br />
                  Email: admin@example.com
                  <br />
                  Password: admin123
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmitAdmin(onSubmitAdmin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    data-testid="input-admin-email"
                    placeholder="admin@example.com"
                    type="email"
                    {...registerAdmin("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errorsAdmin.email && (
                    <p className="text-sm text-red-500" data-testid="error-admin-email">
                      {errorsAdmin.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    data-testid="input-admin-password"
                    placeholder="••••••••"
                    type="password"
                    {...registerAdmin("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {errorsAdmin.password && (
                    <p className="text-sm text-red-500" data-testid="error-admin-password">
                      {errorsAdmin.password.message}
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
                  onClick={() => setIsAdminMode(false)}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Back to User Login
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
