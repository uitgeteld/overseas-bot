import { config } from "../config";

export default async function githubFetch(url: string, init?: RequestInit): Promise<Response> {
    const headers: Record<string, string> = {};
    if (config.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${config.GITHUB_TOKEN}`;
    }

    const mergedInit: RequestInit = {
        ...(init || {}),
        headers: {
            ...( (init && (init.headers as Record<string,string>)) || {} ),
            ...headers,
        },
    };

    return fetch(url, mergedInit);
}
