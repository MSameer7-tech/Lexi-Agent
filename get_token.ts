import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  'https://ihykxrbyztemyjtrpisd.supabase.co',
  'sb_publishable_9-87O-BWesRvU2mh4xJzsw_KXyAFveT'
);

async function run() {
  const email = `testuser_${Date.now()}@gmail.com`;
  const password = "Password123!";
  
  const { data, error } = await supabase.auth.signUp({
    email, password
  });

  if (error) {
    console.error("Signup error:", error);
    return;
  }
  
  if (data.session) {
    console.log(data.session.access_token);
  } else {
    console.log("No session returned. Auto confirm might be disabled.");
  }
}

run();
