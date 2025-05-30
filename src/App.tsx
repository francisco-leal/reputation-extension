import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState<string | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("name");
    if (stored) setName(stored);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      window.localStorage.setItem("name", input.trim());
      setName(input.trim());
    }
  };

  return (
    <div className="min-w-[300px] min-h-[120px] flex flex-col items-center justify-center p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">
        Web3 Reputation Explorer
      </h1>
      {name ? (
        <p className="text-lg">
          Hello, <b>{name}</b>!
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 w-full justify-center"
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
