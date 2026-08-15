// Instagram Graph API (content publishing) — server-only, requires IG_ACCESS_TOKEN
// (long-lived Page/IG access token) and IG_BUSINESS_ACCOUNT_ID env vars.
// Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing

const GRAPH_VERSION = "v21.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requireEnv() {
  const token = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_BUSINESS_ACCOUNT_ID;
  if (!token || !igUserId) {
    throw new Error("IG_ACCESS_TOKEN / IG_BUSINESS_ACCOUNT_ID not configured");
  }
  return { token, igUserId };
}

async function graphPost(path: string, params: Record<string, string>) {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Instagram API error");
  return data;
}

// Step 1: create a media container from a public image URL + caption.
export async function createMediaContainer(imageUrl: string, caption: string): Promise<string> {
  const { token, igUserId } = requireEnv();
  const data = await graphPost(`${igUserId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: token,
  });
  return data.id as string;
}

// Step 2: publish a previously created container.
export async function publishContainer(containerId: string): Promise<string> {
  const { token, igUserId } = requireEnv();
  const data = await graphPost(`${igUserId}/media_publish`, {
    creation_id: containerId,
    access_token: token,
  });
  return data.id as string; // published media id
}

// Fetch the permalink for a published media id (for linking back in the admin UI).
export async function getMediaPermalink(mediaId: string): Promise<string | null> {
  const { token } = requireEnv();
  const res = await fetch(`${GRAPH}/${mediaId}?fields=permalink&access_token=${token}`);
  const data = await res.json();
  return data.permalink || null;
}
