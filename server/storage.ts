import { type User, type InsertUser, type Ticket, type CreateTicketInput } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser, isAdmin?: boolean): Promise<User>;
  seedAdminUser(): Promise<void>;
  createTicket(ticket: CreateTicketInput, userId: string): Promise<Ticket>;
  getTickets(userId: string, isAdmin: boolean): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket>;
}

const inMemoryUsers: Map<string, User> = new Map();
const inMemoryTickets: Map<string, Ticket> = new Map();

export class SupabaseStorage implements IStorage {
  private useInMemory = false;

  async getUser(id: string): Promise<User | undefined> {
    if (this.useInMemory) {
      return inMemoryUsers.get(id);
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      this.useInMemory = true;
      return inMemoryUsers.get(id);
    }
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.useInMemory) {
      return Array.from(inMemoryUsers.values()).find((u) => u.email === email);
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      if (error.code === "PGRST205") {
        this.useInMemory = true;
        return Array.from(inMemoryUsers.values()).find((u) => u.email === email);
      }
    }
    return (data as User) || undefined;
  }

  async createUser(insertUser: InsertUser, isAdmin = false): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = Math.random().toString(36).substring(7);
    const createdAt = new Date().toISOString();

    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: hashedPassword,
      isAdmin,
      createdAt,
    };

    if (this.useInMemory) {
      inMemoryUsers.set(id, user);
      return user;
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        username: insertUser.username,
        email: insertUser.email,
        password: hashedPassword,
        is_admin: isAdmin,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        this.useInMemory = true;
        inMemoryUsers.set(id, user);
        return user;
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data as User;
  }

  async seedAdminUser(): Promise<void> {
    try {
      const existingAdmin = await this.getUserByEmail("admin@example.com");
      if (!existingAdmin) {
        await this.createUser(
          {
            username: "admin",
            email: "admin@example.com",
            password: "admin123",
          },
          true
        );
        console.log("✓ Admin user created: admin@example.com / admin123");
      }
    } catch (error: any) {
      console.log("Admin seeding note:", error.message);
    }
  }

  async createTicket(ticket: CreateTicketInput, userId: string): Promise<Ticket> {
    const id = Math.random().toString(36).substring(7);
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id,
      title: ticket.title,
      description: ticket.description,
      status: "open",
      priority: ticket.priority,
      createdById: userId,
      assignedToId: null,
      createdAt: now,
      updatedAt: now,
    };

    if (this.useInMemory) {
      inMemoryTickets.set(id, newTicket);
      return newTicket;
    }

    const { data, error } = await supabase
      .from("tickets")
      .insert({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        created_by_id: userId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        this.useInMemory = true;
        inMemoryTickets.set(id, newTicket);
        return newTicket;
      }
      throw new Error(`Failed to create ticket: ${error.message}`);
    }

    return data as Ticket;
  }

  async getTickets(userId: string, isAdmin: boolean): Promise<Ticket[]> {
    if (this.useInMemory) {
      if (isAdmin) {
        return Array.from(inMemoryTickets.values());
      }
      return Array.from(inMemoryTickets.values()).filter(
        (t) => t.createdById === userId || t.assignedToId === userId
      );
    }

    let query = supabase.from("tickets").select("*");

    if (!isAdmin) {
      query = query.or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205") {
        this.useInMemory = true;
        if (isAdmin) {
          return Array.from(inMemoryTickets.values());
        }
        return Array.from(inMemoryTickets.values()).filter(
          (t) => t.createdById === userId || t.assignedToId === userId
        );
      }
      return [];
    }

    return (data as Ticket[]) || [];
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    if (this.useInMemory) {
      return inMemoryTickets.get(id);
    }

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return inMemoryTickets.get(id);
    }

    return data as Ticket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    if (this.useInMemory) {
      const ticket = inMemoryTickets.get(id);
      if (!ticket) throw new Error("Ticket not found");
      const updated = { ...ticket, ...updates, updatedAt: new Date().toISOString() };
      inMemoryTickets.set(id, updated);
      return updated;
    }

    const { data, error } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ticket: ${error.message}`);
    }

    return data as Ticket;
  }
}

export const storage = new SupabaseStorage();
