import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation("/login");
    }
    setIsLoading(false);
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {user.username}!</h1>
          <Button
            data-testid="button-logout"
            onClick={handleLogout}
            variant="outline"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p data-testid="text-username" className="text-lg font-semibold">
                    {user.username}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p data-testid="text-email" className="text-lg font-semibold">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p data-testid="text-created-at" className="text-lg font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Production System</CardTitle>
              <CardDescription>Ticket Management System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Ticket className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold">Manage Tickets</p>
                  <p className="text-sm text-gray-600">Track and manage production issues</p>
                </div>
              </div>
              <Button
                data-testid="button-tickets"
                onClick={() => setLocation("/tickets")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Tickets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
