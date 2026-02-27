const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BLOCKED_COUNTRIES = ['US'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers (Supabase/Cloudflare passes these)
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      '';

    if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1') {
      return new Response(
        JSON.stringify({ blocked: false, country: 'unknown' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use ip-api.com (free, no key needed, 45 req/min)
    const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode,status`);
    const geo = await geoRes.json();

    const country = geo.status === 'success' ? geo.countryCode : 'unknown';
    const blocked = BLOCKED_COUNTRIES.includes(country);

    return new Response(
      JSON.stringify({ blocked, country }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Fail open - don't block if geo lookup fails
    return new Response(
      JSON.stringify({ blocked: false, country: 'error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
