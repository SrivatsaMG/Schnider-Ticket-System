import { type User, type InsertUser } from "@shared/schema";
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
}

// In-memory fallback storage when database is not available
const inMemoryUsers: Map<string, User> = new Map();

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
      console.error("Switching to in-memory storage:", error.message);
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
        console.log("Database table not found. Using in-memory storage.");
        this.useInMemory = true;
        return Array.from(inMemoryUsers.values()).find((u) => u.email === email);
      }
      console.error("Error fetching user by email:", error);
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
        console.log("Database table not found. Using in-memory storage.");
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
}

export const storage = new SupabaseStorage();
