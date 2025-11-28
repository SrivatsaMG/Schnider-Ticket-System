import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon } from "lucide-react";

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

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const priority = watch("priority");
  const category = watch("category");
  const plant = watch("plant");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File must be less than 10MB");
        return;
      }
      const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|csv)$/i;
      if (!allowedExtensions.test(file.name)) {
        toast.error("Allowed: images, PDF, Word, Excel, TXT, CSV");
        return;
      }
      setSelectedImage(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    if (!data.plant) {
      toast.error("Please select a plant");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("plant", data.plant);
      formData.append("priority", data.priority);
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch(`/api/tickets?user=${encodeURIComponent(JSON.stringify(user))}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create ticket");
      }

      const result = await response.json();
      toast.success(`Ticket ${result.ticket.ticketNumber} created successfully!`);
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
          className="mb-8 hover:bg-gray-100 transition-all duration-200"
        >
          ← Back to Tickets
        </Button>

        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <CardTitle className="text-3xl font-bold text-blue-900">Create New Ticket</CardTitle>
            <CardDescription className="text-blue-700">Report a new production issue or request</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Title Field */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold text-gray-800">
                  Ticket Title
                </Label>
                <Input
                  id="title"
                  data-testid="input-ticket-title"
                  placeholder="Production server down"
                  className="h-12 text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 5,
                      message: "Title must be at least 5 characters",
                    },
                  })}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 font-medium" data-testid="error-title">
                    ⚠️ {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-semibold text-gray-800">
                  Description
                </Label>
                <Textarea
                  id="description"
                  data-testid="textarea-description"
                  placeholder="Describe the issue in detail..."
                  className="min-h-[130px] text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters",
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 font-medium" data-testid="error-description">
                    ⚠️ {errors.description.message}
                  </p>
                )}
              </div>

              {/* Plant Selection */}
              <div className="space-y-3">
                <Label htmlFor="plant" className="text-base font-semibold text-gray-800">
                  Plant <span className="text-red-500">*</span>
                </Label>
                <Select value={plant || ""} onValueChange={(value) => setValue("plant", value)}>
                  <SelectTrigger 
                    data-testid="select-plant"
                    className="h-12 text-base border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                  >
                    <SelectValue placeholder="Select a plant" />
                  </SelectTrigger>
                  <SelectContent className="z-50 border-2 border-gray-300 rounded-lg shadow-xl bg-white/95 backdrop-blur-sm">
                    {plants.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">No plants available</div>
                    ) : (
                      plants.map((p) => (
                        <SelectItem 
                          key={p.id} 
                          value={p.name}
                          className="py-3 px-4 cursor-pointer hover:bg-blue-100 focus:bg-blue-200 transition-all duration-150"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {plant && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 border w-fit">
                    ✓ Selected: {plant}
                  </Badge>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <Label htmlFor="category" className="text-base font-semibold text-gray-800">
                  Category
                </Label>
                <Select value={category} onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger 
                    data-testid="select-category"
                    className="h-12 text-base border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 border-2 border-gray-300 rounded-lg shadow-xl bg-white/95 backdrop-blur-sm">
                    {CATEGORIES.map((cat) => (
                      <SelectItem 
                        key={cat} 
                        value={cat}
                        className="py-3 px-4 cursor-pointer hover:bg-blue-100 focus:bg-blue-200 transition-all duration-150"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="font-medium">{cat}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300 border w-fit">
                    ✓ Category: {category}
                  </Badge>
                )}
              </div>

              {/* Priority Selection */}
              <div className="space-y-3">
                <Label htmlFor="priority" className="text-base font-semibold text-gray-800">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(value) => setValue("priority", value as any)}>
                  <SelectTrigger 
                    data-testid="select-priority"
                    className="h-12 text-base border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 border-2 border-gray-300 rounded-lg shadow-xl bg-white/95 backdrop-blur-sm">
                    <SelectItem 
                      value="low"
                      className="py-3 px-4 cursor-pointer hover:bg-blue-100 focus:bg-blue-200 transition-all duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">🔵 Low</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="medium"
                      className="py-3 px-4 cursor-pointer hover:bg-yellow-100 focus:bg-yellow-200 transition-all duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">🟡 Medium</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="high"
                      className="py-3 px-4 cursor-pointer hover:bg-orange-100 focus:bg-orange-200 transition-all duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-800">🟠 High</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="critical"
                      className="py-3 px-4 cursor-pointer hover:bg-red-100 focus:bg-red-200 transition-all duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">🔴 Critical</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {priority && (
                  <Badge className={`${priorityColors[priority as keyof typeof priorityColors]} border w-fit`}>
                    ✓ Priority: {priority.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-800">
                  Attach File (Optional)
                </Label>
                <p className="text-sm text-gray-500">Upload a file related to this issue (max 10MB)</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.jpg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  onChange={handleImageSelect}
                  className="hidden"
                  data-testid="input-file"
                />
                
                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    data-testid="button-upload-file"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Click to upload a file</p>
                    <p className="text-sm text-gray-400 mt-1">Images, PDF, Word, Excel, TXT, CSV (max 10MB)</p>
                  </div>
                ) : (
                  <div className="relative border-2 border-green-300 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center gap-4">
                      {imagePreview ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            data-testid="img-preview"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">📄</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">{selectedImage?.name}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        data-testid="button-remove-file"
                      >
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-8 border-t-2 border-gray-200">
                <Button
                  data-testid="button-submit"
                  type="submit"
                  className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "🔄 Creating..." : "✓ Create Ticket"}
                </Button>
                <Button
                  data-testid="button-cancel"
                  type="button"
                  onClick={() => setLocation("/tickets")}
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold border-2 border-gray-400 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  ✕ Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
