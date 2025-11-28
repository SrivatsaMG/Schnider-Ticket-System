import { useForm } from "react-hook-form";
import { useLocation, useParams } from "wouter";
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

interface EditUserFormData {
  role: "admin" | "manager" | "employee";
  plant?: string;
  department?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  plant?: string;
  department?: string;
}

interface Plant {
  id: string;
  name: string;
}

export default function AdminEditUserPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const userId = params.id;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<EditUserFormData>({
    defaultValues: {
      role: "employee",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const role = watch("role");
  const plant = watch("plant");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        setCurrentUser(parsedUser);
        fetchPlants();
        fetchUser();
      } else {
        toast.error("Admin access required");
        setLocation("/admin-dashboard");
      }
    } else {
      setLocation("/login");
    }
  }, [setLocation, userId]);

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

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users?user=${encodeURIComponent(JSON.stringify(currentUser || {}))}`);
      if (response.ok) {
        const users = await response.json();
        const user = users.find((u: any) => u.id === userId);
        if (user) {
          setEditingUser(user);
          setValue("role", user.role);
          if (user.plant) setValue("plant", user.plant);
          if (user.department) setValue("department", user.department);
        }
      }
    } catch (error) {
      console.error("Failed to load user");
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: EditUserFormData) => {
    if (!currentUser) return;

    // Validate that managers have a plant assigned
    if (data.role === "manager" && !data.plant) {
      toast.error("Please select a plant for this manager");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}?user=${encodeURIComponent(JSON.stringify(currentUser))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: data.role,
          plant: data.plant || null,
          department: data.department,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user");
      }

      toast.success("User updated successfully!");
      setLocation("/admin-users");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isLoadingData) {
    return <div className="flex items-center justify-center min-h-screen">Loading user data...</div>;
  }

  if (!editingUser) {
    return <div className="flex items-center justify-center min-h-screen">User not found</div>;
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
            <CardTitle className="text-2xl">Edit User</CardTitle>
            <CardDescription>Update user role and plant assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  value={editingUser.username}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  value={editingUser.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Cannot be changed</p>
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
                  defaultValue={editingUser.department || ""}
                  onChange={(e) => setValue("department", e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  data-testid="button-submit"
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update User"}
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
