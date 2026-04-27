import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { StatusPill } from "../components/shared/StatusPill";
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
  const [corporation, setCorporation] = useState<CorporationDetails | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [corpImageFile, setCorpImageFile] = useState<File | null>(null);
  const [uploadingCorpImage, setUploadingCorpImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canUploadLogo, setCanUploadLogo] = useState(false);
  const [profileCorpID, setProfileCorpID] = useState<string | null>(null);

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

  const handleProposeMatch = async () => {
    try {
      const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
      const meData = await meRes.json();
      if (!meData.user) return;

      const eventsRes = await fetch(`${API}/org/${meData.user.id}/events`, {
        credentials: "include",
      });
      const eventsData = await eventsRes.json();
      const firstEvent = eventsData.data?.[0];
      if (!firstEvent || !corpID) return;

      await fetch(`${API}/partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID: firstEvent.id, corporationID: corpID }),
      });
      alert("Partnership proposal sent!");
    } catch (err) {
      console.error("Failed to propose match:", err);
    }
  };

  const handleSaveCorpImagePath = async () => {
    if (!profileCorpID || !corpImageFile || !canUploadLogo) return;
    setUploadingCorpImage(true);
    try {
      const formData = new FormData();
      formData.append("image", corpImageFile);

      const endpoint = corpID ? `${API}/corp/${profileCorpID}/image` : `${API}/corp/profile/image`;
      const res = await fetch(endpoint, {
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
      setCorpImageFile(null);
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

        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/org/corporations"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Discover
            </Link>

            <div className="flex items-center gap-3">
              {canUploadLogo && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCorpImageFile(e.target.files?.[0] || null)}
                    className="w-60 bg-transparent px-1 text-xs text-gray-700 placeholder-gray-400 outline-none"
                  />
                  <button
                    onClick={handleSaveCorpImagePath}
                    disabled={uploadingCorpImage || !corpImageFile}
                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                  >
                    {uploadingCorpImage ? "Uploading..." : "Upload Logo"}
                  </button>
                </div>
              )}
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save Profile
              </button>
              <button
                onClick={handleProposeMatch}
                className="px-5 py-2.5 rounded-xl bg-[#1a2e4a] text-sm font-semibold text-white hover:bg-[#243b5e] transition-all shadow-md"
              >
                Propose Match
              </button>
            </div>
          </div>

          <div className="flex gap-6 mb-8">
            <div className="flex-1 rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                  {corporation?.imagePath ? (
                    <img
                      src={toAbsoluteImageUrl(corporation.imagePath) || ""}
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

                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {corporation?.name || "Corporation"}
                  </h1>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {corporation?.details || "No description available."}
                  </p>
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
                  <div
                    key={event.id}
                    className="history-card group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="h-32 bg-gradient-to-br from-slate-700 via-blue-900 to-slate-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <StatusPill
                          status={event.status === "completed" ? "Successful" : event.status}
                        />
                      </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
