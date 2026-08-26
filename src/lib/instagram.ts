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

// Instagram fetches/processes the image from image_url asynchronously after
// createMediaContainer returns — publishing before that finishes fails with
// "Media ID is not available". Poll status_code until it's FINISHED (or fail
// fast on ERROR/EXPIRED) before calling media_publish.
async function waitForContainerReady(containerId: string, token: string): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const res = await fetch(`${GRAPH}/${containerId}?fields=status_code&access_token=${token}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Instagram API error");
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(`Instagram media container failed to process (status: ${data.status_code})`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error("Timed out waiting for Instagram to process the image");
}

// Step 2: publish a previously created container.
export async function publishContainer(containerId: string): Promise<string> {
  const { token, igUserId } = requireEnv();
  await waitForContainerReady(containerId, token);
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

// Cross-post the same image + caption to the linked Facebook Page's feed.
// Needs its own Page Access Token with pages_manage_posts — IG_ACCESS_TOKEN
// turned out NOT to carry that permission (confirmed live: Graph API #200
// "This app is not allowed to publish to other users' timelines", the
// classic symptom of using a user token instead of a page token here).
// Get one via Graph API Explorer: grant pages_manage_posts + pages_show_list
// on a user token, call GET /me/accounts, and copy that Page's own
// access_token from the response — not the top-level user token.
export async function postToFacebookPage(imageUrl: string, message: string): Promise<{ postId: string; permalink: string | null }> {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  if (!token) throw new Error("FB_PAGE_ACCESS_TOKEN not configured");
  if (!pageId) throw new Error("FB_PAGE_ID not configured");

  const data = await graphPost(`${pageId}/photos`, {
    url: imageUrl,
    caption: message,
    access_token: token,
  });
  const postId = (data.post_id || data.id) as string;

  let permalink: string | null = null;
  try {
    const res = await fetch(`${GRAPH}/${postId}?fields=permalink_url&access_token=${token}`);
    const pd = await res.json();
    permalink = pd.permalink_url || null;
  } catch { /* permalink is a nice-to-have, not required */ }

  return { postId, permalink };
}
