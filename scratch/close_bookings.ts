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
  console.log("Upserting bookings_closed -> true in Supabase...");
  
  // First check if key exists
  const { data: existing } = await supabase
    .from("event_config")
    .select("id")
    .eq("key", "bookings_closed")
    .single();

  if (existing) {
    const { error } = await supabase
      .from("event_config")
      .update({ value: "true" })
      .eq("key", "bookings_closed");
    
    if (error) console.error("Error updating:", error);
    else console.log("Updated existing key successfully!");
  } else {
    const { error } = await supabase
      .from("event_config")
      .insert({ key: "bookings_closed", value: "true" });

    if (error) console.error("Error inserting:", error);
    else console.log("Inserted key successfully!");
  }
}

run();
