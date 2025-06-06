import { useState, useEffect } from "react";
import {
  RouterProvider,
  Link,
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import Admin from "./Admin";
import { createHashHistory } from "@tanstack/history";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Progress } from "@/components/ui/progress";
import { fetchBlockscoutAddressInfo } from "@/lib/blockscoutApi";
import { fetchTalentScore, fetchTalentSocials } from "@/lib/talentApi";
import { fetchDuneBalances } from "@/lib/duneApi";
import { fetchFarcasterUser, type FarcasterUser } from "@/lib/farcasterApi";
import type { TalentSocial } from "@/lib/talentApi";

// Add BlockscoutData type
type BlockscoutData = {
  is_contract: boolean;
  is_verified: boolean;
  coin_balance: string;
  name: string | null;
  creator_address_hash: string | null;
};

// Add Dune types
type DuneBalance = {
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
};

type DuneData = {
  request_time: string;
  response_time: string;
  wallet_address: string;
  balances: DuneBalance[];
};

const MINIMUM_BALANCE_USD = 50;

function Home() {
  // State machine states: idle, loadingDune, loadingBlockscout, loadingTalent, done, error
  type State =
    | { status: "idle"; searchTerm: string; pageUrl: string }
    | {
        status: "loadingDune";
        searchTerm: string;
        pageUrl: string;
        progress: number;
      }
    | {
        status: "loadingBlockscout";
        searchTerm: string;
        pageUrl: string;
        duneData: DuneData;
        progress: number;
      }
    | {
        status: "loadingTalent";
        searchTerm: string;
        pageUrl: string;
        blockscoutData: BlockscoutData;
        duneData: DuneData;
        progress: number;
      }
    | {
        status: "done";
        searchTerm: string;
        pageUrl: string;
        blockscoutData: BlockscoutData;
        duneData: DuneData;
        score: number | null;
        socials: TalentSocial[] | null;
        progress: number;
      }
    | { status: "error"; error: string; progress: number };

  const [state, setState] = useState<State>({
    status: "idle",
    searchTerm: "",
    pageUrl: "",
  });
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(0);

  // Add Farcaster user state
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(
    null
  );
  const [farcasterError, setFarcasterError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storedTerm = urlParams.get("search");
    const storedUrl = urlParams.get("url");
    if (storedTerm) {
      setState({
        status: "loadingDune",
        searchTerm: storedTerm,
        pageUrl: storedUrl || "",
        progress: 0,
      });
    }
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (
      state.status === "loadingDune" ||
      state.status === "loadingBlockscout" ||
      state.status === "loadingTalent"
    ) {
      if (progress < 96) {
        const timer = setTimeout(() => {
          setProgress((prev) => (prev < 90 ? prev + 10 : 96));
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      setProgress(0);
    }
  }, [state.status, progress]);

  // Farcaster integration: fetch user if pageUrl contains farcaster.xyz
  useEffect(() => {
    setFarcasterUser(null);
    setFarcasterError(null);
    if (
      "pageUrl" in state &&
      typeof state.pageUrl === "string" &&
      state.pageUrl.includes("farcaster.xyz")
    ) {
      // Extract username: farcaster.xyz/USERNAME/
      const match = state.pageUrl.match(/farcaster\.xyz\/([^/]+)\//);
      const username = match && match[1] ? match[1] : null;
      if (username) {
        fetchFarcasterUser(username)
          .then((user) => {
            setFarcasterUser(user);
          })
          .catch((err) => {
            setFarcasterError(err.message || "Farcaster error");
          });
      }
    }
  }, [state]);

  // Handle state transitions
  useEffect(() => {
    if (state.status === "loadingDune") {
      setProgress(10);
      fetchDuneBalances(state.searchTerm)
        .then((duneData) => {
          const filteredBalances = duneData.balances.filter(
            (b) => b.value_usd > MINIMUM_BALANCE_USD
          );
          setProgress(40);
          setState({
            status: "loadingBlockscout",
            searchTerm: state.searchTerm,
            pageUrl: state.pageUrl,
            duneData: {
              ...duneData,
              balances: filteredBalances,
            },
            progress: 40,
          });
        })
        .catch((err: any) => {
          setState({
            status: "error",
            error: err.message || "Dune error",
            progress: 100,
          });
        });
    } else if (state.status === "loadingBlockscout") {
      setProgress(50);
      fetchBlockscoutAddressInfo(state.searchTerm)
        .then((blockscoutData) => {
          setProgress(70);
          if (!blockscoutData) {
            setState({
              status: "error",
              error: "Blockscout returned null data",
              progress: 100,
            });
            return;
          }
          if (!blockscoutData.is_contract) {
            setState({
              status: "loadingTalent",
              searchTerm: state.searchTerm,
              pageUrl: state.pageUrl,
              blockscoutData: blockscoutData,
              duneData: state.duneData,
              progress: 70,
            });
          } else {
            setState({
              status: "done",
              searchTerm: state.searchTerm,
              pageUrl: state.pageUrl,
              blockscoutData: blockscoutData,
              duneData: state.duneData,
              score: null,
              socials: null,
              progress: 100,
            });
          }
        })
        .catch((err: any) => {
          setState({
            status: "error",
            error: err.message || "Blockscout error",
            progress: 100,
          });
        });
    } else if (state.status === "loadingTalent") {
      setProgress(80);
      fetchTalentScore(state.searchTerm)
        .then((score) => {
          setProgress(90);
          fetchTalentSocials(state.searchTerm)
            .then((socials) => {
              setProgress(100);
              setState({
                status: "done",
                searchTerm: state.searchTerm,
                pageUrl: state.pageUrl,
                blockscoutData: state.blockscoutData,
                duneData: state.duneData,
                score,
                socials: socials?.filter((s) => s.source !== "efp") || null,
                progress: 100,
              });
            })
            .catch(() => {
              setState({
                status: "done",
                searchTerm: state.searchTerm,
                pageUrl: state.pageUrl,
                blockscoutData: state.blockscoutData,
                duneData: state.duneData,
                score,
                socials: null,
                progress: 100,
              });
            });
        })
        .catch((err: any) => {
          setState({
            status: "error",
            error: err.message || "Talent Protocol error",
            progress: 100,
          });
        });
    }
  }, [state.status]);

  // Clean up localStorage and reset state when popup is closed
  useEffect(() => {
    const cleanup = () => {
      setState({ status: "idle", searchTerm: "", pageUrl: "" });
      setInput("");
    };
    window.addEventListener("unload", cleanup);
    return () => window.removeEventListener("unload", cleanup);
  }, []);

  function displaySearchTerm(term: string) {
    if (term.length > 20) {
      return `${term.slice(0, 6)}...${term.slice(-6)}`;
    }
    return term;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setState({
      status: "loadingDune",
      searchTerm: input.trim(),
      pageUrl: "",
      progress: 0,
    });
  };

  // UI rendering per state
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background flex flex-col items-center">
      <h1 className="text-2xl font-extrabold text-center font-mono tracking-tight mb-4">
        Web3 Reputation Explorer
      </h1>
      {state.status === "idle" && (
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-2"
        >
          <input
            className="w-full border rounded px-3 py-2 font-mono"
            placeholder="Enter address or ENS..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1 rounded-full text-sm font-mono font-semibold bg-primary text-white"
          >
            Search
          </button>
        </form>
      )}
      {(state.status === "loadingDune" ||
        state.status === "loadingBlockscout" ||
        state.status === "loadingTalent" ||
        state.status === "done" ||
        state.status === "error") && (
        <>
          <p className="text-lg text-muted-foreground font-mono mb-2 text-center">
            Search term:{" "}
            <b className="text-primary">
              {state.status !== "error"
                ? displaySearchTerm(state.searchTerm)
                : "-"}
            </b>
          </p>
          {state.status !== "error" && state.pageUrl && (
            <p className="text-xs text-muted-foreground font-mono mb-2 text-center break-all">
              Page URL: <span className="text-primary">{state.pageUrl}</span>
            </p>
          )}
          {(state.status === "loadingDune" ||
            state.status === "loadingBlockscout" ||
            state.status === "loadingTalent") && <Progress value={progress} />}
        </>
      )}
      {state.status === "error" && (
        <p className="text-red-500 font-mono mt-2">{state.error}</p>
      )}
      {state.status === "done" && (
        <div className="text-sm font-mono mt-2 p-2 border rounded bg-muted">
          {/* Farcaster UI */}
          {"pageUrl" in state &&
            typeof state.pageUrl === "string" &&
            state.pageUrl.includes("farcaster.xyz") && (
              <>
                {farcasterError && (
                  <div className="text-red-500">{farcasterError}</div>
                )}
                {farcasterUser && (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="flex flex-row gap-2 items-center">
                      <img
                        src={farcasterUser.pfp_url}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border"
                      />
                      <div>
                        <b>
                          {farcasterUser.display_name || farcasterUser.username}
                        </b>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          {state.score !== null && (
            <div className="text-center mt-2">
              Builder Score: <b>{state.score}</b>
            </div>
          )}
          {/* Dune balances UI */}
          {state.duneData && (
            <>
              <div className="font-bold text-center mt-2">Active chains</div>
              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                {/* Show only active chains as badges */}
                {Array.from(
                  new Set(
                    state.duneData.balances
                      .filter((b) => Number(b.amount) > 0)
                      .map((b) => b.chain)
                  )
                ).map((chain, i) => (
                  <div
                    className="bg-gray-200 text-black px-2 py-1 border rounded-full"
                    key={i}
                  >
                    {chain}
                  </div>
                ))}
                {state.duneData.balances.filter((b) => Number(b.amount) > 0)
                  .length === 0 && <span>No active chains found.</span>}
              </div>
            </>
          )}
          {state.blockscoutData.name && (
            <div className="text-center mt-2">
              Name: <b>{state.blockscoutData.name || "-"}</b>
            </div>
          )}
          {state.blockscoutData.is_contract && (
            <div className="text-center mt-2">
              Contract: <b>Yes</b>
            </div>
          )}
          {state.blockscoutData.creator_address_hash && (
            <div className="text-center mt-2">
              Creator:{" "}
              <b>
                {displaySearchTerm(state.blockscoutData.creator_address_hash)}
              </b>
            </div>
          )}
          {state.blockscoutData.is_verified && (
            <div className="text-center mt-2">
              Verified: <b>Yes</b>
            </div>
          )}
          {/* Talent Socials UI */}
          {state.socials && state.socials.length > 0 && (
            <>
              <div className="font-bold text-center mt-2">
                Active social accounts
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {state.socials.map((s, i) =>
                  s.profile_url ? (
                    <a
                      key={i}
                      href={s.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 text-black px-2 py-1 border rounded-full"
                    >
                      {s.source}
                    </a>
                  ) : null
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Root() {
  return (
    <>
      <NavigationMenu className="mb-8">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to="/"
                className="px-4 py-1 rounded-full text-sm font-mono font-semibold"
              >
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to="/admin"
                className="px-4 py-1 rounded-full text-sm font-mono font-semibold"
              >
                Admin
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Outlet />
    </>
  );
}

const rootRoute = createRootRoute({
  component: Root,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => {
    // Redirect to home on not found
    window.location.hash = "#/";
    window.location.pathname = "/";
    return (
      <div className="p-4 text-center text-muted-foreground">
        Redirecting to home...
      </div>
    );
  },
});

const routeTree = rootRoute.addChildren([homeRoute, adminRoute, notFoundRoute]);
const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
