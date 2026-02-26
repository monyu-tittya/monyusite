export default async function handler(request, response) {
    // Support both classic Vercel KV and Upstash Marketplace variables
    const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
        return response.status(500).json({ error: 'KV database is not configured. Please link a Vercel KV store.' });
    }

    try {
        // We use the REST API 'INCR' command to atomically increment the counter
        const fetchUrl = `${KV_REST_API_URL}/incr/monyu_site_counter`;

        const kvResponse = await fetch(fetchUrl, {
            headers: {
                Authorization: `Bearer ${KV_REST_API_TOKEN}`,
            },
        });

        if (!kvResponse.ok) {
            throw new Error(`KV API responded with status ${kvResponse.status}`);
        }

        const data = await kvResponse.json();

        // Return the incremented value
        // The KV response format for INCR is { result: <number> }
        return response.status(200).json({ visits: data.result });
    } catch (error) {
        console.error('Failed to increment KV counter:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
