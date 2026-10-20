/*
 * Cloudflare Worker - AI API Proxy
 * Deploy this as a Worker to proxy NVIDIA API calls (bypasses CORS)
 * 
 * Deploy: wrangler deploy --name satp-ai-proxy
 * Or via Cloudflare Dashboard: Workers & Pages → Create Worker
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      
      // Validate required fields
      if (!body.apiUrl || !body.apiKey || !body.payload) {
        return jsonResponse({ error: 'Missing required fields: apiUrl, apiKey, payload' }, 400);
      }

      // Forward to the actual AI API
      const apiResponse = await fetch(body.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${body.apiKey}`
        },
        body: JSON.stringify(body.payload)
      });

      const data = await apiResponse.json();
      
      return jsonResponse(data, apiResponse.status);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
};

function handleOptions(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  return new Response(null, { headers });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}