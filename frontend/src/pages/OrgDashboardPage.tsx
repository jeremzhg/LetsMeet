import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { StatusDropdown } from "../components/fields/StatusDropdown";
import { StatusPill } from "../components/shared/StatusPill";
import { ScoreBadge } from "../components/shared/ScoreBadge";

/* ── Types ─────────────────────────────────────────────────────── */
interface OrgEvent {
  id: string;
  title: string;
  details: string;
  date: string;
  venue?: string;
  targetSponsorValue?: number;
  status: string;
  _count?: { partners: number };
}

interface EventPackage {
  id: string;
  title: string;
  cost: number;
}

interface Partner {
  eventID: string;
  corporationID: string;
  status: string;
  packageID: string | null;
  event?: { id: string; title: string; date: string };
  corporation?: {
    id: string;
    name: string;
    email: string;
    category: string;
    details?: string;
  };
  package?: { title: string; cost: number } | null;
}

interface MatchedCorp {
  eventID: string;
  corporationID: string;
  score: number;
  reasoning: string;
  corporation: {
    name: string;
    email?: string;
    category?: string;
    details?: string;
  };
}

const API = "http://localhost:3000";

/* ── Page Component ────────────────────────────────────────────── */
export const OrgDashboardPage = () => {
  const [orgName, setOrgName] = useState("Organization");
  const [userID, setUserID] = useState<string | null>(null);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [incomingOffers, setIncomingOffers] = useState<Partner[]>([]);
  const [recommendedSponsors, setRecommendedSponsors] = useState<MatchedCorp[]>([]);
  const [offerPackageOptions, setOfferPackageOptions] = useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const [loading, setLoading] = useState(true);

  /* Fetch user info */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.user) {
          setUserID(data.user.id);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  /* Fetch events once we have userID */
  useEffect(() => {
    if (!userID) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch org events
        const eventsRes = await fetch(`${API}/org/${userID}/events`, { credentials: "include" });
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          setEvents(eventsData.data || []);
          // Use org name from the first event's organization field if available
          if (eventsData.data?.[0]?.organization?.name) {
            setOrgName(eventsData.data[0].organization.name);
          }
        }

        // Fetch incoming partnership offers (pending ones for org)
        const partnersRes = await fetch(`${API}/partners`, { credentials: "include" });
        const partnersData = await partnersRes.json();
        if (partnersData.success) {
          setIncomingOffers(
            (partnersData.data || []).filter((p: Partner) => p.status === "pending")
          );

          const uniqueEventIDs = Array.from(
            new Set((partnersData.data || []).map((p: Partner) => p.eventID).filter(Boolean))
          ) as string[];

          const packageEntries = await Promise.all(
            uniqueEventIDs.map(async (eventID) => {
              try {
                const eventRes = await fetch(`${API}/org/events/${eventID}`, {
                  credentials: "include",
                });
                const eventData = await eventRes.json();
                const eventDetail = eventData?.data || eventData;
                const packages = (eventDetail?.packages || []) as EventPackage[];
                const options: { value: string; label: string }[] = [
                  { value: "__none__", label: "No package" },
                  ...packages.map((pkg) => ({
                    value: pkg.id,
                    label: `${pkg.title} ($${pkg.cost.toLocaleString()})`,
                  })),
                ];

                return [eventID, options] as [string, { value: string; label: string }[]];
              } catch {
                return [
                  eventID,
                  [{ value: "__none__", label: "No package" }],
                ] as [string, { value: string; label: string }[]];
              }
            })
          );

          setOfferPackageOptions(Object.fromEntries(packageEntries));
        }

        // Fetch recommended sponsors for the first active event
        const activeEvent = (eventsData.data || []).find(
          (e: OrgEvent) => e.status === "active" || e.status === "pending"
        );
        if (activeEvent) {
          const matchRes = await fetch(`${API}/matches/${activeEvent.id}`, {
            credentials: "include",
          });
          const matchData = await matchRes.json();
          if (matchData.success) {
            setRecommendedSponsors((matchData.data || []).slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userID]);

  /* Partnership actions */
  const handlePartnerAction = async (
    eventID: string,
    corporationID: string,
    status: "pending" | "accepted" | "rejected"
  ) => {
    try {
      await fetch(`${API}/partners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID, corporationID, status }),
      });

      if (status === "rejected") {
        setIncomingOffers((prev) =>
          prev.filter(
            (p) => !(p.eventID === eventID && p.corporationID === corporationID)
          )
        );
        return;
      }

      setIncomingOffers((prev) =>
        prev.map((p) =>
          p.eventID === eventID && p.corporationID === corporationID
            ? { ...p, status }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to update partner:", err);
    }
  };

  const handleUpdateOfferPackage = async (
    eventID: string,
    corporationID: string,
    packageID: string | null
  ) => {
    try {
      await fetch(`${API}/partners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID, corporationID, packageID }),
      });

      setIncomingOffers((prev) =>
        prev.map((p) => {
          if (!(p.eventID === eventID && p.corporationID === corporationID)) {
            return p;
          }

          return {
            ...p,
            packageID,
          };
        })
      );
    } catch (err) {
      console.error("Failed to update partner package:", err);
    }
  };

  const handleMarkOfferDone = (eventID: string, corporationID: string) => {
    setIncomingOffers((prev) =>
      prev.filter((p) => !(p.eventID === eventID && p.corporationID === corporationID))
    );
  };

  const handleRequestPartnership = async (corporationID: string, eventID: string) => {
    try {
      await fetch(`${API}/partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID, corporationID }),
      });
      // Remove from recommended after requesting
      setRecommendedSponsors((prev) =>
        prev.filter((s) => s.corporationID !== corporationID)
      );
    } catch (err) {
      console.error("Failed to request partnership:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  const getOfferPackageLabel = (offer: Partner) => {
    if (!offer.packageID) return "No package";

    const selected = (offerPackageOptions[offer.eventID] || []).find(
      (opt) => opt.value === offer.packageID
    );

    return selected?.label || offer.package?.title || "Selected package";
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                Welcome Back, {orgName}
              </h1>
              <p className="text-gray-500 mt-1">
                Here is an overview of your active partnerships and upcoming events.
              </p>
            </div>
            <Link
              to="/org/profile"
              className="shrink-0 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              View Public Profile
            </Link>
          </div>

          <div className="flex gap-6">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              {/* ── Your Event Overview ─────────────────────── */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Your Event Overview</h2>
                  <Link
                    to="/org/events"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View Your Events
                  </Link>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-48 rounded-2xl bg-white border border-gray-100 animate-pulse"
                      />
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
                    <p className="text-gray-400">No events yet. Create your first event!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.slice(0, 4).map((event) => (
                      <div
                        key={event.id}
                        className="event-card group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Left accent */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          event.status === "active" ? "bg-green-500" : "bg-blue-400"
                        }`} />

                        <div className="flex items-center justify-between mb-3">
                          <StatusPill status={event.status} />
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(event.date)}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-blue-700 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                          {truncate(event.details || "", 80)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {/* Partner avatar placeholders */}
                            {(event._count?.partners ?? 0) > 0 && (
                              <>
                                <div className="w-7 h-7 rounded-full bg-gray-300 border-2 border-white" />
                                <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-white -ml-2" />
                                {(event._count?.partners ?? 0) > 2 && (
                                  <span className="ml-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                                    +{(event._count?.partners ?? 0) - 2}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          {(event._count?.partners ?? 0) > 0 ? (
                            <Link
                              to={`/org/events/${event.id}`}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                            >
                              Manage Sponsors
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">Needs Sponsors</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Incoming Sponsorship Offers ─────────────── */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Ongoing Sponsorship Offers
                </h2>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 rounded-2xl bg-white border border-gray-100 animate-pulse"
                      />
                    ))}
                  </div>
                ) : incomingOffers.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
                    <p className="text-gray-400">No incoming offers at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingOffers.map((offer) => (
                      <div
                        key={`${offer.eventID}-${offer.corporationID}`}
                        className="offer-card flex items-start gap-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                      >
                        {/* Corp logo placeholder */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                          CORP
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900">
                            {offer.corporation?.name || "Unknown Corporation"}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {offer.packageID
                              ? `${getOfferPackageLabel(offer)} for "${offer.event?.title || "Event"}"`
                              : `Requested details for "${offer.event?.title || "Event"}"`}
                          </p>
                        </div>

                        <div className="w-40 shrink-0 space-y-2">
                          <StatusDropdown
                            size="sm"
                            className="w-full"
                            value={offer.status}
                            onChange={(next) =>
                              handlePartnerAction(
                                offer.eventID,
                                offer.corporationID,
                                next as "pending" | "accepted" | "rejected"
                              )
                            }
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "accepted", label: "Accepted" },
                              { value: "rejected", label: "Rejected" },
                            ]}
                          />

                          <StatusDropdown
                            size="sm"
                            className="w-full"
                            value={offer.packageID || "__none__"}
                            onChange={(next) =>
                              handleUpdateOfferPackage(
                                offer.eventID,
                                offer.corporationID,
                                next === "__none__" ? null : next
                              )
                            }
                            options={offerPackageOptions[offer.eventID] || [{ value: "__none__", label: "No package" }]}
                          />

                          {offer.status === "accepted" && (
                            <button
                              onClick={() => handleMarkOfferDone(offer.eventID, offer.corporationID)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column — Recommended Sponsors ──────── */}
            <div className="w-72 shrink-0">
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm sticky top-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    Recommended Sponsors
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors" title="How are sponsors recommended?">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 rounded-xl bg-gray-50 animate-pulse" />
                    ))}
                  </div>
                ) : recommendedSponsors.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Create an event to get sponsor recommendations
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recommendedSponsors.map((sponsor) => (
                      <div
                        key={sponsor.corporationID}
                        className="sponsor-card rounded-xl border border-gray-100 p-4 hover:border-blue-100 hover:shadow-sm transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">
                              {sponsor.corporation.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {sponsor.corporation.category || "General"}
                            </p>
                            {sponsor.corporation.email && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {sponsor.corporation.email}
                              </p>
                            )}
                          </div>
                          <ScoreBadge score={sponsor.score} size="sm" />
                        </div>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                          {truncate(sponsor.reasoning || sponsor.corporation.details || "", 90)}
                        </p>
                        <button
                          onClick={() =>
                            handleRequestPartnership(
                              sponsor.corporationID,
                              sponsor.eventID
                            )
                          }
                          className="w-full py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                          Request Partnership
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to="/org/corporations"
                  className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-5 transition-colors"
                >
                  Browse Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
