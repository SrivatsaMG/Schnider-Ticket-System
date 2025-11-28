import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("employee"),
  plant: text("plant"),
  department: text("department"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("General"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  plant: text("plant"),
  createdById: varchar("created_by_id").notNull(),
  assignedToId: varchar("assigned_to_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const ticketReplies = pgTable("ticket_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  plant: true,
  department: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  title: true,
  description: true,
  category: true,
  priority: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().default("General"),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  status: z.enum(["open", "inProgress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignedToId: z.string().optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;

export const ROLE_PERMISSIONS = {
  admin: {
    viewAllTickets: true,
    createTicket: true,
    editAllTickets: true,
    deleteTickets: true,
    assignTickets: true,
    manageUsers: true,
    viewReports: true,
    replyToTickets: true,
    closeTickets: true,
  },
  manager: {
    viewAllTickets: true,
    createTicket: true,
    editAllTickets: true,
    deleteTickets: false,
    assignTickets: true,
    manageUsers: false,
    viewReports: true,
    replyToTickets: true,
    closeTickets: true,
  },
  employee: {
    viewAllTickets: false,
    createTicket: true,
    editAllTickets: false,
    deleteTickets: false,
    assignTickets: false,
    manageUsers: false,
    viewReports: false,
    replyToTickets: true,
    closeTickets: false,
  },
};

export const TICKET_CATEGORIES = [
  "General",
  "Bug",
  "Feature Request",
  "Issue Report",
  "Maintenance",
  "Other",
];

export const TICKET_STATUSES = [
  "open",
  "inProgress",
  "resolved",
  "closed",
];

export const TICKET_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
];
