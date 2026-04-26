import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { getInitials, toAbsoluteImageUrl } from "../utils/image";

interface OrgProfile {
  name: string;
  details: string;
  email: string;
  logoUrl: string | null;
}

const API = "http://localhost:3000";

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

export const OrgProfilePage = () => {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<OrgProfile>({
    name: "",
    details: "",
    email: "",
    logoUrl: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogoPath, setUploadingLogoPath] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileRes = await fetch(`${API}/org/profile`, { credentials: "include" });
        const profileData = await profileRes.json();

        if (!profileRes.ok || !profileData?.success) {
          throw new Error(profileData?.error || "Failed to load org profile");
        }

        setProfile({
          name: profileData.data?.name || "",
          details: profileData.data?.details || "",
          email: profileData.data?.email || "",
          logoUrl: profileData.data?.imagePath || null,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (initialLoaded && editorRef.current && profile.details) {
      editorRef.current.innerHTML = profile.details;
    }
  }, [initialLoaded, profile.details]);

  const handleLogoPathUpload = async () => {
    if (!logoFile) return;
    setUploadingLogoPath(true);

    try {
      const formData = new FormData();
      formData.append("image", logoFile);

      const res = await fetch(`${API}/org/profile/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save logo path");
      }

      setProfile((prev) => ({ ...prev, logoUrl: data.data?.imagePath || prev.logoUrl }));
      setLogoFile(null);
    } catch (err) {
      console.error("Failed to upload logo path:", err);
      alert(err instanceof Error ? err.message : "Unable to save logo path");
    } finally {
      setUploadingLogoPath(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const editorContent = editorRef.current?.innerHTML || "";

    try {
      console.log("Profile data to save:", {
        name: profile.name,
        details: editorContent,
      });
      await new Promise((resolve) => setTimeout(resolve, 800));

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-500">
              Update your organization's details to improve AI matching with potential corporate sponsors.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Identity</h2>

            <div className="flex items-start gap-6 mb-8">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                  {logoPreview || profile.logoUrl ? (
                    <img
                      src={logoPreview || toAbsoluteImageUrl(profile.logoUrl) || ""}
                      alt="Organization logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-lg font-bold text-white">
                      {getInitials(profile.name || profile.email, 3)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Organization Logo</p>
                <p className="text-xs text-gray-400 mb-3">
                  Upload an image file. Stored name is generated automatically.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setLogoFile(file);
                      setLogoPreview(file ? URL.createObjectURL(file) : null);
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={handleLogoPathUpload}
                    disabled={uploadingLogoPath || !logoFile}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
                  >
                    {uploadingLogoPath ? "Saving..." : "Upload"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
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
            </div>
          </div>

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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organization Details & Mission
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
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
