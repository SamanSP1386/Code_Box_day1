const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env. See Supabase Project Settings > API."
  );
}

// Shared client for public reads and for the OTP request/verify calls,
// which don't need to run as any particular user.
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getAnonClient() {
  return anonClient;
}

// A client scoped to one logged-in user's access token, so writes go
// through Postgres Row Level Security as that user (see supabase/schema.sql).
function getUserClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

module.exports = { getAnonClient, getUserClient };
