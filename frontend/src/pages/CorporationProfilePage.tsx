import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { getInitials, toAbsoluteImageUrl } from "../utils/image";

interface CorporationDetails {
  id: string;
  name: string;
  email: string;
  details: string;
  category: string;
  imagePath?: string | null;
}

interface MatchData {
  score: number;
  reasoning: string;
}

interface GeneralOrgMatch {
  corporationID: string;
  organizationID: string;
  matchScore: number;
  reasoning: string;
}

interface GeneralCorpMatch {
  corporationID: string;
  organizationID: string;
  matchScore: number;
  reasoning: string;
}

interface PastEvent {
  id: string;
  title: string;
  date: string;
  details: string;
  status: string;
}

const API = "http://localhost:3000";

export const CorporationProfilePage = () => {
  const { id: corpID } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [corporation, setCorporation] = useState<CorporationDetails | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [corpImageFile, setCorpImageFile] = useState<File | null>(null);
  const [corpLogoPreview, setCorpLogoPreview] = useState<string | null>(null);
  const [uploadingCorpImage, setUploadingCorpImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canUploadLogo, setCanUploadLogo] = useState(false);
  const [profileCorpID, setProfileCorpID] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDetails, setEditDetails] = useState("");

  const isCorpRole = (role?: string) => role === "corp" || role === "corporation";
  const isOrgRole = (role?: string) => role === "org" || role === "organization";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        const meUser = meData?.user;

        const isCorpSelf = Boolean(meUser && isCorpRole(meUser.role) && (!corpID || meUser.id === corpID));
        const resolvedCorpID = corpID || meUser?.id || null;

        setCanUploadLogo(isCorpSelf);
        setProfileCorpID(resolvedCorpID);

        if (!resolvedCorpID) {
          setLoading(false);
          return;
        }

        const corpProfileEndpoint = isCorpSelf ? `${API}/corp/profile` : `${API}/corp/${resolvedCorpID}/profile`;
        const corpProfileRes = await fetch(corpProfileEndpoint, {
          credentials: "include",
        });
        const corpProfileData = await corpProfileRes.json();
        let hasProfileData = false;
        if (corpProfileRes.ok && corpProfileData?.success) {
          setCorporation(corpProfileData.data);
          hasProfileData = true;
        }
        if (meUser) {
          if (isOrgRole(meUser.role) && resolvedCorpID) {
            const generalMatchRes = await fetch(`${API}/matches/general/org/${meUser.id}`, {
              credentials: "include",
            });
            const generalMatchData = await generalMatchRes.json();

            if (generalMatchData?.success) {
              const match = (generalMatchData.data || []).find(
                (m: GeneralOrgMatch) => m.corporationID === resolvedCorpID
              );

              if (match) {
                setMatchData({ score: match.matchScore, reasoning: match.reasoning });
              }
            }
          }

          if (isCorpRole(meUser.role) && resolvedCorpID) {
            const corpGeneralMatchRes = await fetch(`${API}/matches/general/corp/${resolvedCorpID}`, {
              credentials: "include",
            });
            const corpGeneralMatchData = await corpGeneralMatchRes.json();

            if (corpGeneralMatchData?.success) {
              const bestMatch = (corpGeneralMatchData.data || [])[0] as GeneralCorpMatch | undefined;
              if (bestMatch) {
                setMatchData({ score: bestMatch.matchScore, reasoning: bestMatch.reasoning });
              }
            }
          }

          if (!hasProfileData) {
            const partnersRes = await fetch(`${API}/partners`, { credentials: "include" });
            const partnersData = await partnersRes.json();
            if (partnersData.success) {
              const partnerMatch = (partnersData.data || []).find(
                (p: { corporationID: string }) => p.corporationID === resolvedCorpID
              );
              if (partnerMatch?.corporation) {
                setCorporation({
                  id: resolvedCorpID,
                  name: partnerMatch.corporation.name,
                  email: partnerMatch.corporation.email,
                  details: partnerMatch.corporation.details || "",
                  category: partnerMatch.corporation.category || "General",
                });
              }
            }
          }
        }

        const historyRes = await fetch(
          `${API}/corp/${resolvedCorpID}/history?eventStatus=completed`,
          { credentials: "include" }
        );
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setPastEvents(Array.isArray(historyData) ? historyData : historyData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch corporation data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [corpID]);

  useEffect(() => {
    setEditName(corporation?.name || "");
    setEditCategory(corporation?.category || "");
    setEditDetails(corporation?.details || "");
  }, [corporation]);

  const handleSaveProfile = async () => {
    if (!canUploadLogo) return;

    const name = editName.trim();
    const category = editCategory.trim();
    const details = editDetails.trim();

    if (!name || !category || !details) {
      alert("Name, category, and details are required.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${API}/corp/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, category, details }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to update profile");
      }

      setCorporation(data.data);
      setEditingProfile(false);
    } catch (err) {
      console.error("Failed to update corporation profile:", err);
      alert(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCorpImagePath = async () => {
    if (!corpImageFile || !canUploadLogo) return;
    setUploadingCorpImage(true);
    try {
      const formData = new FormData();
      formData.append("image", corpImageFile);

      const res = await fetch(`${API}/corp/profile/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to save corporation image path");
      }

      setCorporation((prev) =>
        prev ? { ...prev, imagePath: data.data?.imagePath || prev.imagePath } : prev
      );
      window.dispatchEvent(new Event("profile-image-updated"));
      setCorpImageFile(null);
      setCorpLogoPreview(null);
    } catch (err) {
      console.error("Failed to upload corporation image path:", err);
      alert(err instanceof Error ? err.message : "Unable to save corporation image path");
    } finally {
      setUploadingCorpImage(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const backPath = canUploadLogo ? "/corp/dashboard" : "/org/corporations";
  const backLabel = canUploadLogo ? "Back to Dashboard" : "Back to Discover";
  const isCorpSelfView = canUploadLogo;

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

  if (isCorpSelfView) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-partnerships" />

        <main className="flex-1 overflow-y-auto">
          <TopNavbar />
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
              <p className="text-gray-500">
                Update your corporation details to improve AI matching with organization opportunities.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Identity</h2>

              <div className="flex items-start gap-6 mb-8">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                    {corpLogoPreview || corporation?.imagePath ? (
                      <img
                        src={corpLogoPreview || toAbsoluteImageUrl(corporation?.imagePath) || ""}
                        alt="Corporation logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-lg font-bold text-white">
                        {getInitials(corporation?.name || corporation?.email, 3)}
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
                  <p className="text-sm font-semibold text-gray-700 mb-1">Corporation Logo</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Upload an image file. Stored name is generated automatically.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
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
                        setCorpImageFile(file);
                        setCorpLogoPreview(file ? URL.createObjectURL(file) : null);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCorpImagePath}
                      disabled={uploadingCorpImage || !corpImageFile}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
                    >
                      {uploadingCorpImage ? "Saving..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Corporation Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your corporation name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Enter your corporation category"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Matching Profile Details</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                This information is analyzed by our AI to suggest the best organization and event opportunities.
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Corporation Details</label>
                <textarea
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-700 leading-relaxed outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Describe your brand, audience, sponsorship goals, and ideal event/organization partnerships..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pb-8">
              <Link
                to="/corp/dashboard"
                className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a2e4a] text-white text-sm font-semibold hover:bg-[#243b5e] transition-all shadow-md disabled:opacity-60"
              >
                {savingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
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
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-partnerships" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />

        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              to={backPath}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {backLabel}
            </Link>

            <div className="flex items-center gap-3">
              {canUploadLogo && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setCorpImageFile(file);
                      setCorpLogoPreview(file ? URL.createObjectURL(file) : null);
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={handleSaveCorpImagePath}
                    disabled={uploadingCorpImage || !corpImageFile}
                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                  >
                    {uploadingCorpImage ? "Saving..." : "Upload"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-6 mb-8">
            <div className="flex-1 rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                  {corpLogoPreview || corporation?.imagePath ? (
                    <img
                      src={corpLogoPreview || toAbsoluteImageUrl(corporation?.imagePath) || ""}
                      alt={`${corporation.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg tracking-wider">
                      {getInitials(corporation?.name, 4) || "CORP"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {corporation?.category || "General"}
                    </span>
                  </div>

                  {editingProfile && canUploadLogo ? (
                    <div className="space-y-3 mb-4">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300"
                        placeholder="Corporation name"
                      />
                      <input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300"
                        placeholder="Category"
                      />
                      <textarea
                        value={editDetails}
                        onChange={(e) => setEditDetails(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300"
                        placeholder="Corporation details"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="rounded-lg bg-[#1a2e4a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#243b5e] disabled:opacity-60"
                        >
                          {savingProfile ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProfile(false);
                            setEditName(corporation?.name || "");
                            setEditCategory(corporation?.category || "");
                            setEditDetails(corporation?.details || "");
                          }}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {corporation?.name || "Corporation"}
                      </h1>

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {corporation?.details || "No description available."}
                      </p>

                      {canUploadLogo && (
                        <button
                          type="button"
                          onClick={() => setEditingProfile(true)}
                          className="mt-4 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Edit Profile
                        </button>
                      )}
                    </>
                  )}

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Contact</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <p className="text-sm font-medium text-gray-700">
                        {corporation?.email || "No contact email available"}
                      </p>
                      {corporation?.email && !canUploadLogo && (
                        <a
                          href={`mailto:${corporation.email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-64 shrink-0 flex flex-col gap-4">
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col items-center">
                <h4 className="text-sm font-bold text-gray-900 mb-1">AI Fit Score</h4>
                <p className="text-xs text-gray-400 mb-3">Based on your org's profile</p>
                <ScoreBadge score={matchData?.score ?? 0} size="lg" />
              </div>

              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  AI Score Reasoning
                </h4>
                <p className="text-sm leading-relaxed text-gray-600">
                  {matchData?.reasoning || "No score reasoning available yet. Generate matches to get AI explanation."}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Past Event History</h2>
              <Link
                to={`/org/corporations/${profileCorpID || corpID}/history`}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Context for our matching algorithm based on their previous successful sponsorships.
            </p>

            {pastEvents.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
                <p className="text-gray-400">No past event history available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.slice(0, 4).map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="history-card group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="h-32 bg-gradient-to-br from-slate-700 via-blue-900 to-slate-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
