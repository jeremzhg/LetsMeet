import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { StatusPill } from "../components/shared/StatusPill";
import { toAbsoluteImageUrl } from "../utils/image";

interface EventPackage {
  id: string;
  title: string;
  cost: number;
  details: string;
}

interface EventDetail {
  id: string;
  title: string;
  details: string;
  date: string;
  country: string;
  city: string;
  venue: string;
  status: string;
  expectedParticipants: number;
  targetSponsorValue: number;
  organizationID: string;
  organization?: {
    name: string;
    email: string;
  };
  imagePath?: string | null;
  packages?: EventPackage[];
}

interface CorpMatch {
  eventID: string;
  score: number;
  aiReasoning?: string;
  reasoning?: string;
}

interface PartnerItem {
  eventID: string;
}

const API = "http://localhost:3000";

export const CorporationEventPublicPage = () => {
  const navigate = useNavigate();
  const { id: eventID } = useParams<{ id: string }>();
  const [corpID, setCorpID] = useState<string | null>(null);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [fitReasoning, setFitReasoning] = useState<string>("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchPublicEventData = async () => {
      if (!eventID) return;

      setLoading(true);
      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = meRes.ok ? await meRes.json() : null;
        const user = meData?.user;
        const isCorp = user?.role === "corp" || user?.role === "corporation";

        setViewerRole(user?.role || null);
        if (isCorp) {
          setCorpID(user.id);
        }

        const eventRes = await fetch(`${API}/org/events/${eventID}`, { credentials: "include" });

        const eventData = await eventRes.json();
        if (eventRes.ok) {
          setEvent(eventData.data || eventData);
        }

        if (isCorp) {
          const [matchesRes, partnersRes] = await Promise.all([
            fetch(`${API}/corp/${user.id}/matches`, { credentials: "include" }),
            fetch(`${API}/partners`, { credentials: "include" }),
          ]);

          const matchesData = await matchesRes.json();
          const matches: CorpMatch[] = Array.isArray(matchesData)
            ? matchesData
            : matchesData?.data || [];
          const currentMatch = matches.find((m) => m.eventID === eventID);
          if (currentMatch) {
            setFitScore(currentMatch.score);
            setFitReasoning(currentMatch.aiReasoning || currentMatch.reasoning || "");
          }

          const partnersData = await partnersRes.json();
          if (partnersData?.success) {
            const hasApplied = (partnersData.data || []).some(
              (partner: PartnerItem) => partner.eventID === eventID
            );
            setAlreadyApplied(hasApplied);
          }
        }
      } catch (error) {
        console.error("Failed to fetch public event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicEventData();
  }, [eventID, navigate]);

  const handleApply = async (packageID?: string) => {
    if (!eventID || !corpID || alreadyApplied) return;

    setApplying(true);
    try {
      await fetch(`${API}/partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventID,
          corporationID: corpID,
          ...(packageID ? { packageID } : {}),
        }),
      });
      setAlreadyApplied(true);
    } catch (error) {
      console.error("Failed to apply for partnership:", error);
    } finally {
      setApplying(false);
    }
  };

  const formattedDate = useMemo(() => {
    if (!event?.date) return "";
    return new Date(event.date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, [event?.date]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-dashboard" ctaPosition="top" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading event details…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-dashboard" ctaPosition="top" />
        <main className="flex-1 overflow-y-auto">
          <TopNavbar />
          <div className="max-w-4xl mx-auto px-8 py-10">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900">Event not found</h2>
              <Link
                to="/events"
                className="mt-4 inline-flex rounded-xl bg-[#1a2e4a] px-4 py-2 text-sm font-semibold text-white"
              >
                Back to Event Forum
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />

        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <StatusPill status={event.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="h-64 bg-gray-100">
                <img
                  src={toAbsoluteImageUrl(event.imagePath) || ""}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <p className="mt-2 text-sm text-gray-500">
                  By {event.organization?.name || "Student Organization"}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <span className="font-semibold text-gray-700">Date:</span> {formattedDate}
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <span className="font-semibold text-gray-700">Location:</span> {event.city}, {event.country}
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <span className="font-semibold text-gray-700">Venue:</span> {event.venue}
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <span className="font-semibold text-gray-700">Participants:</span> {event.expectedParticipants}
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-lg font-bold text-gray-900">About This Event</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{event.details}</p>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-1">AI Fit Score</h3>
                <p className="text-xs text-gray-400 mb-3">
                  {viewerRole === "corp" || viewerRole === "corporation"
                    ? "For your corporation profile"
                    : "Visible when viewed from corporation account"}
                </p>
                <div className="flex justify-center">
                  <ScoreBadge score={fitScore ?? 0} size="lg" />
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {fitReasoning || "No AI reasoning available for this event yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Sponsorship Packages</h3>
                  <span className="text-xs font-semibold text-gray-400">{event.packages?.length || 0} options</span>
                </div>

                {event.packages && event.packages.length > 0 ? (
                  <div className="space-y-3">
                    {event.packages.map((pkg) => (
                      <div key={pkg.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{pkg.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{pkg.details}</p>
                          </div>
                          <span className="text-sm font-bold text-blue-700">${pkg.cost.toLocaleString()}</span>
                        </div>

                        {(viewerRole === "corp" || viewerRole === "corporation") && (
                          <button
                            type="button"
                            onClick={() => handleApply(pkg.id)}
                            disabled={alreadyApplied || applying}
                            className="mt-3 w-full rounded-lg bg-[#1a2e4a] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#243b5e] disabled:opacity-60"
                          >
                            {alreadyApplied ? "Proposal Sent" : applying ? "Applying..." : "Apply with This Package"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  (viewerRole === "corp" || viewerRole === "corporation") && (
                    <button
                      type="button"
                      onClick={() => handleApply()}
                      disabled={alreadyApplied || applying}
                      className="w-full rounded-lg bg-[#1a2e4a] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#243b5e] disabled:opacity-60"
                    >
                      {alreadyApplied ? "Proposal Sent" : applying ? "Applying..." : "Apply for Partnership"}
                    </button>
                  )
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};
