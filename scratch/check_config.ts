import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const env: Record<string, string> = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from("event_config").select("*");
  if (error) {
    console.error("Error fetching event_config:", error);
    return;
  }
  console.log("Current event_config records:", data);
}

run();
