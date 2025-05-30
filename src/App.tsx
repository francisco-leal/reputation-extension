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
import { Button } from "@/components/ui/button";

function Home() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedTerm = window.localStorage.getItem("searchTerm");
    if (storedTerm) setSearchTerm(storedTerm);
    const storedUrl = window.localStorage.getItem("pageUrl");
    if (storedUrl) setPageUrl(storedUrl);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "searchTerm") setSearchTerm(e.newValue);
      if (e.key === "pageUrl") setPageUrl(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function displaySearchTerm(term: string) {
    if (term.length > 20) {
      return `${term.slice(0, 6)}...${term.slice(-6)}`;
    }
    return term;
  }

  const handleSearchScore = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setError(null);
    setScore(null);
    try {
      const { fetchTalentScore } = await import("@/lib/talentApi");
      const result = await fetchTalentScore(searchTerm);
      setScore(result);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

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
          <Button
            className="font-mono mb-2"
            onClick={handleSearchScore}
            disabled={loading}
          >
            {loading ? "Searching..." : "Get Builder Score"}
          </Button>
        </>
      ) : (
        <p className="text-muted-foreground font-mono mb-2 text-center">
          No search term selected yet.
        </p>
      )}
      {error && <p className="text-red-500 font-mono mt-2">{error}</p>}
      {score !== null && !loading && !error && (
        <p className="text-lg font-mono mt-2">
          Builder Score: <b>{score}</b>
        </p>
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
