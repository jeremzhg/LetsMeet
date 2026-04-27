import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { getInitials } from "../utils/image";

interface GeneralMatchItem {
  corporationID: string;
  organizationID: string;
  matchScore: number;
  reasoning: string;
  corporation: {
    id: string;
    name: string;
    email: string;
    details: string;
    category: string;
  };
}

type ScoreFilter = "all" | "high" | "medium" | "low";

const API = "http://localhost:3000";

const isOrgRole = (role?: string) => role === "org" || role === "organization";

const scoreFilterMatches = (score: number, filter: ScoreFilter) => {
  if (filter === "all") return true;
  if (filter === "high") return score >= 85;
  if (filter === "medium") return score >= 70 && score < 85;
  return score < 70;
};

const scoreTone = (score: number) => {
  if (score >= 85) {
    return {
      badge: "bg-green-50 text-green-700 border-green-100",
      label: "High Fit(85+)",
    };
  }

  if (score >= 70) {
    return {
      badge: "bg-amber-50 text-amber-700 border-amber-100",
      label: "Good Fit(70-84)",
    };
  }

  return {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Low Fit(<70)",
  };
};

export const OrgCorporationsPage = () => {
  const navigate = useNavigate();
  const [organizationID, setOrganizationID] = useState<string | null>(null);
  const [matches, setMatches] = useState<GeneralMatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");

  useEffect(() => {
    const initializeAndFetch = async () => {
      setLoading(true);
      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        const user = meData?.user;

        if (!user || !isOrgRole(user.role)) {
          navigate("/login", { replace: true });
          return;
        }

        setOrganizationID(user.id);

        const matchesRes = await fetch(`${API}/matches/general/org/${user.id}`, {
          credentials: "include",
        });
        const matchesData = await matchesRes.json();

        if (matchesData?.success) {
          setMatches(matchesData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch corporation matches:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [navigate]);

  const handleRefreshMatches = async () => {
    if (!organizationID) return;

    setRefreshing(true);
    try {
      const res = await fetch(`${API}/matches/general/org/${organizationID}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();

      if (data?.success) {
        setMatches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to refresh corporation matches:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();

    for (const match of matches) {
      const category = match.corporation?.category?.trim();
      if (category) categories.add(category);
    }

    return ["all", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [matches]);

  const visibleMatches = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return matches
      .filter((match) => {
        if (categoryFilter === "all") return true;
        return match.corporation.category === categoryFilter;
      })
      .filter((match) => scoreFilterMatches(match.matchScore, scoreFilter))
      .filter((match) => {
        if (!normalizedQuery) return true;

        const searchable = [
          match.corporation.name,
          match.corporation.email,
          match.corporation.category,
          match.corporation.details,
          match.reasoning,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [matches, categoryFilter, scoreFilter, searchQuery]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />

        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Corporations</h1>
              <p className="max-w-2xl text-gray-500 leading-relaxed">
                Discover ranked sponsors for your organization based on profile alignment,
                category relevance, and completed sponsorship history.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshMatches}
              disabled={refreshing || !organizationID}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1a2e4a] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#243b5e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {refreshing ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 104.582 9m0 0H9" />
                  </svg>
                  Refresh Matches
                </>
              )}
            </button>
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
                  placeholder="Search by company, category, email, details, or reasoning"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-300"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  { value: "all", label: "All Scores" },
                  { value: "high", label: "High Fit" },
                  { value: "medium", label: "Good Fit" },
                  { value: "low", label: "Low Fit" },
                ] as { value: ScoreFilter; label: string }[]).map((option) => {
                  const active = scoreFilter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setScoreFilter(option.value)}
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

            <div className="mt-3 flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const active = categoryFilter === category;
                const label = category === "all" ? "All Categories" : category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      active
                        ? "border-[#1a2e4a] bg-[#1a2e4a] text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white" />
              ))}
            </div>
          ) : visibleMatches.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <h3 className="mb-1 text-lg font-bold text-gray-900">No matching corporations</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {visibleMatches.map((match) => {
                const tone = scoreTone(match.matchScore);

                return (
                  <article
                    key={`${match.organizationID}-${match.corporationID}`}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold tracking-wide text-white">
                          {getInitials(match.corporation.name, 3)}
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-gray-900">{match.corporation.name}</h2>
                          <p className="truncate text-xs text-gray-500">{match.corporation.email}</p>
                        </div>
                      </div>

                      <ScoreBadge score={match.matchScore} size="sm" />
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {match.corporation.category || "General"}
                      </span>
                      <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                        {tone.label}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
                      {match.corporation.details || "No corporation details available."}
                    </p>

                    <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI Reasoning</p>
                      <p className="mt-1 text-sm text-slate-700">{match.reasoning}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Score: {Math.round(match.matchScore)}/100</p>
                      <Link
                        to={`/org/corporations/${match.corporationID}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        View Profile
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
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
