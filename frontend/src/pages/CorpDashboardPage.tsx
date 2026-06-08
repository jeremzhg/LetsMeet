import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { useSession } from "../context/SessionContext";

interface CorpGeneralMatch {
  corporationID: string;
  organizationID: string;
  matchScore: number;
  organization: {
    name: string;
    email: string;
  };
}

interface CorpEventMatch {
  eventID: string;
  score: number;
  event: {
    id: string;
    title: string;
    city: string;
    country: string;
    date: string;
    organization: {
      name: string;
    };
  };
}

interface PartnerItem {
  eventID: string;
  corporationID: string;
  status: "pending" | "accepted" | "rejected";
  event?: {
    title: string;
  };
}

import { API } from "../config";

export const CorpDashboardPage = () => {
  const { user, profile } = useSession();
  const corpID = user?.role === "corporation" ? user.id : null;
  const corpName = profile?.name || "Corporation";
  const [loading, setLoading] = useState(true);
  const [orgMatches, setOrgMatches] = useState<CorpGeneralMatch[]>([]);
  const [eventMatches, setEventMatches] = useState<CorpEventMatch[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);

  useEffect(() => {
    if (!corpID) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgRes, eventRes, partnerRes] = await Promise.all([
          fetch(`${API}/matches/general/corp/${corpID}`, { credentials: "include" }),
          fetch(`${API}/matches/corp/${corpID}/events`, { credentials: "include" }),
          fetch(`${API}/partners`, { credentials: "include" }),
        ]);

        const [orgData, eventData, partnerData] = await Promise.all([
          orgRes.json(),
          eventRes.json(),
          partnerRes.json(),
        ]);

        if (orgData?.success) setOrgMatches(orgData.data || []);
        if (eventData?.success) setEventMatches(eventData.data || []);
        if (partnerData?.success) setPartners(partnerData.data || []);
      } catch (error) {
        console.error("Failed to load corporation dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [corpID]);

  const stats = useMemo(() => {
    const accepted = partners.filter((p) => p.status === "accepted").length;
    const pending = partners.filter((p) => p.status === "pending").length;

    return {
      orgMatches: orgMatches.length,
      eventMatches: eventMatches.length,
      accepted,
      pending,
    };
  }, [orgMatches, eventMatches, partners]);

  const pendingPartners = partners
  .filter((p) => p.status === "pending")
  .slice(0, 3);

  const topOrg = orgMatches[0];
  const topEvent = eventMatches[0];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-dashboard" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />

        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {corpName}</h1>
              <p className="mt-1 text-gray-500">Track your best-fit opportunities and active sponsorship pipeline.</p>
            </div>
          </div>

          <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Org Matches</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats.orgMatches}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Event Matches</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats.eventMatches}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Accepted Partnerships</p>
              <p className="mt-2 text-2xl font-bold text-green-700">{stats.accepted}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pending Partnerships</p>
              <p className="mt-2 text-2xl font-bold text-amber-700">{stats.pending}</p>
            </div>
          </div>

          <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Partnerships</h2>
              <Link to="/corp/partnerships" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Manage
              </Link>
            </div>

            {pendingPartners.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-3">
                  {stats.pending} Pending Response{stats.pending !== 1 ? "s" : ""}
                </p>
                {pendingPartners.map((partner) => (
                  <Link
                    key={`${partner.eventID}:${partner.corporationID}`}
                    to="/corp/partnerships"
                    className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 hover:border-amber-200 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {partner.event?.title || partner.eventID}
                    </span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </Link>
                ))}
                {stats.pending > 3 && (
                  <Link
                    to="/corp/partnerships"
                    className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700 pt-1"
                  >
                    +{stats.pending - 3} more pending
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                You have {partners.length} total partnerships. No pending responses.
              </p>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Top Organization Match</h2>
                <Link to="/corp/organizations" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>

              {topOrg ? (
                <>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">{topOrg.organization.name}</p>
                      <p className="text-xs text-gray-500">{topOrg.organization.email}</p>
                    </div>
                    <ScoreBadge score={topOrg.matchScore} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600">Best current fit based on profile alignment.</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No organization matches available yet.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Top Event Match</h2>
                <Link to="/corp/events" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>

              {topEvent ? (
                <>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">{topEvent.event.title}</p>
                      <p className="text-xs text-gray-500">{topEvent.event.organization?.name || "Organization"}</p>
                    </div>
                    <ScoreBadge score={topEvent.score} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {topEvent.event.city}, {topEvent.event.country}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No event match scores available yet.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
