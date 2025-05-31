import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";

const API_KEYS = [
  { id: "talentProtocol", label: "Talent Protocol" },
  { id: "farcaster", label: "Farcaster" },
  { id: "blockscout", label: "Blockscout" },
  { id: "dune", label: "Dune" },
];

type ApiKeys = {
  [key: string]: string;
};

function Admin() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [inputs, setInputs] = useState<ApiKeys>({});
  const [success, setSuccess] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const stored = window.localStorage.getItem("apiKeys");
    if (stored) {
      setApiKeys(JSON.parse(stored));
    }
  }, []);

  const handleEdit = (id: string) => {
    setEditing((prev) => ({ ...prev, [id]: true }));
    setInputs((prev) => ({ ...prev, [id]: "" }));
    setShowKey((prev) => ({ ...prev, [id]: false }));
  };

  const handleCancel = (id: string) => {
    setEditing((prev) => ({ ...prev, [id]: false }));
    setInputs((prev) => ({ ...prev, [id]: "" }));
    setShowKey((prev) => ({ ...prev, [id]: false }));
  };

  const handleSave = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const newKeys = { ...apiKeys, [id]: inputs[id] };
    window.localStorage.setItem("apiKeys", JSON.stringify(newKeys));
    setApiKeys(newKeys);
    setEditing((prev) => ({ ...prev, [id]: false }));
    setInputs((prev) => ({ ...prev, [id]: "" }));
    setShowKey((prev) => ({ ...prev, [id]: false }));
    setSuccess((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSuccess((prev) => ({ ...prev, [id]: false })), 2000);
  };

  return (
    <div className="min-w-[340px] max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">Save your secrets</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Store your API keys securely. You can update or reveal them at any time.
        Keep these keys private.
      </p>
      {API_KEYS.map(({ id, label }) => (
        <form
          key={id}
          onSubmit={(e) => handleSave(e, id)}
          className="flex flex-col gap-2 mb-8"
        >
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`api-key-${id}`}
              className="text-xs font-semibold text-gray-700"
            >
              {label} API Key
            </Label>
            {!editing[id] && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="p-1 h-7 w-7 text-gray-500 hover:text-blue-600"
                onClick={() => handleEdit(id)}
                aria-label={`Edit ${label} API Key`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M15.232 5.232a2.5 2.5 0 0 0-3.536 0l-7.071 7.07A2 2 0 0 0 4 16h2.5a.5.5 0 0 0 .5-.5V13a.5.5 0 0 1 .146-.354l7.07-7.07a2.5 2.5 0 0 0 0-3.536z" />
                </svg>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id={`api-key-${id}`}
              type={showKey[id] ? "text" : "password"}
              value={
                editing[id] ? inputs[id] ?? "" : apiKeys[id] ? apiKeys[id] : ""
              }
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, [id]: e.target.value }))
              }
              placeholder={
                apiKeys[id] ? "••••••••••••" : `Enter ${label} API Key`
              }
              disabled={!editing[id]}
              className="w-full"
              autoComplete="off"
            />
            {apiKeys[id] && !editing[id] && (
              <Button
                type="button"
                variant="outline"
                className="text-xs px-3 py-1"
                onClick={() =>
                  setShowKey((prev) => ({ ...prev, [id]: !prev[id] }))
                }
              >
                {showKey[id] ? "Hide" : "Show"}
              </Button>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {editing[id] && (
              <>
                <Button type="submit" className="text-xs px-4">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs px-4"
                  onClick={() => handleCancel(id)}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
          {success[id] && (
            <div className="mb-2 text-green-600 text-sm">
              API Key saved successfully.
            </div>
          )}
        </form>
      ))}
    </div>
  );
}

export default Admin;
