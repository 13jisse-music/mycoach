import { createClient } from "@supabase/supabase-js";

// Public keys (anon = read-only, safe to expose)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gotmbirdcmkaisfebvpc.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdG1iaXJkY21rYWlzZmVidnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MDM2MzksImV4cCI6MjA1NDA3OTYzOX0.L3JjGxfMsLJxH_1PwwvxuDKjurC6InxMbkDjpkUiDFE";

export const supabase = createClient(supabaseUrl, supabaseKey);
