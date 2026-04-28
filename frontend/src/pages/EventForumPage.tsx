import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { StatusPill } from "../components/shared/StatusPill";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { toAbsoluteImageUrl } from "../utils/image";

import eventTechImg from "../assets/images/event-tech-conference.png";
import eventNetworkImg from "../assets/images/event-networking.png";
import eventCareerImg from "../assets/images/event-career-fair.png";

interface PublicEvent {
  id: string;
  title: string;
  details: string;
  date: string;
  country: string;
  city: string;
  imagePath?: string | null;
  status: string;
  expectedParticipants: number;
  organizationID: string;
  organization?: { name: string; email: string };
  _count?: { partners: number };
}

interface CorpMatch {
  eventID: string;
  score: number;
  reasoning?: string;
  event: PublicEvent;
}

interface EventWithScore extends PublicEvent {
  fitScore: number;
  reasoning?: string;
}

const API = "http://localhost:3000";
const eventImages = [eventTechImg, eventNetworkImg, eventCareerImg];

const normalizeEventStatus = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "ongoing") return "ongoing";
  if (normalized === "completed") return "completed";
  return "pending";
};

export const EventForumPage = () => {
  const [userID, setUserID] = useState<string | null>(null);
  const [events, setEvents] = useState<EventWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [applyingIds, setApplyingIds] = useState<Set<string>>(new Set());

  const filterOptions = ["Technology", "Under $5k", "Education", "Business"];

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

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsRes = await fetch(`${API}/events`, { credentials: "include" });
        const eventsData = await eventsRes.json();
        const allEvents: PublicEvent[] = eventsData.success ? eventsData.data || [] : [];

        let matchMap = new Map<string, number>();
        let reasoningMap = new Map<string, string>();
        if (userID) {
          try {
            const matchRes = await fetch(`${API}/matches/corp/${userID}/events`, {
              credentials: "include",
            });
            const matchData = await matchRes.json();
            const matches: CorpMatch[] = matchData?.success ? matchData.data || [] : [];
            matches.forEach((m) => {
              matchMap.set(m.eventID, m.score);
              if (m.reasoning) reasoningMap.set(m.eventID, m.reasoning);
            });
          } catch {
          }
        }

        const eventsWithScores: EventWithScore[] = allEvents
          .map((event) => ({
            ...event,
            fitScore: matchMap.get(event.id) ?? 0,
            reasoning: reasoningMap.get(event.id),
          }))
          .sort((a, b) => b.fitScore - a.fitScore);

        setEvents(eventsWithScores);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [userID]);

  const filteredEvents = useMemo(() => {
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

    if (activeFilters.length > 0) {
      result = result.filter((e) => {
        const text = `${e.title} ${e.details} ${e.organization?.name || ""}`.toLowerCase();
        return activeFilters.some((f) => text.includes(f.toLowerCase()));
      });
    }

    return result;
  }, [searchQuery, activeFilters, events]);

  const groupedEvents = useMemo(() => {
    return {
      pending: filteredEvents.filter((event) => normalizeEventStatus(event.status) === "pending"),
      ongoing: filteredEvents.filter((event) => normalizeEventStatus(event.status) === "ongoing"),
      completed: filteredEvents.filter((event) => normalizeEventStatus(event.status) === "completed"),
    };
  }, [filteredEvents]);

  const totalFilteredCount =
    groupedEvents.pending.length + groupedEvents.ongoing.length + groupedEvents.completed.length;

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

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
    } catch (error) {
      console.error("Failed to apply for partnership:", error);
    } finally {
      setApplyingIds((prev) => {
        const next = new Set(prev);
        next.delete(eventID);
        return next;
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
              <p className="text-gray-500 max-w-xl leading-relaxed">
                Browse organization events with AI-ranked fit scores and apply for partnerships
                that align with your corporation goals.
              </p>
            </div>
          </div>

          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search events, organizers, cities"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-300"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => {
                  const active = activeFilters.includes(filter);

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => toggleFilter(filter)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-96 rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">No events available</h3>
              <p className="text-gray-500">Check back soon for new opportunities.</p>
            </div>
          ) : totalFilteredCount === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">No matching events</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {([
                { key: "pending", label: "Pending" },
                { key: "ongoing", label: "Ongoing" },
                { key: "completed", label: "Completed" },
              ] as { key: "pending" | "ongoing" | "completed"; label: string }[]).map(
                (section) => {
                  const sectionEvents = groupedEvents[section.key];

                  return (
                    <section key={section.key}>
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">{section.label} Events</h2>
                        <span className="text-sm text-gray-400">{sectionEvents.length} total</span>
                      </div>

                      {sectionEvents.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
                          No {section.label.toLowerCase()} events at the moment.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {sectionEvents.map((event, index) => (
                            <div
                              key={event.id}
                              className="event-card group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col"
                            >
                              <div
                                className={`h-1 ${
                                  event.status === "active"
                                    ? "bg-green-500"
                                    : event.status === "completed"
                                      ? "bg-gray-400"
                                      : "bg-amber-400"
                                }`}
                              />

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
                                  <div className="shrink-0 ml-3">
                                    <ScoreBadge score={event.fitScore} size="md" />
                                  </div>
                                </div>
                              </div>

                              <div className="px-5 mb-3">
                                <div className="h-36 rounded-xl overflow-hidden">
                                  <img
                                    src={
                                      toAbsoluteImageUrl(event.imagePath) ||
                                      eventImages[index % eventImages.length]
                                    }
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              </div>

                              <div className="px-5 pb-5 flex-1 flex flex-col">
                                <div className="space-y-2 mb-4 flex-1">
                                  <p className="line-clamp-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-xs leading-relaxed text-slate-700">
                                    {event.reasoning ||
                                      "Fit score generated from your corporation profile and this event's sponsor requirements."}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5V4H2v16h5m10 0v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6m10 0H7" />
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

                                <div className="grid grid-cols-2 gap-2">
                                  <Link
                                    to={`/events/${event.id}`}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
                                  >
                                    View Details
                                  </Link>

                                  <button
                                    onClick={() => handleApply(event.id)}
                                    disabled={applyingIds.has(event.id)}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a2e4a] text-white text-sm font-semibold hover:bg-[#243b5e] transition-all shadow-sm disabled:opacity-60"
                                  >
                                    {applyingIds.has(event.id) ? "Applying..." : "Apply"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                }
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
