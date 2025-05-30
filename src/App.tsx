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
    <div className="min-w-[340px] min-h-[160px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-700 max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold mb-4 text-center text-white font-mono tracking-tight drop-shadow-lg">
        Web3 Reputation Explorer
      </h1>
      {searchTerm ? (
        <p className="text-lg text-gray-200 font-mono mb-2">
          Search term: <b className="text-blue-400">{searchTerm}</b>
        </p>
      ) : (
        <p className="text-gray-400 font-mono mb-2">
          No search term selected yet.
        </p>
      )}
      <Link
        to="/admin"
        className="mt-6 px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold font-mono shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Go to Admin
      </Link>
    </div>
  );
}

function Root() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex flex-col items-center justify-start py-12 px-2">
      <nav className="mb-8 flex gap-4 bg-gray-800 rounded-full px-6 py-2 shadow-lg border border-gray-700">
        <Link
          to="/"
          className="px-4 py-1 rounded-full text-sm font-mono font-semibold text-gray-200 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Home
        </Link>
        <Link
          to="/admin"
          className="px-4 py-1 rounded-full text-sm font-mono font-semibold text-gray-200 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Admin
        </Link>
      </nav>
      <Outlet />
    </div>
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
      <div className="p-4 text-center text-gray-500">
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
