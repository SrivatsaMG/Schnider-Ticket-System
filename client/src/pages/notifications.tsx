import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Bell } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  ticket_id: string;
  reply_id?: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      ticket_id: "ticket-001",
      type: "reply",
      message: "Someone replied to your ticket: Product Setup Issue",
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      ticket_id: "ticket-002",
      type: "assignment",
      message: "You have been assigned to ticket: Server Maintenance",
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      ticket_id: "ticket-003",
      type: "status_change",
      message: "Ticket status changed to resolved: Bug Fix Completed",
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const typeColor = {
    reply: "bg-blue-100 text-blue-800",
    assignment: "bg-purple-100 text-purple-800",
    status_change: "bg-green-100 text-green-800",
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-96 bg-white rounded-lg shadow-2xl border-2 border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-600">{unreadCount} unread</p>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="icon"
          className="hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                notification.is_read
                  ? "bg-gray-50 border-gray-200 hover:border-gray-300"
                  : "bg-blue-50 border-blue-200 hover:border-blue-300"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={
                        typeColor[notification.type as keyof typeof typeColor]
                      }
                    >
                      {notification.type}
                    </Badge>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t-2 border-gray-200 p-3 bg-gray-50 flex justify-between">
          <Button
            onClick={() => setNotifications(notifications.map((n) => ({ ...n, is_read: true })))}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Mark All Read
          </Button>
          <Button
            onClick={() => setNotifications([])}
            variant="outline"
            size="sm"
            className="text-xs text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
