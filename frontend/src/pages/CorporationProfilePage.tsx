import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { StatusPill } from "../components/shared/StatusPill";

/* ── Types ─────────────────────────────────────────────────────── */
interface CorporationDetails {
  id: string;
  name: string;
  email: string;
  details: string;
  category: string;
}

interface MatchData {
  score: number;
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

/* ── Page Component ────────────────────────────────────────────── */
export const CorporationProfilePage = () => {
  const { id: corpID } = useParams<{ id: string }>();
  const [corporation, setCorporation] = useState<CorporationDetails | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!corpID) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to get corporation data from user's events matches
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();

        if (meData.user) {
          // Get org's events to find the match
          const eventsRes = await fetch(`${API}/org/${meData.user.id}/events`, {
            credentials: "include",
          });
          const eventsData = await eventsRes.json();

          if (eventsData.success && eventsData.data?.length > 0) {
            // Search through events' matches for this corporation
            for (const event of eventsData.data) {
              const matchRes = await fetch(`${API}/matches/${event.id}`, {
                credentials: "include",
              });
              const matchResData = await matchRes.json();
              if (matchResData.success) {
                const match = (matchResData.data || []).find(
                  (m: { corporationID: string }) => m.corporationID === corpID
                );
                if (match) {
                  setCorporation({
                    id: corpID,
                    name: match.corporation?.name || "Unknown",
                    email: match.corporation?.email || "",
                    details: match.corporation?.details || match.reasoning || "",
                    category: match.corporation?.category || "General",
                  });
                  setMatchData({ score: match.score, reasoning: match.reasoning });
                  break;
                }
              }
            }
          }

          // Also try getting corp data from partners
          if (!corporation) {
            const partnersRes = await fetch(`${API}/partners`, { credentials: "include" });
            const partnersData = await partnersRes.json();
            if (partnersData.success) {
              const partnerMatch = (partnersData.data || []).find(
                (p: { corporationID: string }) => p.corporationID === corpID
              );
              if (partnerMatch?.corporation) {
                setCorporation({
                  id: corpID,
                  name: partnerMatch.corporation.name,
                  email: partnerMatch.corporation.email,
                  details: partnerMatch.corporation.details || "",
                  category: partnerMatch.corporation.category || "General",
                });
              }
            }
          }
        }

        // Fetch past event history
        const historyRes = await fetch(
          `${API}/corp/${corpID}/history?eventStatus=completed`,
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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  /* Mock sponsorship profile data — no API exists for these fields */
  const sponsorshipProfile = {
    hq: "N/A",
    avgFunding: "N/A",
    prefTimeline: "N/A",
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

        <div className="max-w-5xl mx-auto px-8 py-6">
          {/* ── Back + Actions ──────────────────────────────── */}
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

          {/* ── Main Profile Card + Side Panels ────────────── */}
          <div className="flex gap-6 mb-8">
            {/* Profile card */}
            <div className="flex-1 rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-white font-bold text-lg tracking-wider">
                    {corporation?.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 4)
                      .toUpperCase() || "CORP"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {corporation?.category || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 border border-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Sponsor
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

            {/* Right side panels */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              {/* AI Fit Score */}
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex flex-col items-center">
                <h4 className="text-sm font-bold text-gray-900 mb-1">AI Fit Score</h4>
                <p className="text-xs text-gray-400 mb-3">Based on your org's profile</p>
                <ScoreBadge score={matchData?.score ?? 0} size="lg" />
              </div>

              {/* Sponsorship Profile */}
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Sponsorship Profile
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      HQ
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{sponsorshipProfile.hq}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Avg. Funding
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{sponsorshipProfile.avgFunding}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Pref. Timeline
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{sponsorshipProfile.prefTimeline}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Past Event History ──────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Past Event History</h2>
              <Link
                to={`/org/corporations/${corpID}/history`}
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
                    {/* Image placeholder */}
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
