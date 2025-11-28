import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface CreateEmployeeFormData {
  username: string;
  email: string;
  password: string;
  department?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  plant?: string;
}

export default function ManagerCreateEmployeePage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateEmployeeFormData>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "manager") {
        setCurrentUser(parsedUser);
      } else {
        toast.error("Manager access required");
        setLocation("/dashboard");
      }
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const onSubmit = async (data: CreateEmployeeFormData) => {
    if (!currentUser?.plant) {
      toast.error("Manager must be assigned to a plant");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/manager-create-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          plant: currentUser.plant,
          department: data.department,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create employee");
      }

      toast.success("Employee created successfully!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create employee");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          data-testid="button-back"
          onClick={() => setLocation("/dashboard")}
          variant="outline"
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Employee</CardTitle>
            <CardDescription>Add a new employee to {currentUser.plant}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  placeholder="employee_name"
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                  })}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  placeholder="employee@example.com"
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
                  <p className="text-sm text-red-500">{errors.email.message}</p>
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
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  data-testid="input-department"
                  placeholder="Production"
                  {...register("department")}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  data-testid="button-submit"
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Employee"}
                </Button>
                <Button
                  data-testid="button-cancel"
                  type="button"
                  onClick={() => setLocation("/dashboard")}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
