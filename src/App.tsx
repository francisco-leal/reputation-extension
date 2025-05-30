import { useState, useEffect } from "react";

function App() {
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
    <div className="min-w-[300px] min-h-[120px] flex flex-col items-center justify-center p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">
        Web3 Reputation Explorer
      </h1>
      {searchTerm ? (
        <p className="text-lg">
          Search term: <b>{searchTerm}</b>
        </p>
      ) : (
        <p className="text-gray-500">No search term selected yet.</p>
      )}
    </div>
  );
}

export default App;
