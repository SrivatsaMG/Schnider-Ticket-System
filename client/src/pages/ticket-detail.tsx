import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  category?: string;
  plant?: string;
  createdById: string;
  assignedToId: string | null;
  createdAt: string;
}

interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  createdAt: string;
  userName?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
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
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (params?.id) {
        fetchTicket(parsedUser);
        fetchReplies(params.id);
      }
    } else {
      setLocation("/login");
    }
  }, [params?.id, setLocation]);

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

  const fetchReplies = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (error) {
      console.log("Failed to load replies");
    }
  };

  const handleAddReply = async () => {
    if (!replyMessage.trim() || !ticket || !user) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      const userStr = encodeURIComponent(JSON.stringify(user));
      const response = await fetch(`/api/tickets/${ticket.id}/replies?user=${userStr}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newReply = {
          id: result.reply.id,
          ticketId: result.reply.ticket_id || ticket.id,
          userId: result.reply.user_id || user.id,
          message: result.reply.message,
          createdAt: result.reply.created_at,
          userName: result.reply.userName || user.username,
        };
        setReplies([...replies, newReply]);
        setReplyMessage("");
        toast.success("Reply added successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add reply");
      }
    } catch (error) {
      toast.error("Failed to add reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/tickets/${ticket.id}?user=${encodeURIComponent(JSON.stringify(user))}`, {
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
              <div className="flex-1">
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

              {ticket.category && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Category</p>
                  <p data-testid="text-category" className="text-gray-900">
                    {ticket.category}
                  </p>
                </div>
              )}

              {ticket.plant && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Plant</p>
                  <p data-testid="text-plant" className="text-gray-900">
                    {ticket.plant}
                  </p>
                </div>
              )}

              {user.role !== "employee" && (
                <div className="pt-4 pb-20 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Update Status</label>
                    <Select value={ticket.status} onValueChange={handleUpdateStatus}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent side="bottom" align="start" className="z-50 bg-white/95 backdrop-blur-sm">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
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

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Conversation Thread</CardTitle>
              <CardDescription>
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {replies.length === 0 ? (
                  <p data-testid="text-no-replies" className="text-gray-500 text-center py-8">
                    No replies yet. Be the first to reply!
                  </p>
                ) : (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      data-testid={`card-reply-${reply.id}`}
                      className="bg-gray-50 p-4 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p data-testid={`text-reply-user-${reply.id}`} className="font-semibold">
                          {reply.userName || "Unknown User"}
                        </p>
                        <p data-testid={`text-reply-date-${reply.id}`} className="text-sm text-gray-600">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p data-testid={`text-reply-message-${reply.id}`} className="text-gray-900">
                        {reply.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-6">
                <p className="text-sm font-medium mb-3">Add Reply</p>
                <div className="space-y-3">
                  <Textarea
                    data-testid="textarea-reply"
                    placeholder="Write your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    data-testid="button-submit-reply"
                    onClick={handleAddReply}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || !replyMessage.trim()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Reply"}
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
