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
      const tickets = await storage.getTickets(user.id, user.role);
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

  return httpServer;
}
