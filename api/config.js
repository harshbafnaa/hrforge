// Public config endpoint.
// Returns Supabase URL + anon key so the browser can talk to Supabase.
// These are PUBLIC values by design — security is enforced by Row Level Security
// policies in the Supabase database, not by hiding the anon key.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  });
}
