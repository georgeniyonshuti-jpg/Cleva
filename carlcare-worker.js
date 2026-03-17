/**
 * Cleva — Carlcare Warranty Proxy
 * Cloudflare Worker that proxies IMEI lookups to the Carlcare service API,
 * adding open CORS headers so the browser-based app can call it directly.
 *
 * DEPLOY:
 *   1. Go to https://workers.cloudflare.com and create a free account.
 *   2. Create a new Worker, paste this file as the worker script.
 *   3. Deploy → copy the *.workers.dev URL.
 *   4. In the Cleva app → Admin → Company info → paste the URL into
 *      "Carlcare proxy URL" and save. Auto IMEI checking will activate.
 *
 * ENDPOINTS (all proxied from service.carlcare.com):
 *   GET /?imei=123456789012345          → imei-policy  (main device + warranty)
 *   GET /?imei=...&check=preconditions  → check-preconditions
 *   GET /?imei=...&check=extended       → check-extended-warranty-web
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

const CARLCARE_BASE = 'https://service.carlcare.com/CarlcareClient/electronic-card';

// Headers to include in the upstream request so Carlcare accepts it
const UPSTREAM_HEADERS = {
  'Origin': 'https://www.carlcare.com',
  'Referer': 'https://www.carlcare.com/',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const url = new URL(request.url);
  const imei = url.searchParams.get('imei');
  const check = url.searchParams.get('check') || 'policy';

  if (!imei || !/^\d{15}$/.test(imei)) {
    return jsonResponse({ error: 'Invalid IMEI — must be exactly 15 digits' }, 400);
  }

  // Choose upstream endpoint based on optional `check` param
  let upstreamPath;
  switch (check) {
    case 'preconditions':
      upstreamPath = `check-preconditions?imei=${imei}`;
      break;
    case 'extended':
      upstreamPath = `check-extended-warranty-web?imei=${imei}`;
      break;
    case 'policy':
    default:
      upstreamPath = `imei-policy?imei=${imei}`;
      break;
  }

  const upstreamUrl = `${CARLCARE_BASE}/${upstreamPath}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: UPSTREAM_HEADERS,
    });

    const data = await upstream.json();

    return jsonResponse(data, upstream.status);
  } catch (err) {
    return jsonResponse(
      { error: 'Failed to reach Carlcare service', details: String(err.message) },
      502
    );
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}
