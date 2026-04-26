import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { ScoreBadge } from "../components/shared/ScoreBadge";

/* ── Types ─────────────────────────────────────────────────────── */
interface EventDetail {
  id: string;
  title: string;
  details: string;
  date: string;
  country: string;
  city: string;
  status: string;
  expectedParticipants: number;
  packages?: { id: string; title: string; cost: number; details: string }[];
}

interface MatchedCorp {
  eventID: string;
  corporationID: string;
  score: number;
  reasoning: string;
  corporation: {
    name: string;
    category?: string;
    details?: string;
    email?: string;
  };
}

interface Partner {
  eventID: string;
  corporationID: string;
  status: string;
  packageID: string | null;
  corporation?: {
    id: string;
    name: string;
    email: string;
    category: string;
  };
  package?: { title: string; cost: number } | null;
}

interface OrgEventSummary {
  id: string;
}

const API = "http://localhost:3000";

type TabType = "matches" | "inbox";

/* ── Page Component ────────────────────────────────────────────── */
export const EventWorkspacePage = () => {
  const { id: eventID } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [matches, setMatches] = useState<MatchedCorp[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("matches");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingProposal, setSendingProposal] = useState<Set<string>>(new Set());

  /* Fetch event data */
  useEffect(() => {
    if (!eventID) return;

    const fetchData = async () => {
      setLoading(true);
      setAccessDenied(false);

      try {
        // Ensure user is an organization
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        const role = meData?.user?.role;
        const isOrgRole = role === "org" || role === "organization";

        if (!meData?.user || !isOrgRole) {
          navigate("/login", { replace: true });
          return;
        }

        // Ensure selected event belongs to current organization
        const orgEventsRes = await fetch(`${API}/org/${meData.user.id}/events`, {
          credentials: "include",
        });
        const orgEventsData = await orgEventsRes.json();
        const ownsEvent = (orgEventsData?.data || []).some(
          (orgEvent: OrgEventSummary) => orgEvent.id === eventID
        );

        if (!ownsEvent) {
          setAccessDenied(true);
          return;
        }

        // Fetch event details
        const eventRes = await fetch(`${API}/org/events/${eventID}`, {
          credentials: "include",
        });
        const eventData = await eventRes.json();
        setEvent(eventData.data || eventData);

        // Fetch AI matches
        const matchRes = await fetch(`${API}/matches/${eventID}`, {
          credentials: "include",
        });
        const matchData = await matchRes.json();
        if (matchData.success) {
          setMatches(matchData.data || []);
        }

        // Fetch partners
        const partnerRes = await fetch(`${API}/org/events/${eventID}/partners`, {
          credentials: "include",
        });
        const partnerData = await partnerRes.json();
        if (partnerData.success) {
          setPartners(partnerData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch event data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventID, navigate]);

  /* Force refresh matches */
  const handleRefreshMatches = async () => {
    if (!eventID) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API}/matches/${eventID}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.data || []);
      }
    } catch (err) {
      console.error("Failed to refresh matches:", err);
    } finally {
      setRefreshing(false);
    }
  };

  /* Send proposal */
  const handleSendProposal = async (corporationID: string) => {
    if (!eventID) return;
    setSendingProposal((prev) => new Set(prev).add(corporationID));
    try {
      await fetch(`${API}/partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID, corporationID }),
      });
      // Refresh partners list
      const partnerRes = await fetch(`${API}/org/events/${eventID}/partners`, {
        credentials: "include",
      });
      const partnerData = await partnerRes.json();
      if (partnerData.success) {
        setPartners(partnerData.data || []);
      }
    } catch (err) {
      console.error("Failed to send proposal:", err);
    } finally {
      setSendingProposal((prev) => {
        const next = new Set(prev);
        next.delete(corporationID);
        return next;
      });
    }
  };

  /* Update partner status */
  const handleUpdatePartnerStatus = async (corporationID: string, status: string) => {
    if (!eventID) return;
    try {
      await fetch(`${API}/partners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID, corporationID, status }),
      });
      setPartners((prev) =>
        prev.map((p) =>
          p.corporationID === corporationID ? { ...p, status } : p
        )
      );
    } catch (err) {
      console.error("Failed to update partner status:", err);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  /* Group partners by status for inbox pipeline */
  const partnerGroups: Record<string, Partner[]> = {
    pending: partners.filter((p) => p.status === "pending"),
    accepted: partners.filter((p) => p.status === "accepted"),
    rejected: partners.filter((p) => p.status === "rejected"),
  };

  const pipelineColumns = [
    { key: "pending", label: "APPLIED", color: "bg-amber-400" },
    { key: "accepted", label: "ACCEPTED", color: "bg-green-500" },
    { key: "rejected", label: "REJECTED", color: "bg-red-400" },
  ];

  /* Check if corp already has a partnership */
  const hasPartnership = (corporationID: string) =>
    partners.some((p) => p.corporationID === corporationID);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-dashboard" ctaPosition="top" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading event workspace…</p>
          </div>
        </main>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-dashboard" ctaPosition="top" />
        <main className="flex flex-1 items-center justify-center px-8">
          <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-500">
              This workspace is only available for events created by your organization.
            </p>
            <Link
              to="/org/events"
              className="mt-5 inline-flex items-center rounded-xl bg-[#1a2e4a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#243b5e]"
            >
              Back to My Events
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* ── Event Header ─────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {event ? formatDate(event.date) : ""}
              </div>
              <span>•</span>
              <span className="capitalize font-medium text-green-600">
                {event?.status || "Pending"} Planning
              </span>
            </div>

            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {event?.title || "Event"}
              </h1>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={`/org/events/${eventID}/edit`}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Edit Event Details
                </Link>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a2e4a] text-sm font-semibold text-white hover:bg-[#243b5e] transition-all shadow-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Prospectus
                </button>
              </div>
            </div>
          </div>

          {/* ── Tab Navigation ────────────────────────────────── */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("matches")}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === "matches"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              AI Matches
            </button>
            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === "inbox"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-8 5-8-5" />
              </svg>
              Partnership Inbox
            </button>
          </div>

          {/* ── Tab Content ───────────────────────────────────── */}
          {activeTab === "matches" ? (
            /* ── AI Matches Tab ───────────────────────────────── */
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Recommended Partners</h2>
                <button
                  onClick={handleRefreshMatches}
                  disabled={refreshing}
                  className="text-sm text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {refreshing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      Refreshing…
                    </>
                  ) : (
                    "Updated recently"
                  )}
                </button>
              </div>

              {matches.length === 0 ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                  <p className="text-gray-400">No AI matches found. Try refreshing or editing your event details for better results.</p>
                  <button
                    onClick={handleRefreshMatches}
                    disabled={refreshing}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
                  >
                    {refreshing ? "Calculating…" : "Generate Matches"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                  {matches.map((match) => {
                    const initials = match.corporation.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    const alreadyPartnered = hasPartnership(match.corporationID);

                    return (
                      <div
                        key={match.corporationID}
                        className="match-card rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                <Link
                                  to={`/org/corporations/${match.corporationID}`}
                                  className="hover:text-blue-700 transition-colors"
                                >
                                  {match.corporation.name}
                                </Link>
                              </h3>
                              <p className="text-xs text-gray-400">
                                {match.corporation.category || "General"}
                              </p>
                            </div>
                          </div>
                          <ScoreBadge score={match.score} size="md" />
                        </div>

                        {/* AI Reasoning */}
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              AI Reasoning
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {match.reasoning}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600">
                            {alreadyPartnered ? "Proposal Sent" : "Ready to Pitch"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                            {alreadyPartnered ? (
                              <Link
                                to={`/org/corporations/${match.corporationID}`}
                                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                              >
                                View Profile
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleSendProposal(match.corporationID)}
                                disabled={sendingProposal.has(match.corporationID)}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60"
                              >
                                {sendingProposal.has(match.corporationID) ? "Sending…" : "Send Proposal"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── Partnership Inbox Tab ─────────────────────────── */
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">Partnership Inbox</h2>
                <p className="text-sm text-gray-500 mt-1">Manage active conversations and pipeline.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {pipelineColumns.map((col) => {
                  const columnPartners = partnerGroups[col.key] || [];
                  return (
                    <div key={col.key} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                      {/* Column header */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {col.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold text-white ${col.color}`}>
                          {columnPartners.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="p-3 space-y-3 min-h-[200px]">
                        {columnPartners.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">No partners</p>
                        ) : (
                          columnPartners.map((partner) => (
                            <div
                              key={partner.corporationID}
                              className="pipeline-card rounded-xl border border-gray-100 p-3 hover:border-blue-100 hover:shadow-sm transition-all duration-200"
                            >
                              <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-[10px] font-bold">
                                  {partner.corporation?.name
                                    ?.split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase() || "??"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {partner.corporation?.name || "Corporation"}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {partner.corporation?.category || "General"}
                                  </p>
                                </div>
                              </div>

                              {partner.package && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {partner.package.title} • ${partner.package.cost.toLocaleString()}
                                </p>
                              )}

                              {/* Status actions */}
                              {col.key === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdatePartnerStatus(partner.corporationID, "accepted")}
                                    className="flex-1 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePartnerStatus(partner.corporationID, "rejected")}
                                    className="flex-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
