import { type User, type InsertUser, type Ticket, type TicketReply, type CreateTicketInput, type UpdateTicketInput, ROLES } from "@shared/schema";
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
  getUserByPlant(plant: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser, role?: string): Promise<User>;
  seedAdminUser(): Promise<void>;
  createTicket(ticket: CreateTicketInput, userId: string): Promise<Ticket>;
  getTickets(userId: string, role: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  updateTicket(id: string, updates: UpdateTicketInput): Promise<Ticket>;
  deleteTicket(id: string): Promise<boolean>;
  assignTicket(ticketId: string, userId: string): Promise<Ticket>;
  getTicketReplies(ticketId: string): Promise<TicketReply[]>;
  createReply(ticketId: string, userId: string, message: string): Promise<TicketReply>;
  getPlants(): Promise<any[]>;
  createPlant(name: string, location?: string): Promise<any>;
}

const inMemoryUsers: Map<string, User> = new Map();
const inMemoryTickets: Map<string, Ticket> = new Map();
const inMemoryReplies: Map<string, TicketReply[]> = new Map();
const inMemoryPlants: Map<string, any> = new Map();

function initDemoData() {
  const adminHashedPassword = bcrypt.hashSync("admin123", 10);
  const managerHashedPassword = bcrypt.hashSync("manager123", 10);
  const now = new Date().toISOString();

  const demoAdmin: User = {
    id: "admin-001",
    username: "admin",
    email: "admin@example.com",
    password: adminHashedPassword,
    role: ROLES.ADMIN,
    department: "Management",
    createdAt: now,
  };

  const demoManager: User = {
    id: "manager-001",
    username: "manager",
    email: "manager@example.com",
    password: managerHashedPassword,
    role: ROLES.MANAGER,
    department: "Operations",
    createdAt: now,
  };

  inMemoryUsers.set(demoAdmin.id, demoAdmin);
  inMemoryUsers.set(demoManager.id, demoManager);
  console.log("✓ Demo users initialized (Admin + Manager)");
}

initDemoData();

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
    return data as unknown as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.useInMemory) {
      const user = Array.from(inMemoryUsers.values()).find((u) => u.email === email);
      return user;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      this.useInMemory = true;
      const user = Array.from(inMemoryUsers.values()).find((u) => u.email === email);
      return user;
    }
    return (data as unknown as User) || undefined;
  }

  async getUserByPlant(plant: string): Promise<User | undefined> {
    if (this.useInMemory) {
      const user = Array.from(inMemoryUsers.values()).find((u) => u.plant === plant && u.role === ROLES.MANAGER);
      return user;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("plant", plant)
      .eq("role", ROLES.MANAGER)
      .single();

    if (error) {
      this.useInMemory = true;
      const user = Array.from(inMemoryUsers.values()).find((u) => u.plant === plant && u.role === ROLES.MANAGER);
      return user;
    }
    return (data as unknown as User) || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    if (this.useInMemory) {
      return Array.from(inMemoryUsers.values());
    }

    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      this.useInMemory = true;
      return Array.from(inMemoryUsers.values());
    }

    return ((data as unknown as User[]) || []);
  }

  async createUser(insertUser: InsertUser, role = ROLES.EMPLOYEE): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = `user-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: hashedPassword,
      role,
      department: insertUser.department || "General",
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
        role,
        department: insertUser.department || "General",
      })
      .select()
      .single();

    if (error) {
      this.useInMemory = true;
      inMemoryUsers.set(id, user);
      return user;
    }

    return (data as unknown as User);
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
            department: "Management",
          },
          ROLES.ADMIN
        );
        console.log("✓ Admin user seeded");
      }
    } catch (error: any) {
      console.log("Using in-memory admin user");
    }
  }

  async createTicket(ticket: CreateTicketInput, userId: string): Promise<Ticket> {
    const id = `ticket-${Date.now()}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category || "General",
      status: "open",
      priority: ticket.priority,
      plant: (ticket as any).plant,
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
        category: ticket.category || "General",
        plant: (ticket as any).plant,
        priority: ticket.priority,
        created_by_id: userId,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      this.useInMemory = true;
      inMemoryTickets.set(id, newTicket);
      return newTicket;
    }

    return (data as unknown as Ticket);
  }

  async getTickets(userId: string, role: string): Promise<Ticket[]> {
    if (this.useInMemory) {
      if (role === ROLES.ADMIN || role === ROLES.MANAGER) {
        return Array.from(inMemoryTickets.values()).sort(
          (a, b) => {
            const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
            const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
            return dateB.getTime() - dateA.getTime();
          }
        );
      }
      return Array.from(inMemoryTickets.values())
        .filter((t) => t.createdById === userId || t.assignedToId === userId)
        .sort((a, b) => {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
          return dateB.getTime() - dateA.getTime();
        });
    }

    let query = supabase.from("tickets").select("*");

    if (role === ROLES.EMPLOYEE) {
      query = query.or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      this.useInMemory = true;
      if (role === ROLES.ADMIN || role === ROLES.MANAGER) {
        return Array.from(inMemoryTickets.values());
      }
      return Array.from(inMemoryTickets.values()).filter(
        (t) => t.createdById === userId || t.assignedToId === userId
      );
    }

    return ((data as unknown as Ticket[]) || []);
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

    return (data as unknown as Ticket);
  }

  async updateTicket(id: string, updates: UpdateTicketInput): Promise<Ticket> {
    const now = new Date().toISOString();

    if (this.useInMemory) {
      const ticket = inMemoryTickets.get(id);
      if (!ticket) throw new Error("Ticket not found");

      const updated: Ticket = {
        ...ticket,
        ...updates,
        updatedAt: now as any,
      };
      inMemoryTickets.set(id, updated);
      return updated;
    }

    const { data, error } = await supabase
      .from("tickets")
      .update({ ...updates, updated_at: now })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ticket: ${error.message}`);
    }

    return (data as unknown as Ticket);
  }

  async deleteTicket(id: string): Promise<boolean> {
    if (this.useInMemory) {
      return inMemoryTickets.delete(id);
    }

    const { error } = await supabase.from("tickets").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete ticket: ${error.message}`);
    }

    return true;
  }

  async assignTicket(ticketId: string, userId: string): Promise<Ticket> {
    return this.updateTicket(ticketId, { assignedToId: userId });
  }

  async getTicketReplies(ticketId: string): Promise<TicketReply[]> {
    if (this.useInMemory) {
      const replies = inMemoryReplies.get(ticketId) || [];
      return Promise.resolve(replies);
    }

    const { data, error } = await supabase
      .from("ticket_replies")
      .select("*, users:user_id(username)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      return inMemoryReplies.get(ticketId) || [];
    }

    return ((data as unknown as TicketReply[]) || []);
  }

  async createReply(ticketId: string, userId: string, message: string): Promise<TicketReply> {
    const id = `reply-${Date.now()}`;
    const now = new Date().toISOString();

    const newReply: TicketReply = {
      id,
      ticketId,
      userId,
      message,
      createdAt: now as any,
    };

    if (this.useInMemory) {
      const ticketReplies = inMemoryReplies.get(ticketId) || [];
      ticketReplies.push(newReply);
      inMemoryReplies.set(ticketId, ticketReplies);
      return newReply;
    }

    const { data, error } = await supabase
      .from("ticket_replies")
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        message: message,
      })
      .select()
      .single();

    if (error) {
      this.useInMemory = true;
      const ticketReplies = inMemoryReplies.get(ticketId) || [];
      ticketReplies.push(newReply);
      inMemoryReplies.set(ticketId, ticketReplies);
      return newReply;
    }

    return (data as unknown as TicketReply);
  }

  async getPlants(): Promise<any[]> {
    if (this.useInMemory) {
      return Array.from(inMemoryPlants.values());
    }

    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      this.useInMemory = true;
      return Array.from(inMemoryPlants.values());
    }

    return ((data as any) || []);
  }

  async createPlant(name: string, location?: string): Promise<any> {
    const id = `plant-${Date.now()}`;
    const now = new Date().toISOString();

    const newPlant = {
      id,
      name,
      location: location || null,
      created_at: now,
    };

    if (this.useInMemory) {
      inMemoryPlants.set(id, newPlant);
      return newPlant;
    }

    const { data, error } = await supabase
      .from("plants")
      .insert({
        name,
        location: location || null,
      })
      .select()
      .single();

    if (error) {
      this.useInMemory = true;
      inMemoryPlants.set(id, newPlant);
      return newPlant;
    }

    return (data as any);
  }
}

export const storage = new SupabaseStorage();
