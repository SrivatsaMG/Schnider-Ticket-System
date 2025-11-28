import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userType = localStorage.getItem("userType");

    if (storedUser && userType === "admin") {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.isAdmin) {
        setUser(parsedUser);
      } else {
        setLocation("/login");
      }
    } else {
      setLocation("/admin-login");
    }
    setIsLoading(false);
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    toast.success("Logged out successfully");
    setLocation("/login");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-900">Admin Dashboard</h1>
            <p className="text-purple-600 mt-1">Administrator Panel</p>
          </div>
          <Button
            data-testid="button-admin-logout"
            onClick={handleLogout}
            variant="outline"
            className="border-purple-200"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-2 border-purple-200">
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>Your admin profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p data-testid="text-admin-username" className="text-lg font-semibold">
                    {user.username}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p data-testid="text-admin-email" className="text-lg font-semibold">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p data-testid="text-admin-role" className="text-lg font-semibold text-purple-600">
                    Administrator
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p data-testid="text-admin-created" className="text-lg font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-purple-200">
            <CardHeader>
              <CardTitle>Admin Controls</CardTitle>
              <CardDescription>Administrative functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Dashboard Features</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>✓ View admin profile</li>
                    <li>✓ Manage system</li>
                    <li>✓ Admin utilities</li>
                  </ul>
                </div>
                <Button
                  data-testid="button-back-to-login"
                  onClick={() => setLocation("/login")}
                  variant="outline"
                  className="w-full border-purple-200"
                >
                  Go to User Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-2 border-purple-200 mt-6">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Admin ID</p>
                <p data-testid="text-admin-id" className="font-mono text-xs mt-1 break-all">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Access Level</p>
                <p className="font-semibold text-purple-600 mt-1">Full Admin</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-green-600 mt-1">Active</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-semibold mt-1">Just now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
