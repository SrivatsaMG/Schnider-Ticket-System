import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, createTicketSchema, updateTicketSchema, ROLES, ROLE_PERMISSIONS } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.seedAdminUser();

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const existingUser = await storage.getUserByEmail(parsed.data.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(parsed.data, ROLES.EMPLOYEE);
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const user = await storage.getUserByEmail(parsed.data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(
        parsed.data.password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const userData = await storage.getUser(user.id);
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = userData;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch user" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

      if (!permissions?.manageUsers && user.role !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...u }) => u);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  app.post("/api/auth/admin-create-user", async (req, res) => {
    try {
      const { username, email, password, role, plant, department } = req.body;

      if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(
        { username, email, password, department },
        role,
        plant
      );

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      if (user.role !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { role, plant, department } = req.body;
      const updates: any = {};

      if (role) updates.role = role;
      if (plant) updates.plant = plant;
      if (department) updates.department = department;

      const updatedUser = await storage.updateUser(req.params.id, updates);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ message: "User updated successfully", user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

      if (!permissions?.createTicket) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const parsed = createTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const ticket = await storage.createTicket(parsed.data, user.id);
      res.status(201).json({ message: "Ticket created", ticket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create ticket" });
    }
  });

  app.get("/api/tickets", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const tickets = await storage.getTickets(user.id, user.role, user.plant);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const ticket = await storage.getTicket(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
      if (!permissions?.editAllTickets) {
        if (ticket.createdById !== user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      const parsed = updateTicketSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const updatedTicket = await storage.updateTicket(req.params.id, parsed.data);
      res.json({ message: "Ticket updated", ticket: updatedTicket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update ticket" });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

      if (!permissions?.deleteTickets) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteTicket(req.params.id);
      res.json({ message: "Ticket deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete ticket" });
    }
  });

  app.post("/api/tickets/:id/assign", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

      if (!permissions?.assignTickets) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const ticket = await storage.assignTicket(req.params.id, userId);
      res.json({ message: "Ticket assigned", ticket });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to assign ticket" });
    }
  });

  app.get("/api/permissions", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch permissions" });
    }
  });

  app.get("/api/plants", async (req, res) => {
    try {
      const plants = await storage.getPlants();
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch plants" });
    }
  });

  app.post("/api/plants", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];

      if (!permissions?.managePlants && user.role !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { name, location } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Plant name is required" });
      }

      const plant = await storage.createPlant(name, location);
      res.status(201).json({ message: "Plant created", plant });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create plant" });
    }
  });

  app.get("/api/tickets/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getTicketReplies(req.params.id);
      
      // Enrich replies with usernames from storage
      const enrichedReplies = await Promise.all(
        replies.map(async (reply: any) => {
          if (!reply.userName) {
            const user = await storage.getUser(reply.userId || reply.user_id);
            return {
              ...reply,
              userName: user?.username || "Unknown User",
            };
          }
          return reply;
        })
      );

      res.json(enrichedReplies);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch replies" });
    }
  });

  app.post("/api/tickets/:id/replies", async (req, res) => {
    try {
      const userStr = req.query.user as string;
      if (!userStr) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = JSON.parse(userStr);
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message cannot be empty" });
      }

      // Get ticket to notify relevant users
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Create the reply
      const reply = await storage.createReply(req.params.id, user.id, message);

      // Get all users who should be notified
      const notifyUserIds = new Set<string>();
      
      // Notify ticket creator
      if (ticket.createdById && ticket.createdById !== user.id) {
        notifyUserIds.add(ticket.createdById);
      }

      // Notify assigned user
      if (ticket.assignedToId && ticket.assignedToId !== user.id) {
        notifyUserIds.add(ticket.assignedToId);
      }

      // Notify plant manager (if plant is assigned)
      if (ticket.plant) {
        const manager = await storage.getUserByPlant(ticket.plant);
        if (manager && manager.id !== user.id) {
          notifyUserIds.add(manager.id);
        }
      }

      res.status(201).json({ message: "Reply created", reply: { ...reply, userName: user.username } });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create reply" });
    }
  });

  return httpServer;
}
