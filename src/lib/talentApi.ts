function getTalentApiKey(): string | null {
  const apiKeysRaw = window.localStorage.getItem("apiKeys");
  if (!apiKeysRaw) return null;
  try {
    const apiKeys = JSON.parse(apiKeysRaw);
    return apiKeys.talentProtocol || null;
  } catch {
    return null;
  }
}

export async function fetchTalentScore(wallet: string): Promise<number | null> {
  const apiKey = getTalentApiKey();
  if (!apiKey)
    throw new Error("Talent Protocol API key not set in localStorage");

  const url = `https://api.talentprotocol.com/score?id=${encodeURIComponent(
    wallet
  )}`;
  const res = await fetch(url, {
    headers: {
      "X-API-KEY": apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) return 0;
  const data = await res.json();
  return data?.score?.points ?? null;
}

export type TalentSocial = {
  follower_count: number | null;
  following_count: number | null;
  location: string | null;
  owner: string | null;
  bio: string | null;
  display_name: string | null;
  image_url: string | null;
  name: string | null;
  owned_since: string | null;
  profile_url: string | null;
  source: string;
};

export async function fetchTalentSocials(
  wallet: string
): Promise<TalentSocial[] | null> {
  const apiKey = getTalentApiKey();
  if (!apiKey)
    throw new Error("Talent Protocol API key not set in localStorage");

  const url = `https://api.talentprotocol.com/socials?id=${encodeURIComponent(
    wallet
  )}`;
  const res = await fetch(url, {
    headers: {
      "X-API-KEY": apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.socials ?? null;
}
