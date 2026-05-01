// Vercel serverless function — proxies requests from the browser to Anthropic.
// The API key stays on the server, never sent to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Same-origin check: block requests from other sites trying to use your key.
  const host = req.headers.host;
  const origin = req.headers.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return res.status(403).json({ error: { message: 'Cross-origin requests not allowed' } });
      }
    } catch {
      return res.status(403).json({ error: { message: 'Invalid origin header' } });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not configured on the server' } });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: 'Proxy error: ' + (err?.message || 'unknown') } });
  }
}
