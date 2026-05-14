
import { supabase } from "./lib/supabase";

async function testGroupId() {
  const { error } = await supabase
    .from("registrations")
    .insert([{
      full_name: "Test Group",
      email: "testgroup@example.com",
      group_id: "test-uuid"
    }]);
  
  if (error) {
    console.error("Insert failed:", error.message);
    if (error.message.includes("column \"group_id\" of relation \"registrations\" does not exist")) {
      console.log("GROUP_ID_MISSING");
    }
  } else {
    console.log("GROUP_ID_EXISTS");
    await supabase.from("registrations").delete().eq("email", "testgroup@example.com");
  }
}

testGroupId();
