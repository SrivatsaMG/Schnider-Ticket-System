import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";

interface Plant {
  id: string;
  name: string;
  location?: string;
  managerId?: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  plant?: string;
}

export default function AdminPlantsPage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [plantName, setPlantName] = useState("");
  const [plantLocation, setPlantLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        setCurrentUser(parsedUser);
        fetchPlants();
      } else {
        toast.error("Admin access required");
        setLocation("/dashboard");
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

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantName) {
      toast.error("Plant name is required");
      return;
    }

    setIsLoading(true);
    try {
      const userStr = encodeURIComponent(JSON.stringify(currentUser));
      const response = await fetch(`/api/plants?user=${userStr}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plantName,
          location: plantLocation,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create plant");
      }

      toast.success("Plant created successfully!");
      setPlantName("");
      setPlantLocation("");
      setShowForm(false);
      await fetchPlants();
    } catch (error: any) {
      toast.error(error.message || "Failed to create plant");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-900">Plant Management</h1>
            <p className="text-purple-600 mt-1">Create and manage production plants</p>
          </div>
          <Button
            data-testid="button-back"
            onClick={() => setLocation("/admin-dashboard")}
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {showForm && (
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Create New Plant</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePlant} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plant-name">Plant Name</Label>
                  <Input
                    id="plant-name"
                    data-testid="input-plant-name"
                    placeholder="Plant A"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plant-location">Location</Label>
                  <Input
                    id="plant-location"
                    data-testid="input-plant-location"
                    placeholder="City, Country"
                    value={plantLocation}
                    onChange={(e) => setPlantLocation(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    data-testid="button-create"
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Plant"}
                  </Button>
                  <Button
                    data-testid="button-cancel"
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!showForm && (
          <div className="mb-8">
            <Button
              data-testid="button-add-plant"
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Plant
            </Button>
          </div>
        )}

        {plants.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="pt-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No plants found. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {plants.map((plant) => (
              <Card key={plant.id} data-testid={`card-plant-${plant.id}`} className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 data-testid={`text-plant-name-${plant.id}`} className="text-lg font-semibold">
                        {plant.name}
                      </h3>
                      {plant.location && (
                        <p data-testid={`text-location-${plant.id}`} className="text-sm text-gray-600">
                          {plant.location}
                        </p>
                      )}
                    </div>
                    <Button
                      data-testid={`button-manage-${plant.id}`}
                      onClick={() => setLocation(`/admin-manage-plant/${plant.id}`)}
                      variant="outline"
                    >
                      Manage
                    </Button>
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
