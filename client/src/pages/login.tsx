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
import { Eye, EyeOff } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed");
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    await loginMutation.mutateAsync(data);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10">
        <CardHeader className="space-y-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold">Schnider</CardTitle>
            <CardDescription className="text-blue-100 text-lg">Ticket System</CardDescription>
          </div>
          <p className="text-sm text-blue-100">Professional Production Issue Management</p>
        </CardHeader>

        <CardContent className="pt-8">
          <Alert className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg">
            <AlertDescription className="text-sm text-amber-900">
              <strong className="block mb-2">🔐 Demo Credentials:</strong>
              <div className="space-y-1 text-xs">
                <div><span className="font-semibold">Admin:</span> admin@example.com / admin123</div>
                <div><span className="font-semibold">Manager:</span> manager@example.com / manager123</div>
                <div><span className="font-semibold">Employee:</span> Register new account</div>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                📧 Email Address
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                placeholder="your@email.com"
                type="email"
                className="h-11 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-medium" data-testid="error-email">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field with Show/Hide */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                🔐 Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="input-password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  className="h-11 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base pr-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  data-testid="button-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 font-medium" data-testid="error-password">
                  ⚠️ {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              data-testid="button-login"
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Logging in...
                </span>
              ) : (
                "🚀 Login"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm">
            <span className="text-gray-600">New here? </span>
            <button
              data-testid="link-register"
              onClick={() => setLocation("/register")}
              className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
            >
              Create Account
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Secure • Reliable • Enterprise-Ready</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
