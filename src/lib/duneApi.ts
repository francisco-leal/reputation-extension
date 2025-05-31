type DuneData = {
  request_time: string;
  response_time: string;
  wallet_address: string;
  balances: [
    {
      chain: string;
      chain_id: number;
      address: string;
      amount: string;
      symbol: string;
      name: string;
      decimals: number;
      price_usd: number;
      value_usd: number;
      pool_size: number;
      low_liquidity: boolean;
    }
  ];
};

function getDuneApiKey(): string | null {
  const apiKeysRaw = window.localStorage.getItem("apiKeys");
  if (!apiKeysRaw) return null;
  try {
    const apiKeys = JSON.parse(apiKeysRaw);
    return apiKeys.dune || null;
  } catch {
    return null;
  }
}

export async function fetchDuneBalances(wallet: string): Promise<DuneData> {
  const apiKey = getDuneApiKey();
  if (!apiKey) throw new Error("Dune API key not set in localStorage");

  const url = `https://api.sim.dune.com/v1/evm/balances/${encodeURIComponent(
    wallet
  )}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Sim-Api-Key": apiKey,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch Dune balances");
  return res.json();
}
