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
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-center items-center p-8 text-white">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold">Schnider</h1>
            <p className="text-2xl font-light text-blue-100">Ticket System</p>
          </div>
          <p className="text-lg text-blue-200 max-w-sm">Professional Production Issue Management Platform</p>
          <div className="pt-8 space-y-4 text-left bg-blue-700 bg-opacity-50 p-6 rounded-xl">
            <p className="font-semibold text-blue-100">Key Features:</p>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li>✓ Role-based access control</li>
              <li>✓ File attachments support</li>
              <li>✓ Real-time notifications</li>
              <li>✓ Ticket tracking & management</li>
              <li>✓ Multi-plant organization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your Schnider Ticket System account</p>
          </div>

          {/* Demo Credentials Alert */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <p className="text-sm font-bold text-amber-900 mb-2">Demo Login Credentials:</p>
            <div className="space-y-1 text-xs text-amber-800">
              <p><span className="font-semibold">Admin:</span> admin@example.com / admin123</p>
              <p><span className="font-semibold">Manager:</span> manager@example.com / manager123</p>
              <p><span className="font-semibold">Employee:</span> Register new account</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                Email Address
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                placeholder="you@example.com"
                type="email"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-base font-medium"
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
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="input-password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-base font-medium pr-12"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
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
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              data-testid="button-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mt-8"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-700">
              Don't have an account?{" "}
              <button
                data-testid="link-register"
                onClick={() => setLocation("/register")}
                className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
              >
                Create one
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            <p>© 2024 Schnider Ticket System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
