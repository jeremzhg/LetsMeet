import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { StatusPill } from "../components/shared/StatusPill";
import { ScoreBadge } from "../components/shared/ScoreBadge";

import eventTechImg from "../assets/images/event-tech-conference.png";
import eventNetworkImg from "../assets/images/event-networking.png";
import eventCareerImg from "../assets/images/event-career-fair.png";

/* ── Types ─────────────────────────────────────────────────────── */
interface PublicEvent {
  id: string;
  title: string;
  details: string;
  date: string;
  country: string;
  city: string;
  status: string;
  expectedParticipants: number;
  organizationID: string;
  organization?: { name: string; email: string };
  _count?: { partners: number };
}

interface CorpMatch {
  eventID: string;
  name: string;
  score: number;
  aiReasoning: string;
}

interface EventWithScore extends PublicEvent {
  fitScore: number | null;
}

const API = "http://localhost:3000";
const eventImages = [eventTechImg, eventNetworkImg, eventCareerImg];

/* ── Page Component ────────────────────────────────────────────── */
export const EventForumPage = () => {
  const [userID, setUserID] = useState<string | null>(null);
  const [events, setEvents] = useState<EventWithScore[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [applyingIds, setApplyingIds] = useState<Set<string>>(new Set());

  const filterOptions = ["Technology", "Under $5k", "Education", "Business"];

  /* Fetch user */
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

  /* Fetch events + match scores */
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Get all public events
        const eventsRes = await fetch(`${API}/events`, { credentials: "include" });
        const eventsData = await eventsRes.json();
        const allEvents: PublicEvent[] = eventsData.success ? eventsData.data || [] : [];

        // Get corp match scores if we have userID
        let matchMap = new Map<string, number>();
        if (userID) {
          try {
            const matchRes = await fetch(`${API}/corp/${userID}/matches`, {
              credentials: "include",
            });
            const matchData = await matchRes.json();
            const matches: CorpMatch[] = Array.isArray(matchData) ? matchData : matchData.data || [];
            matches.forEach((m) => matchMap.set(m.eventID, m.score));
          } catch {
            /* corp matches not available */
          }
        }

        const eventsWithScores: EventWithScore[] = allEvents.map((event) => ({
          ...event,
          fitScore: matchMap.get(event.id) ?? null,
        }));

        setEvents(eventsWithScores);
        setFilteredEvents(eventsWithScores);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [userID]);

  /* Search + filter logic */
  useEffect(() => {
    let result = [...events];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.details?.toLowerCase().includes(q) ||
          e.organization?.name?.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q)
      );
    }

    // Client-side filter (limited to text matching since we don't have categories in API)
    if (activeFilters.length > 0) {
      result = result.filter((e) => {
        const text = `${e.title} ${e.details} ${e.organization?.name || ""}`.toLowerCase();
        return activeFilters.some((f) => text.includes(f.toLowerCase()));
      });
    }

    setFilteredEvents(result);
  }, [searchQuery, activeFilters, events]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  /* Apply for partnership */
  const handleApply = async (eventID: string) => {
    if (!userID) return;
    setApplyingIds((prev) => new Set(prev).add(eventID));
    try {
      await fetch(`${API}/partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID, corporationID: userID }),
      });
    } catch (err) {
      console.error("Failed to apply:", err);
    } finally {
      setApplyingIds((prev) => {
        const next = new Set(prev);
        next.delete(eventID);
        return next;
      });
    }
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 mb-2">Event Forum</h1>
              <p className="text-gray-500">
                Discover and partner with high-impact student organizations.
              </p>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </button>
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    activeFilters.includes(filter)
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-8">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events, organizations, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Event Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[420px] rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
              <p className="text-gray-400 text-lg">No events found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="event-card group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col"
                >
                  {/* Colored top accent */}
                  <div className={`h-1 ${
                    event.status === "active" ? "bg-green-500"
                      : event.status === "completed" ? "bg-gray-400"
                      : "bg-amber-400"
                  }`} />

                  {/* Card top section */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <StatusPill status={event.status} className="mb-2" />
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {event.organization?.name || "Student Organization"}
                        </p>
                      </div>
                      {event.fitScore !== null && (
                        <div className="shrink-0 ml-3">
                          <ScoreBadge score={event.fitScore} size="md" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event image */}
                  <div className="px-5 mb-3">
                    <div className="h-36 rounded-xl overflow-hidden">
                      <img
                        src={eventImages[index % eventImages.length]}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="px-5 pb-5 flex-1 flex flex-col">
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{event.details?.slice(0, 40) || "General"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                        Sponsorship Target
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.city}{event.country ? `, ${event.country}` : ""}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApply(event.id)}
                      disabled={applyingIds.has(event.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a2e4a] text-white text-sm font-semibold hover:bg-[#243b5e] transition-all shadow-sm disabled:opacity-60"
                    >
                      {applyingIds.has(event.id) ? "Applying..." : "Apply for Partnership"}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
