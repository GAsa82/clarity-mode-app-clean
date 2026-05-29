import { useState } from "react";
import { Settings, Shield, Mail, Key, Save, CheckCircle } from "lucide-react";
import { getAdminEmails, setAdminEmails } from "@/lib/auth";

export default function AdminSettings() {
  const [adminEmails, setLocalAdminEmails] = useState(getAdminEmails().join("\n"));
  const [saved, setSaved] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");

  const handleSaveAdminEmails = () => {
    const emails = adminEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
    setAdminEmails(emails);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your Clarity Mode admin panel
        </p>
      </div>

      {/* Admin Emails */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Admin Access</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          One email per line. Users signing in with these emails will have admin privileges.
        </p>
        <textarea
          value={adminEmails}
          onChange={(e) => setLocalAdminEmails(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-background/60 border border-border focus:border-primary outline-none text-sm transition-colors resize-none font-mono"
          placeholder="admin@example.com"
        />
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleSaveAdminEmails}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            {saved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Admin Emails
              </>
            )}
          </button>
        </div>
      </div>

      {/* API Configuration */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">API Configuration</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Clarity AI Backend URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border focus:border-primary outline-none text-sm transition-colors font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Ollama URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border focus:border-primary outline-none text-sm transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-xl bg-card border border-red-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          These actions are irreversible. Be careful.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
            Clear All Data
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
            Reset Vector Store
          </button>
        </div>
      </div>
    </div>
  );
}