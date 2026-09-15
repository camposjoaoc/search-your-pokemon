export const API_URL = 'https://pokeapi.co/api/v2';

// Fetch a JSON resource, throwing on non-successful responses
export async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch resource: ${url}`);
    }
    return response.json();
}

// Read a value saved with writeCache, or null if it's missing, older than maxAgeMs or storage is unavailable
export function readCache(key, maxAgeMs = Infinity) {
    try {
        const saved = JSON.parse(localStorage.getItem(key));
        if (!saved || Date.now() - saved.savedAt > maxAgeMs) return null;
        return saved.value;
    } catch {
        return null;
    }
}

// Save a value in localStorage (PokéAPI asks apps to cache what they fetch)
export function writeCache(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }));
    } catch {
        // Storage is full or blocked (e.g. private mode): just skip caching
    }
}
