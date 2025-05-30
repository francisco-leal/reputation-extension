import { useState, useEffect } from "react";

function Admin() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("talentProtocolApiKey");
    if (stored) setSavedKey(stored);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.setItem("talentProtocolApiKey", apiKey);
    setSavedKey(apiKey);
    setApiKey("");
  };

  return (
    <div className="min-w-[300px] min-h-[120px] flex flex-col items-center justify-center p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Admin Section</h1>
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-2 w-full max-w-xs"
      >
        <label className="font-semibold">Talent Protocol API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="Enter API Key"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded px-4 py-1 mt-2"
        >
          Save
        </button>
      </form>
      {savedKey && (
        <p className="mt-4 text-green-600">
          Saved Key: <b>{savedKey}</b>
        </p>
      )}
    </div>
  );
}

export default Admin;
