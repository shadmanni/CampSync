import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env first, fallback to .env.example
dotenv.config({ path: path.join(__dirname, ".env") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(__dirname, ".env.example") });
}

async function setupSupabase() {
  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("mock")) {
    console.error("❌ Error: DATABASE_URL environment variable is missing or set to mock.");
    console.error("👉 Please set DATABASE_URL in server/.env");
    process.exit(1);
  }

  // Clean password brackets if present (e.g. :[password]@ -> :password@)
  databaseUrl = databaseUrl.replace(/:\[([^\]]+)\]@/, ":$1@");

  console.log("🚀 Initializing Supabase PostgreSQL database connection...");
  const isRemote = databaseUrl.includes("supabase") || databaseUrl.includes("pooler") || databaseUrl.includes("render") || databaseUrl.includes("sslmode=require") || process.env.NODE_ENV === "production";
  
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: isRemote ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to Supabase PostgreSQL!");

    const schemaPath = path.join(__dirname, "src", "store", "schema.sql");
    console.log(`📄 Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log("⚙️ Creating database tables and indices...");
    await client.query(schemaSql);
    console.log("🎉 All 11 tables and indices created successfully!");

    client.release();
    await pool.end();
    console.log("✨ Supabase database setup complete!");
  } catch (err) {
    console.error("❌ Failed to set up Supabase database:", err.message);
    process.exit(1);
  }
}

setupSupabase();
