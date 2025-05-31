export type FarcasterUser = {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
};

function getFarcasterApiKey(): string | null {
  const apiKeysRaw = window.localStorage.getItem("apiKeys");
  if (!apiKeysRaw) return null;
  try {
    const apiKeys = JSON.parse(apiKeysRaw);
    return apiKeys.farcaster || null;
  } catch {
    return null;
  }
}

export async function fetchFarcasterUser(
  username: string
): Promise<FarcasterUser> {
  const apiKey = getFarcasterApiKey();
  if (!apiKey) throw new Error("Farcaster API key not set in localStorage");

  const url = `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(
    username
  )}`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
  });
  if (!res.ok) {
    throw new Error(`Farcaster API error: ${res.status}`);
  }
  const data = await res.json();
  console.log(data);
  if (!data.user) {
    throw new Error("No user found");
  }
  return {
    fid: data.user.fid,
    username: data.user.username,
    display_name: data.user.display_name,
    pfp_url: data.user.pfp_url,
    follower_count: data.user.follower_count,
  };
}
