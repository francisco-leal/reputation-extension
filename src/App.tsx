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

function Home() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [blockscoutData, setBlockscoutData] = useState<{
    is_contract: boolean;
    is_verified: boolean;
    coin_balance: string;
    name: string | null;
  } | null>(null);
  const [blockscoutError, setBlockscoutError] = useState<string | null>(null);
  const [blockscoutLoading, setBlockscoutLoading] = useState(false);

  useEffect(() => {
    const storedTerm = window.localStorage.getItem("searchTerm");
    if (storedTerm) {
      setSearchTerm(storedTerm);
      window.localStorage.removeItem("searchTerm");
    }
    const storedUrl = window.localStorage.getItem("pageUrl");
    if (storedUrl) {
      setPageUrl(storedUrl);
      window.localStorage.removeItem("pageUrl");
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "searchTerm") setSearchTerm(e.newValue);
      if (e.key === "pageUrl") setPageUrl(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Automatically fetch score and blockscout data when searchTerm is set
  useEffect(() => {
    if (searchTerm) {
      handleSearchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  function displaySearchTerm(term: string) {
    if (term.length > 20) {
      return `${term.slice(0, 6)}...${term.slice(-6)}`;
    }
    return term;
  }

  const handleSearchData = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setBlockscoutLoading(true);
    setError(null);
    setBlockscoutError(null);
    setScore(null);
    setBlockscoutData(null);
    setShowResult(false);
    setProgress(0);
    try {
      const [talentResult, blockscoutResult] = await Promise.all([
        fetchTalentScore(searchTerm),
        fetchBlockscoutAddressInfo(searchTerm),
      ]);
      setScore(talentResult);
      setBlockscoutData(blockscoutResult);
    } catch (err: any) {
      if (err.message?.includes("Talent")) {
        setError(err.message || "Unknown error");
      } else {
        setBlockscoutError(err.message || "Unknown error");
      }
    } finally {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setBlockscoutLoading(false);
        setShowResult(true);
      }, 300);
    }
  };

  // Progress bar animation
  useEffect(() => {
    let timer: any;
    if (loading && progress < 96) {
      timer = setTimeout(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : 96));
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [loading, progress]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background flex flex-col items-center">
      <h1 className="text-2xl font-extrabold text-center font-mono tracking-tight mb-4">
        Web3 Reputation Explorer
      </h1>
      {searchTerm ? (
        <>
          <p className="text-lg text-muted-foreground font-mono mb-2 text-center">
            Search term:{" "}
            <b className="text-primary">{displaySearchTerm(searchTerm)}</b>
          </p>
          {pageUrl && (
            <p className="text-xs text-muted-foreground font-mono mb-2 text-center break-all">
              Page URL: <span className="text-primary">{pageUrl}</span>
            </p>
          )}
          {loading || blockscoutLoading ? <Progress value={progress} /> : null}
        </>
      ) : (
        <p className="text-muted-foreground font-mono mb-2 text-center">
          No search term selected yet.
        </p>
      )}
      {error && showResult && (
        <p className="text-red-500 font-mono mt-2">{error}</p>
      )}
      {blockscoutError !== null && showResult && (
        <p className="text-red-500 font-mono mt-2">
          Blockscout: {blockscoutError}
        </p>
      )}
      {score !== null && showResult && !loading && !error && (
        <div className="text-sm font-mono mt-2 p-2 border rounded bg-muted">
          <div className="font-bold text-lg text-center">Talent Protocol</div>
          <div>
            Builder Score: <b>{score}</b>
          </div>
        </div>
      )}
      {blockscoutData &&
        showResult &&
        !blockscoutLoading &&
        !blockscoutError && (
          <div className="text-sm font-mono mt-2 p-2 border rounded bg-muted">
            <div className="font-bold text-lg text-center">Blockscout</div>
            {blockscoutData.name && (
              <div>
                Name: <b>{blockscoutData.name || "-"}</b>
              </div>
            )}
            <div>
              ETH Balance:{" "}
              <b>
                {Number(
                  formatEther(parseUnits(blockscoutData.coin_balance, 0))
                ).toFixed(2)}{" "}
                ETH
              </b>
            </div>
            <div>
              Is Contract: <b>{blockscoutData.is_contract ? "Yes" : "No"}</b>
            </div>
            <div>
              Is Verified: <b>{blockscoutData.is_verified ? "Yes" : "No"}</b>
            </div>
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
