import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    // Pegue a service_role key do ambiente (definir no Supabase Dashboard)
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) return new Response("Service role key não configurada", { status: 500 });

    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/enviar-email-nota`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
