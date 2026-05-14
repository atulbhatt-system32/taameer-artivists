
import { supabase } from "./lib/supabase";

async function checkColumns() {
  const { data, error } = await supabase.from('registrations').select('*').limit(1);
  if (error) {
    console.error("Error fetching registrations:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No data in registrations table to check columns.");
    // Try to get column info from information_schema if possible, but probably not allowed via standard select
  }
}

checkColumns();
