import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "employee";
  plant?: string;
  department?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface Plant {
  id: string;
  name: string;
}

export default function AdminCreateUserPage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateUserFormData>({
    defaultValues: {
      role: "employee",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const role = watch("role");
  const plant = watch("plant");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        setCurrentUser(parsedUser);
        fetchPlants();
      } else {
        toast.error("Admin access required");
        setLocation("/admin-dashboard");
      }
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const fetchPlants = async () => {
    try {
      const response = await fetch("/api/plants");
      if (response.ok) {
        const data = await response.json();
        setPlants(data);
      }
    } catch (error) {
      console.error("Failed to load plants");
    }
  };

  const onSubmit = async (data: CreateUserFormData) => {
    // Validate that managers have a plant assigned
    if (data.role === "manager" && !data.plant) {
      toast.error("Please select a plant for this manager");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/admin-create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      toast.success("User created successfully!");
      setLocation("/admin-users");
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
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
          onClick={() => setLocation("/admin-users")}
          variant="outline"
          className="mb-6"
        >
          ← Back to Users
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create New User</CardTitle>
            <CardDescription>Add a new user, manager, or admin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  placeholder="john_doe"
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
                  placeholder="john@example.com"
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
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setValue("role", value as any)}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white/95 backdrop-blur-sm">
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === "manager" && (
                <div className="space-y-2">
                  <Label htmlFor="plant">Plant <span className="text-red-500">*</span></Label>
                  <Select value={plant || ""} onValueChange={(value) => setValue("plant", value)}>
                    <SelectTrigger 
                      data-testid="select-plant"
                      className="h-10 text-base border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                    >
                      <SelectValue placeholder="Select a plant" />
                    </SelectTrigger>
                    <SelectContent className="z-50 border-2 border-gray-300 rounded-lg shadow-xl bg-white/95 backdrop-blur-sm">
                      {plants.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center">No plants available</div>
                      ) : (
                        plants.map((p) => (
                          <SelectItem 
                            key={p.id} 
                            value={p.name}
                            className="py-3 px-4 cursor-pointer hover:bg-blue-100 focus:bg-blue-200 transition-all duration-150"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="font-medium">{p.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  data-testid="input-department"
                  placeholder="Operations"
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
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
                <Button
                  data-testid="button-cancel"
                  type="button"
                  onClick={() => setLocation("/admin-users")}
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
