import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { StatusDropdown } from "../components/fields/StatusDropdown";
import { StatusPill } from "../components/shared/StatusPill";
import { toAbsoluteImageUrl } from "../utils/image";

import eventTechImg from "../assets/images/event-tech-conference.png";
import eventNetworkImg from "../assets/images/event-networking.png";
import eventCareerImg from "../assets/images/event-career-fair.png";

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
  venue?: string;
  imagePath?: string | null;
  status: string;
  expectedParticipants: number;
  targetSponsorValue?: number;
  packages?: EventPackage[];
  _count?: { partners: number };
}

interface EventCardData extends OrgEvent {
  targetAmount: number;
  securedAmount: number;
  progress: number;
}

type EventStatus = "pending" | "active" | "completed";

const API = "http://localhost:3000";

const getEventPriority = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "pending") return 0;
  if (normalized === "ongoing" || normalized === "active") return 1;
  if (normalized === "completed") return 3;
  return 2;
};

const normalizeEventStatus = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "ongoing") return "ongoing";
  if (normalized === "completed") return "completed";
  return "pending";
};

const eventImages = [eventTechImg, eventNetworkImg, eventCareerImg];

export const OrgAllEventsPage = () => {
  const navigate = useNavigate();
  const [userID, setUserID] = useState<string | null>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingEventStatus, setUpdatingEventStatus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { credentials: "include" });
        const data = await res.json();
        const role = data?.user?.role;
        const isOrgRole = role === "org" || role === "organization";

        if (isOrgRole) {
          setUserID(data.user.id);
        } else {
          setUserID(null);
          setEvents([]);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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
            const targetAmount = Math.max(0, Number(event.targetSponsorValue || 0));
            let securedAmount = 0;

            try {
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

  const groupedEvents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = [...events]
      .filter((event) => {
        if (!normalizedQuery) return true;

        const searchableText = [
          event.title,
          event.details,
          event.city,
          event.country,
          event.venue || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const priorityDiff = getEventPriority(a.status) - getEventPriority(b.status);
        if (priorityDiff !== 0) return priorityDiff;

        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    return {
      pending: filtered.filter((event) => normalizeEventStatus(event.status) === "pending"),
      ongoing: filtered.filter((event) => normalizeEventStatus(event.status) === "ongoing"),
      completed: filtered.filter((event) => normalizeEventStatus(event.status) === "completed"),
    };
  }, [events, searchQuery]);

  const totalFilteredCount =
    groupedEvents.pending.length + groupedEvents.ongoing.length + groupedEvents.completed.length;

  const handleUpdateEventStatus = async (eventID: string, status: EventStatus) => {
    setUpdatingEventStatus((prev) => new Set(prev).add(eventID));
    try {
      const res = await fetch(`${API}/org/events/${eventID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Failed to update event status");
      }

      setEvents((prev) =>
        prev.map((event) => (event.id === eventID ? { ...event, status } : event))
      );
    } catch (err) {
      console.error("Failed to update event status:", err);
    } finally {
      setUpdatingEventStatus((prev) => {
        const next = new Set(prev);
        next.delete(eventID);
        return next;
      });
    }
  };

  const shouldIgnoreCardNavigation = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;

    return Boolean(target.closest("a, button, input, select, textarea, label"));
  };

  const handleCardNavigation = (eventID: string, target: EventTarget | null) => {
    if (shouldIgnoreCardNavigation(target)) return;
    navigate(`/org/events/${eventID}`);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Events</h1>
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

          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title, details, city, country, or venue"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-300"
                />
              </div>
            </div>
          </div>

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
          ) : totalFilteredCount === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">No matching events</h3>
              <p className="text-gray-500">Try adjusting your search.</p>
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
                          No {section.label.toLowerCase()} events yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {sectionEvents.map((event, index) => (
                            <div
                              key={event.id}
                              role="button"
                              tabIndex={0}
                              onClick={(e) => handleCardNavigation(event.id, e.target)}
                              onKeyDown={(e) => {
                                if (e.key !== "Enter" && e.key !== " ") return;
                                e.preventDefault();
                                handleCardNavigation(event.id, e.target);
                              }}
                              className="event-card group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300"
                            >
                              <div className="relative h-40 overflow-hidden">
                                <img
                                  src={
                                    toAbsoluteImageUrl(event.imagePath) ||
                                    eventImages[index % eventImages.length]
                                  }
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                <div className="absolute top-3 right-3">
                                  <StatusPill status={event.status} />
                                </div>
                                <div
                                  className={`absolute top-0 left-0 right-0 h-1 ${
                                    event.status === "active"
                                      ? "bg-green-500"
                                      : event.status === "completed"
                                        ? "bg-gray-400"
                                        : "bg-amber-400"
                                  }`}
                                />
                              </div>

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
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5V4H2v16h5m10 0v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6m10 0H7" />
                                    </svg>
                                    {event.expectedParticipants.toLocaleString()} participants
                                  </div>
                                </div>

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
                                      <span
                                        className={`text-xs font-bold ${
                                          event.progress >= 75
                                            ? "text-blue-600"
                                            : event.progress >= 40
                                              ? "text-amber-500"
                                              : "text-gray-500"
                                        }`}
                                      >
                                        {event.progress}%
                                      </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ${
                                          event.progress >= 75
                                            ? "bg-blue-600"
                                            : event.progress >= 40
                                              ? "bg-amber-400"
                                              : "bg-gray-300"
                                        }`}
                                        style={{ width: `${Math.min(event.progress, 100)}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-400">Secured</span>
                                      <span className="font-semibold text-green-600">
                                        ${event.securedAmount.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4">
                                  <StatusDropdown
                                    value={event.status}
                                    disabled={updatingEventStatus.has(event.id)}
                                    onChange={(next) =>
                                      handleUpdateEventStatus(event.id, next as EventStatus)
                                    }
                                    options={[
                                      { value: "pending", label: "Pending" },
                                      { value: "active", label: "Ongoing" },
                                      { value: "completed", label: "Completed" },
                                    ]}
                                  />
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
