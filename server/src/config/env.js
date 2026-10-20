import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..", "..");
const workspaceRoot = path.resolve(serverRoot, "..");

// Prefer server/.env, while still supporting the workspace-level .env used by
// the root npm scripts. Existing process variables always win in deployments.
dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config({ path: path.join(workspaceRoot, ".env"), override: false });

export function envFlag(name, fallback = false) {
  const value = process.env[name];
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}
