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

  if (!res.ok) throw new Error("Failed to fetch score");
  const data = await res.json();
  return data?.score?.points ?? null;
}
