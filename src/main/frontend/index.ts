import { FetchFunction, FetchRequestSpec } from '../types/index.js';
import { FetchError } from '../util/index.js';

export const unifiedFetch: FetchFunction = async (req: FetchRequestSpec, body?: any) => {
    const fetchServiceUrl = req.connectOptions.fetchServiceUrl ?? 'https://fetch.nodescript.dev';
    const res = await fetch(fetchServiceUrl + '/request', {
        method: 'POST',
        headers: makeControlHeaders(req),
        body,
    });
    if (!res.ok) {
        const responseBodyText = await res.text();
        const message = (tryParseJson(responseBodyText, {})).message ?? responseBodyText;
        throw new FetchError(`Fetch failed: ${res.status} ${message}`);
    }
    const status = Number(res.headers.get('x-fetch-status')) || 0;
    const headers = tryParseJson(res.headers.get('x-fetch-headers') ?? '{}', {});
    return {
        status,
        headers,
        body: res,
    };
};

function makeControlHeaders(req: FetchRequestSpec): Record<string, string> {
    const headers: Record<string, string> = {
        'x-fetch-method': req.method,
        'x-fetch-url': req.url,
        'x-fetch-headers': JSON.stringify(req.headers),
        'x-fetch-connect-options': JSON.stringify(req.connectOptions),
    };
    if (req.proxy) {
        headers['x-fetch-proxy'] = req.proxy.trim();
    }
    return headers;
}

function tryParseJson(text: string, fallback: any) {
    try {
        return JSON.parse(text);
    } catch (error) {
        return fallback;
    }
}
