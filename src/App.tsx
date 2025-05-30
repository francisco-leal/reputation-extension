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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

function Home() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("searchTerm");
    if (stored) setSearchTerm(stored);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "searchTerm") {
        setSearchTerm(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-extrabold text-center font-mono tracking-tight drop-shadow-lg">
            Web3 Reputation Explorer
          </h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {searchTerm ? (
          <p className="text-lg text-muted-foreground font-mono mb-2 text-center">
            Search term: <b className="text-primary">{searchTerm}</b>
          </p>
        ) : (
          <p className="text-muted-foreground font-mono mb-2 text-center">
            No search term selected yet.
          </p>
        )}
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link to="/admin">Go to Admin</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
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
