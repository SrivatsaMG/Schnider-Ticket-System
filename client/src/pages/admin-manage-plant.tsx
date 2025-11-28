import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Plant {
  id: string;
  name: string;
  location?: string;
  manager_id?: string;
  created_at?: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

const statusColor = {
  open: "bg-green-100 text-green-800",
  inProgress: "bg-purple-100 text-purple-800",
  resolved: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityColor = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function AdminManagePlantPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin-manage-plant/:id");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [plantTickets, setPlantTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        setCurrentUser(parsedUser);
        if (params?.id) {
          fetchPlantDetails(params.id);
          fetchPlantTickets(params.id);
        }
      } else {
        toast.error("Admin access required");
        setLocation("/dashboard");
      }
    } else {
      setLocation("/login");
    }
  }, [params?.id, setLocation]);

  const fetchPlantDetails = async (plantId: string) => {
    try {
      const response = await fetch("/api/plants");
      if (response.ok) {
        const data = await response.json();
        const foundPlant = data.find((p: Plant) => p.id === plantId);
        if (foundPlant) {
          setPlant(foundPlant);
        } else {
          toast.error("Plant not found");
          setLocation("/admin-plants");
        }
      }
    } catch (error) {
      toast.error("Failed to load plant");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlantTickets = async (plantId: string) => {
    try {
      const response = await fetch("/api/tickets");
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((t: Ticket) => t.plant === plantId);
        setPlantTickets(filtered);
      }
    } catch (error) {
      console.error("Failed to load tickets");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser || !plant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          data-testid="button-back"
          onClick={() => setLocation("/admin-plants")}
          variant="outline"
          className="mb-6"
        >
          ← Back to Plants
        </Button>

        {/* Plant Details */}
        <Card className="shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle data-testid="text-plant-name" className="text-3xl text-purple-900">
                  {plant.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  Plant ID: {plant.id}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {plant.location && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p data-testid="text-location" className="text-gray-900">
                    📍 {plant.location}
                  </p>
                </div>
              )}
              {plant.created_at && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-gray-900">
                    {new Date(plant.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plant Tickets */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Tickets for {plant.name}</CardTitle>
            <CardDescription>
              Total: {plantTickets.length} {plantTickets.length === 1 ? "ticket" : "tickets"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plantTickets.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tickets for this plant yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plantTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    data-testid={`ticket-card-${ticket.id}`}
                    onClick={() => setLocation(`/ticket/${ticket.id}`)}
                    className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 data-testid={`ticket-title-${ticket.id}`} className="font-semibold text-gray-900">
                          {ticket.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{ticket.description.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge className={statusColor[ticket.status as keyof typeof statusColor]}>
                          {ticket.status}
                        </Badge>
                        <Badge className={priorityColor[ticket.priority as keyof typeof priorityColor]}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
