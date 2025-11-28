import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdById: string;
  assignedToId: string | null;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string;
}

const priorityColor = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColor = {
  open: "bg-green-100 text-green-800",
  inProgress: "bg-purple-100 text-purple-800",
  resolved: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800",
};

export default function TicketsPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTickets(parsedUser);
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const fetchTickets = async (currentUser: User) => {
    try {
      const response = await fetch(`/api/tickets?user=${encodeURIComponent(JSON.stringify(currentUser))}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        toast.error("Failed to load tickets");
      }
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Production Tickets</h1>
            <p className="text-gray-600 mt-1">Manage and track production issues</p>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-create-ticket"
              onClick={() => setLocation("/create-ticket")}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Ticket
            </Button>
            <Button
              data-testid="button-logout"
              onClick={handleLogout}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="pt-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tickets found. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                data-testid={`card-ticket-${ticket.id}`}
                className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setLocation(`/ticket/${ticket.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle data-testid={`text-ticket-title-${ticket.id}`}>
                        {ticket.title}
                      </CardTitle>
                      <CardDescription>{ticket.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={priorityColor[ticket.priority as keyof typeof priorityColor]}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={statusColor[ticket.status as keyof typeof statusColor]}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.assignedToId && <span>Assigned: Yes</span>}
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
