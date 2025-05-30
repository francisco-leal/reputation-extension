import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";

function Admin() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("talentProtocolApiKey");
    if (stored) setSavedKey(stored);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.setItem("talentProtocolApiKey", apiKey);
    setSavedKey(apiKey);
    setApiKey("");
    setEditing(false);
    setShowKey(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleCancel = () => {
    setEditing(false);
    setApiKey("");
    setShowKey(false);
  };

  return (
    <div className="min-w-[340px] max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">Save your secrets</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Store your API keys securely. You can update or reveal them at any time.
        Keep these keys private.
      </p>
      {success && (
        <div className="mb-4 text-green-600 text-sm">
          API Key saved successfully.
        </div>
      )}
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Label
          htmlFor="api-key"
          className="text-xs font-semibold text-gray-700"
        >
          Talent Protocol API Key
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="api-key"
            type={showKey ? "text" : "password"}
            value={editing ? apiKey : savedKey ? savedKey : ""}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={savedKey ? "••••••••••••" : "Enter API Key"}
            disabled={!editing}
            className="w-full"
            autoComplete="off"
          />
          {savedKey && !editing && (
            <Button
              type="button"
              variant="outline"
              className="text-xs px-3 py-1"
              onClick={() => setShowKey((prev) => !prev)}
            >
              {showKey ? "Hide" : "Show"}
            </Button>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          {!editing && (
            <Button
              type="button"
              variant="default"
              className="text-xs px-4"
              onClick={() => {
                setEditing(true);
                setApiKey("");
                setShowKey(false);
              }}
            >
              Edit
            </Button>
          )}
          {editing && (
            <>
              <Button type="submit" className="text-xs px-4">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-xs px-4"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default Admin;
