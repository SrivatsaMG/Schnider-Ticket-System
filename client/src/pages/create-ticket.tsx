import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useState } from "react";
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
  priority: "low" | "medium" | "high" | "critical";
}

export default function CreateTicketPage() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateTicketFormData>({
    defaultValues: {
      priority: "medium",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const priority = watch("priority");

  const onSubmit = async (data: CreateTicketFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
            <CardDescription>Report a new production issue</CardDescription>
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
