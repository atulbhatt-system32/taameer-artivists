
import { supabase } from "./lib/supabase";

async function testInsert() {
  const { error } = await supabase
    .from("registrations")
    .insert([{
      full_name: "Test",
      email: "test@example.com",
      additional_attendees: []
    }]);
  
  if (error) {
    console.error("Insert failed:", error.message);
    if (error.message.includes("column \"additional_attendees\" of relation \"registrations\" does not exist")) {
      console.log("COLUMN_MISSING");
    }
  } else {
    console.log("COLUMN_EXISTS");
    // Cleanup
    await supabase.from("registrations").delete().eq("email", "test@example.com");
  }
}

testInsert();
