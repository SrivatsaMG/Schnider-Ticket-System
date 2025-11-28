import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  isAdmin: boolean;
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

export default function TicketDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/ticket/:id");
  const [user, setUser] = useState<User | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTicket(parsedUser);
      fetchUsers();
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const fetchTicket = async (currentUser: User) => {
    try {
      const response = await fetch(`/api/tickets/${params?.id}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      }
    } catch (error) {
      toast.error("Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.log("Failed to load users");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        setTicket(result.ticket);
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAssignTicket = async (userId: string) => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const result = await response.json();
        setTicket(result.ticket);
        toast.success("Ticket assigned");
      }
    } catch (error) {
      toast.error("Failed to assign ticket");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !ticket) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          data-testid="button-back"
          onClick={() => setLocation("/tickets")}
          variant="outline"
          className="mb-6"
        >
          ← Back to Tickets
        </Button>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle data-testid="text-ticket-title" className="text-3xl">
                  {ticket.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  Ticket ID: {ticket.id}
                </CardDescription>
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
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p data-testid="text-description" className="text-gray-900">
                  {ticket.description}
                </p>
              </div>

              {user.isAdmin && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={ticket.status} onValueChange={handleUpdateStatus}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign To</label>
                    <Select
                      value={ticket.assignedToId || ""}
                      onValueChange={handleAssignTicket}
                    >
                      <SelectTrigger data-testid="select-assign">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-4 border-t">
                <div>
                  <p className="font-medium">Created</p>
                  <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium">Assigned To</p>
                  <p>{ticket.assignedToId ? "Yes" : "Unassigned"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
