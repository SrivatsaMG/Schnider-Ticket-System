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

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user by email:", error);
    }
    return (data as User) || undefined;
  }

  async createUser(insertUser: InsertUser, isAdmin = false): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

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
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data as User;
  }

  async seedAdminUser(): Promise<void> {
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
      console.log("Admin user created: admin@example.com / admin123");
    }
  }
}

export const storage = new SupabaseStorage();
