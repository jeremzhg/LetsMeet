import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { StatusDropdown } from "../components/fields/StatusDropdown";
import { StatusPill } from "../components/shared/StatusPill";
import { getInitials } from "../utils/image";

interface PartnerItem {
  eventID: string;
  corporationID: string;
  status: "pending" | "accepted" | "rejected";
  packageID: string | null;
  package?: {
    id: string;
    title: string;
    cost: number;
  } | null;
  event: {
    id: string;
    title: string;
    date: string;
    status: string;
    city: string;
    country: string;
    packages?: Array<{
      id: string;
      title: string;
      cost: number;
    }>;
  };
  corporation: {
    id: string;
    name: string;
    email: string;
    details: string;
    category: string;
    isClaimed?: boolean;
  };
}

type PartnerStatusFilter = "all" | "pending" | "accepted" | "rejected";

const API = "http://localhost:3000";

export const OrgInboxPage = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [eventQuery, setEventQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerStatusFilter>("all");

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);

      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        const user = meData?.user;
        const isOrg = user?.role === "org" || user?.role === "organization";

        if (!user || !isOrg) {
          navigate("/login", { replace: true });
          return;
        }

        const partnersRes = await fetch(`${API}/partners`, { credentials: "include" });
        const partnersData = await partnersRes.json();

        if (partnersData?.success) {
          setPartners(partnersData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch organization inbox:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [navigate]);

  const updatePartner = async (
    eventID: string,
    corporationID: string,
    updates: {
      status?: "pending" | "accepted" | "rejected";
      packageID?: string | null;
    }
  ) => {
    const id = `${eventID}:${corporationID}`;
    setUpdating((prev) => new Set(prev).add(id));

    try {
      const res = await fetch(`${API}/partners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventID, corporationID, ...updates }),
      });

      if (res.ok) {
        setPartners((prev) =>
          prev.map((partner) => {
            if (partner.eventID !== eventID || partner.corporationID !== corporationID) {
              return partner;
            }

            const nextPackageID =
              updates.packageID !== undefined ? updates.packageID : partner.packageID;
            const nextPackage =
              updates.packageID !== undefined
                ? partner.event.packages?.find((pkg) => pkg.id === updates.packageID) || null
                : partner.package || null;

            return {
              ...partner,
              ...(updates.status ? { status: updates.status } : {}),
              ...(updates.packageID !== undefined
                ? {
                    packageID: nextPackageID,
                    package: nextPackage,
                  }
                : {}),
            };
          })
        );
      }
    } catch (error) {
      console.error("Failed to update partner:", error);
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const visiblePartners = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const normalizedEventQuery = eventQuery.trim().toLowerCase();

    return partners
      .filter((partner) => {
        if (statusFilter === "all") return true;
        return partner.status === statusFilter;
      })
      .filter((partner) => {
        if (!normalizedEventQuery) return true;
        return partner.event.title.toLowerCase().includes(normalizedEventQuery);
      })
      .filter((partner) => {
        if (!query) return true;

        const text = [
          partner.corporation.name,
          partner.corporation.email,
          partner.corporation.category,
          partner.event.title,
          partner.event.city,
          partner.event.country,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      })
      .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
  }, [partners, searchQuery, eventQuery, statusFilter]);

  const eventOptions = useMemo(() => {
    return Array.from(new Set(partners.map((partner) => partner.event.title).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [partners]);

  const statusCounts = useMemo(() => {
    return {
      all: partners.length,
      pending: partners.filter((partner) => partner.status === "pending").length,
      accepted: partners.filter((partner) => partner.status === "accepted").length,
      rejected: partners.filter((partner) => partner.status === "rejected").length,
    };
  }, [partners]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const getPackageLabel = (partner: PartnerItem) => {
    if (partner.package?.title) {
      return partner.package.cost ? `${partner.package.title} (${formatCurrency(partner.package.cost)})` : partner.package.title;
    }

    if (!partner.packageID) {
      return "No package selected";
    }

    const packageFromEvent = partner.event.packages?.find((pkg) => pkg.id === partner.packageID);
    if (packageFromEvent) {
      return packageFromEvent.cost
        ? `${packageFromEvent.title} (${formatCurrency(packageFromEvent.cost)})`
        : packageFromEvent.title;
    }

    return `Package ${partner.packageID.slice(0, 8)}`;
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />

        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-900">Partnership Inbox</h1>
            <p className="mt-2 text-gray-500 max-w-2xl leading-relaxed">
              Manage all incoming and active partnerships across your events. Each item includes the related event so
              your team can review and update status quickly.
            </p>
          </div>

          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid w-full gap-3 lg:max-w-2xl lg:grid-cols-2">
                <div className="relative w-full">
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
                    placeholder="Search corporation, email, category"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-300"
                  />
                </div>

                <div className="relative w-full">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="text"
                    list="org-inbox-event-options"
                    value={eventQuery}
                    onChange={(event) => setEventQuery(event.target.value)}
                    placeholder="Filter by event"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-300"
                  />
                  <datalist id="org-inbox-event-options">
                    {eventOptions.map((title) => (
                      <option key={title} value={title} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  { value: "all", label: `All (${statusCounts.all})` },
                  { value: "pending", label: `Pending (${statusCounts.pending})` },
                  { value: "accepted", label: `Accepted (${statusCounts.accepted})` },
                  { value: "rejected", label: `Rejected (${statusCounts.rejected})` },
                ] as { value: PartnerStatusFilter; label: string }[]).map((option) => {
                  const active = statusFilter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatusFilter(option.value)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-60 rounded-2xl border border-gray-100 bg-white animate-pulse" />
              ))}
            </div>
          ) : visiblePartners.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">No partnerships found</h3>
              <p className="text-gray-500">Try adjusting your search or status filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {visiblePartners.map((partner) => {
                const itemId = `${partner.eventID}:${partner.corporationID}`;
                const isUpdating = updating.has(itemId);

                return (
                  <article
                    key={itemId}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white">
                          {getInitials(partner.corporation.name, 2)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-gray-900">{partner.corporation.name}</h3>
                          <p className="truncate text-xs text-gray-500">{partner.corporation.email}</p>
                        </div>
                      </div>

                      <StatusPill status={partner.status} />
                    </div>

                    <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Event</p>
                      <Link
                        to={`/org/events/${partner.eventID}`}
                        className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-blue-700"
                      >
                        {partner.event.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-600">
                        {formatDate(partner.event.date)} • {partner.event.city}, {partner.event.country}
                      </p>
                    </div>

                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        {partner.corporation.category || "General"}
                      </span>

                      <StatusDropdown
                        value={partner.status}
                        size="sm"
                        disabled={isUpdating}
                        onChange={(next) =>
                          updatePartner(partner.eventID, partner.corporationID, {
                            status: next as "pending" | "accepted" | "rejected",
                          })
                        }
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "accepted", label: "Accepted" },
                          { value: "rejected", label: "Rejected" },
                        ]}
                      />
                    </div>

                    <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1">Sponsorship Package</p>
                      <p className="line-clamp-1 text-sm font-semibold text-amber-900 mb-2">{getPackageLabel(partner)}</p>
                      <select
                        value={partner.packageID || ""}
                        disabled={isUpdating || !partner.event.packages?.length}
                        onChange={(event) =>
                          updatePartner(partner.eventID, partner.corporationID, {
                            packageID: event.target.value || null,
                          })
                        }
                        className="w-full rounded-lg border border-amber-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">No package selected</option>
                        {(partner.event.packages || []).map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.title} ({formatCurrency(pkg.cost)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {partner.corporation.details || "No corporation details available."}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
