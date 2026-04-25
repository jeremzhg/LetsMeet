import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { StatusPill } from "../components/shared/StatusPill";

import eventTechImg from "../assets/images/event-tech-conference.png";
import eventNetworkImg from "../assets/images/event-networking.png";
import eventCareerImg from "../assets/images/event-career-fair.png";

/* ── Types ─────────────────────────────────────────────────────── */
interface EventPackage {
  id: string;
  title: string;
  cost: number;
  details: string;
}

interface PartnerInfo {
  eventID: string;
  corporationID: string;
  status: string;
  packageID: string | null;
  package?: EventPackage | null;
}

interface OrgEvent {
  id: string;
  title: string;
  details: string;
  date: string;
  country: string;
  city: string;
  status: string;
  expectedParticipants: number;
  packages?: EventPackage[];
  _count?: { partners: number };
}

interface EventCardData extends OrgEvent {
  targetAmount: number;
  securedAmount: number;
  progress: number;
}

const API = "http://localhost:3000";

const eventImages = [eventTechImg, eventNetworkImg, eventCareerImg];

const tabs = ["Dashboard", "Events", "Partnerships"];

/* ── Page Component ────────────────────────────────────────────── */
export const OrgAllEventsPage = () => {
  const [userID, setUserID] = useState<string | null>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Events");

  /* Fetch user info */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.user) setUserID(data.user.id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  /* Fetch events + sponsorship data */
  useEffect(() => {
    if (!userID) return;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/org/${userID}/events`, { credentials: "include" });
        const data = await res.json();
        if (!data.success) return;

        const enrichedEvents: EventCardData[] = await Promise.all(
          (data.data || []).map(async (event: OrgEvent) => {
            let targetAmount = 0;
            let securedAmount = 0;

            try {
              // Get event details for packages
              const detailRes = await fetch(`${API}/org/events/${event.id}`, {
                credentials: "include",
              });
              const detailData = await detailRes.json();
              const packages: EventPackage[] = detailData.data?.packages || detailData.packages || [];
              targetAmount = packages.reduce((sum: number, pkg: EventPackage) => sum + pkg.cost, 0);

              // Get partners for secured calculation
              const partnersRes = await fetch(`${API}/org/events/${event.id}/partners`, {
                credentials: "include",
              });
              const partnersData = await partnersRes.json();
              if (partnersData.success) {
                securedAmount = (partnersData.data || [])
                  .filter((p: PartnerInfo) => p.status === "accepted" && p.package)
                  .reduce((sum: number, p: PartnerInfo) => sum + (p.package?.cost || 0), 0);
              }
            } catch {
              /* proceed with zero amounts */
            }

            const progress = targetAmount > 0 ? Math.round((securedAmount / targetAmount) * 100) : 0;
            return { ...event, targetAmount, securedAmount, progress };
          })
        );

        setEvents(enrichedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [userID]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-partnerships" />

      <main className="flex-1 overflow-y-auto">
        {/* Top navigation bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-gray-900">LetsMeet</span>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-0.5 transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 shadow-sm" />
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Events</h1>
              <p className="text-gray-500 max-w-lg leading-relaxed">
                Manage your organization's upcoming initiatives, track sponsorship progress,
                and ensure alignment with corporate partners.
              </p>
            </div>
            <Link
              to="/org/events/new"
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a2e4a] text-white text-sm font-semibold hover:bg-[#243b5e] transition-all shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create New Event
            </Link>
          </div>

          {/* Event Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No events yet</h3>
              <p className="text-gray-400 mb-4">Create your first event to get started</p>
              <Link
                to="/org/events/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                + Create New Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/org/events/${event.id}`}
                  className="event-card group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300"
                >
                  {/* Image header */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={eventImages[index % eventImages.length]}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <StatusPill status={event.status} />
                    </div>
                    {/* Colored top accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      event.status === "active" ? "bg-green-500"
                        : event.status === "completed" ? "bg-gray-400"
                        : "bg-amber-400"
                    }`} />
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-blue-700 transition-colors leading-tight">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.city}{event.country ? `, ${event.country}` : ""}
                      </div>
                    </div>

                    {/* Sponsorship progress */}
                    {event.status === "completed" ? (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Final Goal Reached</p>
                            <p className="text-sm font-bold text-gray-900">
                              ${event.securedAmount.toLocaleString()} Raised
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500">Sponsorship Progress</span>
                          <span className={`text-xs font-bold ${
                            event.progress >= 75 ? "text-blue-600"
                              : event.progress >= 40 ? "text-amber-500"
                              : "text-gray-500"
                          }`}>
                            {event.progress}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              event.progress >= 75 ? "bg-blue-600"
                                : event.progress >= 40 ? "bg-amber-400"
                                : "bg-gray-300"
                            }`}
                            style={{ width: `${Math.min(event.progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            Target: ${event.targetAmount.toLocaleString()}
                          </span>
                          <span className="font-semibold text-green-600">
                            Secured: ${event.securedAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
