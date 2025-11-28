import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateTicketFormData {
  title: string;
  description: string;
  category: string;
  plant: string;
  priority: "low" | "medium" | "high" | "critical";
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  plant?: string;
  department?: string;
  createdAt: string;
}

const CATEGORIES = ["General", "Bug", "Feature Request", "Issue Report", "Maintenance", "Other"];

export default function CreateTicketPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Array<{ id: string; name: string }>>([]);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateTicketFormData>({
    defaultValues: {
      priority: "medium",
      category: "General",
      plant: user?.plant || "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const priority = watch("priority");
  const category = watch("category");
  const plant = watch("plant");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.plant) {
        setValue("plant", parsedUser.plant);
      }
    } else {
      setLocation("/login");
    }
  }, [setLocation, setValue]);

  useEffect(() => {
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
    fetchPlants();
  }, []);

  const onSubmit = async (data: CreateTicketFormData) => {
    if (!user) {
      toast.error("User not found");
      return;
    }

    setIsLoading(true);
    try {
      const ticketData = {
        title: data.title,
        description: data.description,
        category: data.category,
        plant: data.plant,
        priority: data.priority,
      };

      const response = await fetch(`/api/tickets?user=${encodeURIComponent(JSON.stringify(user))}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create ticket");
      }

      const result = await response.json();
      toast.success("Ticket created successfully!");
      setLocation("/tickets");
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          data-testid="button-back"
          onClick={() => setLocation("/tickets")}
          variant="outline"
          className="mb-6"
        >
          ← Back to Tickets
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Ticket</CardTitle>
            <CardDescription>Report a new production issue or request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Ticket Title</Label>
                <Input
                  id="title"
                  data-testid="input-ticket-title"
                  placeholder="Production server down"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 5,
                      message: "Title must be at least 5 characters",
                    },
                  })}
                />
                {errors.title && (
                  <p className="text-sm text-red-500" data-testid="error-title">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="textarea-description"
                  placeholder="Describe the issue in detail..."
                  className="min-h-[150px]"
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters",
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-500" data-testid="error-description">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plant">Plant</Label>
                <Select value={plant} onValueChange={(value) => setValue("plant", value)}>
                  <SelectTrigger data-testid="select-plant">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.length === 0 ? (
                      <SelectItem value="" disabled>
                        No plants available
                      </SelectItem>
                    ) : (
                      plants.map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setValue("priority", value as any)}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  data-testid="button-submit"
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Ticket"}
                </Button>
                <Button
                  data-testid="button-cancel"
                  type="button"
                  onClick={() => setLocation("/tickets")}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
