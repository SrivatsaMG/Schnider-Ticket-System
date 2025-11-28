import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  plant?: string;
  department?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        setCurrentUser(parsedUser);
        fetchUsers(parsedUser);
      } else {
        toast.error("Admin access required");
        setLocation("/dashboard");
      }
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const fetchUsers = async (user: User) => {
    try {
      const response = await fetch(`/api/users?user=${encodeURIComponent(JSON.stringify(user))}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const roleColors = {
    admin: "bg-purple-100 text-purple-800",
    manager: "bg-blue-100 text-blue-800",
    employee: "bg-green-100 text-green-800",
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-900">User Management</h1>
            <p className="text-purple-600 mt-1">Manage all system users and plant managers</p>
          </div>
          <Button
            data-testid="button-back"
            onClick={() => setLocation("/admin-dashboard")}
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {users.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="pt-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} data-testid={`card-user-${user.id}`} className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 data-testid={`text-username-${user.id}`} className="text-lg font-semibold">
                        {user.username}
                      </h3>
                      <p data-testid={`text-email-${user.id}`} className="text-sm text-gray-600">
                        {user.email}
                      </p>
                      {user.department && (
                        <p data-testid={`text-department-${user.id}`} className="text-sm text-gray-600">
                          Department: {user.department}
                        </p>
                      )}
                      {user.plant && (
                        <p data-testid={`text-plant-${user.id}`} className="text-sm text-gray-600">
                          Plant: {user.plant}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        data-testid={`badge-role-${user.id}`}
                        className={roleColors[user.role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      <p data-testid={`text-created-${user.id}`} className="text-xs text-gray-500 mt-2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
