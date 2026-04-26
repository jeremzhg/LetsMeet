import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import orgDefaultLogo from "../assets/images/org-default-logo.png";

/* ── Types ─────────────────────────────────────────────────────── */
interface OrgProfile {
  name: string;
  details: string;
  email: string;
  category: string;
  logoUrl: string | null;
}

const API = "http://localhost:3000";

const categoryOptions = [
  "Technology & Engineering",
  "Business & Finance",
  "Science & Research",
  "Arts & Design",
  "Social Impact & Volunteering",
  "Health & Medicine",
  "Education & Academic",
  "Sports & Recreation",
  "Media & Communications",
  "Other",
];

/* ── Rich Text Toolbar Button ──────────────────────────────────── */
const ToolbarButton = ({
  command,
  icon,
  label,
}: {
  command: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    title={label}
    onMouseDown={(e) => {
      e.preventDefault();
      document.execCommand(command, false);
    }}
    className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
  >
    {icon}
  </button>
);

/* ── Page Component ────────────────────────────────────────────── */
export const OrgProfilePage = () => {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<OrgProfile>({
    name: "",
    details: "",
    email: "",
    category: "",
    logoUrl: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [_logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  /* Fetch current user info */
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();

        if (meData.user) {
          // Try to get org name from events endpoint
          let orgName = "";
          let orgDetails = "";

          try {
            const eventsRes = await fetch(`${API}/org/${meData.user.id}/events`, {
              credentials: "include",
            });
            const eventsData = await eventsRes.json();
            if (eventsData.success && eventsData.data?.length > 0) {
              orgName = eventsData.data[0].organization?.name || "";
            }
          } catch {
            /* events not available */
          }

          setProfile({
            name: orgName || meData.user.email?.split("@")[0] || "",
            details: orgDetails,
            email: meData.user.email || "",
            category: "",
            logoUrl: null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    };
    fetchProfile();
  }, []);

  /* Set initial editor content */
  useEffect(() => {
    if (initialLoaded && editorRef.current && profile.details) {
      editorRef.current.innerHTML = profile.details;
    }
  }, [initialLoaded, profile.details]);

  /* Handle logo upload */
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setProfile((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* Handle save — will call PUT /org/profile when it exists */
  const handleSave = async () => {
    setSaving(true);
    const editorContent = editorRef.current?.innerHTML || "";

    try {
      // NOTE: No PUT /org/profile endpoint exists yet.
      // This is a placeholder that logs the data and shows success state.
      console.log("Profile data to save:", {
        name: profile.name,
        details: editorContent,
        category: profile.category,
      });

      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Would call:
      // await fetch(`${API}/org/profile`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include",
      //   body: JSON.stringify({
      //     name: profile.name,
      //     details: editorContent,
      //     category: profile.category,
      //   }),
      // });

      alert("Profile saved successfully! (Note: No backend endpoint exists yet — see report.md)");
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-partnerships" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading profile…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-partnerships" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* ── Page Header ─────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-500">
              Update your organization's details to improve AI matching with potential corporate sponsors.
            </p>
          </div>

          {/* ── Identity Section ─────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Identity</h2>

            {/* Logo upload */}
            <div className="flex items-start gap-6 mb-8">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                  <img
                    src={logoPreview || profile.logoUrl || orgDefaultLogo}
                    alt="Organization logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Edit badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Organization Logo</p>
                <p className="text-xs text-gray-400 mb-3">
                  Recommended size: 400×400px. JPG, PNG, or GIF.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Upload New
                  </button>
                  {(logoPreview || profile.logoUrl) && (
                    <button
                      onClick={handleRemoveLogo}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Name + Category row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your organization name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category / Focus Area
                </label>
                <div className="relative">
                  <select
                    value={profile.category}
                    onChange={(e) => setProfile((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 appearance-none transition-all"
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── Matching Profile Details ─────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Matching Profile Details</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              This information is analyzed by our AI to suggest the best corporate partners for your events
              and initiatives. Be detailed about your mission and audience.
            </p>

            {/* Rich text editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organization Details & Mission
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                {/* Toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <ToolbarButton
                    command="bold"
                    label="Bold"
                    icon={<span className="text-sm font-bold">B</span>}
                  />
                  <ToolbarButton
                    command="italic"
                    label="Italic"
                    icon={<span className="text-sm italic">I</span>}
                  />
                  <ToolbarButton
                    command="underline"
                    label="Underline"
                    icon={<span className="text-sm underline">U</span>}
                  />
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <ToolbarButton
                    command="insertUnorderedList"
                    label="Bullet list"
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    }
                  />
                  <ToolbarButton
                    command="createLink"
                    label="Insert link"
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    }
                  />
                </div>

                {/* Editable area */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[200px] px-4 py-4 text-sm text-gray-700 leading-relaxed focus:outline-none prose prose-sm max-w-none"
                  style={{
                    wordBreak: "break-word",
                  }}
                  data-placeholder="Describe your organization's mission, target audience, types of events, and what you look for in corporate sponsors..."
                />
              </div>
            </div>
          </div>

          {/* ── Action Buttons ───────────────────────────────── */}
          <div className="flex items-center justify-end gap-4 pb-8">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a2e4a] text-white text-sm font-semibold hover:bg-[#243b5e] transition-all shadow-md disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
