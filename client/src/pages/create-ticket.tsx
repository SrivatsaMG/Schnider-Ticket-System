import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      setLocation("/login");
    }
    setIsLoading(false);
  }, [setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const roleDisplay = {
    admin: "Administrator",
    manager: "Plant Manager",
    employee: "Employee",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
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
              <CardTitle className="text-2xl">User Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Username</Label>
                    <Input
                      data-testid="input-username"
                      type="text"
                      value={user.username}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Email</Label>
                    <Input
                      data-testid="input-email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Role</Label>
                    <Input
                      data-testid="input-role"
                      type="text"
                      value={roleDisplay[user.role as keyof typeof roleDisplay] || user.role}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Department</Label>
                    <Input
                      data-testid="input-department"
                      type="text"
                      value={user.department || "N/A"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Member Since</Label>
                    <Input
                      data-testid="input-created-at"
                      type="text"
                      value={new Date(user.createdAt).toLocaleDateString()}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">User ID</Label>
                    <Input
                      data-testid="input-user-id"
                      type="text"
                      value={user.id}
                      disabled
                      className="bg-gray-50 text-xs"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Account Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p data-testid="text-account-status">✓ Account is active</p>
                    <p data-testid="text-access-level">✓ All features unlocked</p>
                    <p data-testid="text-password-info">✓ Password protected</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t flex gap-3">
                  <Button
                    data-testid="button-back-dashboard"
                    onClick={() => setLocation("/dashboard")}
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
