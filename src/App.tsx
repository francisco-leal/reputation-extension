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
import { fetchTalentScore } from "@/lib/talentApi";
import { parseUnits, formatEther } from "viem";

// Add BlockscoutData type
type BlockscoutData = {
  is_contract: boolean;
  is_verified: boolean;
  coin_balance: string;
  name: string | null;
  creator_address_hash: string | null;
};

function Home() {
  // State machine states: idle, loadingBlockscout, loadingTalent, done, error
  type State =
    | { status: "idle"; searchTerm: string; pageUrl: string }
    | {
        status: "loadingBlockscout";
        searchTerm: string;
        pageUrl: string;
        progress: number;
      }
    | {
        status: "loadingTalent";
        searchTerm: string;
        pageUrl: string;
        blockscoutData: BlockscoutData;
        progress: number;
      }
    | {
        status: "done";
        searchTerm: string;
        pageUrl: string;
        blockscoutData: BlockscoutData;
        score: number | null;
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

  // Load from localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storedTerm = urlParams.get("search");
    const storedUrl = urlParams.get("url");
    if (storedTerm) {
      setState({
        status: "loadingBlockscout",
        searchTerm: storedTerm,
        pageUrl: storedUrl || "",
        progress: 0,
      });
    }
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (
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

  // Handle state transitions
  useEffect(() => {
    if (state.status === "loadingBlockscout") {
      setProgress(10);
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
              progress: 70,
            });
          } else {
            setState({
              status: "done",
              searchTerm: state.searchTerm,
              pageUrl: state.pageUrl,
              blockscoutData: blockscoutData,
              score: null,
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
          setProgress(100);
          setState({
            status: "done",
            searchTerm: state.searchTerm,
            pageUrl: state.pageUrl,
            blockscoutData: state.blockscoutData,
            score,
            progress: 100,
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
      status: "loadingBlockscout",
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
      {(state.status === "loadingBlockscout" ||
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
          {(state.status === "loadingBlockscout" ||
            state.status === "loadingTalent") && <Progress value={progress} />}
        </>
      )}
      {state.status === "error" && (
        <p className="text-red-500 font-mono mt-2">{state.error}</p>
      )}
      {state.status === "done" && (
        <>
          <div className="text-sm font-mono mt-2 p-2 border rounded bg-muted">
            <div className="font-bold text-lg text-center">Blockscout</div>
            {state.blockscoutData.name && (
              <div>
                Name: <b>{state.blockscoutData.name || "-"}</b>
              </div>
            )}
            <div>
              ETH Balance:{" "}
              <b>
                {typeof state.blockscoutData.coin_balance === "string"
                  ? Number(
                      formatEther(
                        parseUnits(state.blockscoutData.coin_balance, 0)
                      )
                    ).toFixed(2)
                  : "-"}{" "}
                ETH
              </b>
            </div>
            <div>
              Is Contract:{" "}
              <b>{state.blockscoutData.is_contract ? "Yes" : "No"}</b>
            </div>
            {state.blockscoutData.creator_address_hash && (
              <div>
                Creator:{" "}
                <b>
                  {displaySearchTerm(state.blockscoutData.creator_address_hash)}
                </b>
              </div>
            )}
            <div>
              Is Verified:{" "}
              <b>{state.blockscoutData.is_verified ? "Yes" : "No"}</b>
            </div>
          </div>
          {state.score !== null && (
            <div className="text-sm font-mono mt-2 p-2 border rounded bg-muted">
              <div className="font-bold text-lg text-center">
                Talent Protocol
              </div>
              <div>
                Builder Score: <b>{state.score}</b>
              </div>
            </div>
          )}
        </>
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
