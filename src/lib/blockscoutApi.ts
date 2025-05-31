export async function fetchBlockscoutAddressInfo(wallet: string): Promise<{
  is_contract: boolean;
  is_verified: boolean;
  coin_balance: string;
  name: string | null;
} | null> {
  const url = `https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(
    wallet
  )}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return {
    is_contract: data.is_contract,
    is_verified: data.is_verified,
    coin_balance: data.coin_balance,
    name: data.name,
  };
}
