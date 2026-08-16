// Pexels stock photo search — server-only, needs PEXELS_API_KEY.
// Free tier, no approval process. https://www.pexels.com/api/

const PEXELS_HOST = "images.pexels.com";

/** Shape of a photo entry in the Pexels search response (only fields we use). */
interface PexelsApiPhoto {
  id: number;
  url: string;
  photographer: string;
  src: { large2x: string; large: string; small: string; tiny: string };
}

export interface StockPhoto {
  id: number;
  url: string;          // full-size image URL, always on images.pexels.com
  thumb: string;        // small preview for the picker
  photographer: string;
  pageUrl: string;      // credit link back to Pexels
}

export async function searchStockPhotos(query: string, perPage = 8): Promise<StockPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error("PEXELS_API_KEY not configured");

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);

  const data: { photos?: PexelsApiPhoto[] } = await res.json();
  return (data.photos || []).map(p => ({
    id: p.id,
    url: p.src.large2x || p.src.large,
    thumb: p.src.tiny || p.src.small,
    photographer: p.photographer || "",
    pageUrl: p.url || "",
  }));
}

/**
 * Guards against turning the attach endpoint into an open proxy: only images
 * actually served by Pexels may be fetched and stored.
 */
export function isPexelsImageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && u.hostname === PEXELS_HOST;
  } catch {
    return false;
  }
}
