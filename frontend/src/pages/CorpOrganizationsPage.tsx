import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { getInitials } from "../utils/image";

interface CorpGeneralMatch {
  corporationID: string;
  organizationID: string;
  matchScore: number;
  reasoning: string;
  organization: {
    id: string;
    name: string;
    email: string;
    details: string;
  };
}

type ScoreFilter = "all" | "high" | "medium" | "low";

const API = "http://localhost:3000";

const isCorpRole = (role?: string) => role === "corp" || role === "corporation";

const scoreFilterMatches = (score: number, filter: ScoreFilter) => {
  if (filter === "all") return true;
  if (filter === "high") return score >= 85;
  if (filter === "medium") return score >= 70 && score < 85;
  return score < 70;
};

export const CorpOrganizationsPage = () => {
  const navigate = useNavigate();
  const [corporationID, setCorporationID] = useState<string | null>(null);
  const [matches, setMatches] = useState<CorpGeneralMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");

  useEffect(() => {
    const initializeAndFetch = async () => {
      setLoading(true);
      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        const user = meData?.user;

        if (!user || !isCorpRole(user.role)) {
          navigate("/login", { replace: true });
          return;
        }

        setCorporationID(user.id);

        const matchesRes = await fetch(`${API}/matches/general/corp/${user.id}`, {
          credentials: "include",
        });
        const matchesData = await matchesRes.json();

        if (matchesData?.success) {
          setMatches(matchesData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch organization matches:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [navigate]);

  const handleRefreshMatches = async () => {
    if (!corporationID) return;

    setRefreshing(true);
    try {
      const res = await fetch(`${API}/matches/general/corp/${corporationID}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();

      if (data?.success) {
        setMatches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to refresh organization matches:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const visibleMatches = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return matches
      .filter((match) => scoreFilterMatches(match.matchScore, scoreFilter))
      .filter((match) => {
        if (!normalizedQuery) return true;

        const searchable = [
          match.organization.name,
          match.organization.email,
          match.organization.details,
          match.reasoning,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [matches, scoreFilter, searchQuery]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />

        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Organizations</h1>
              <p className="max-w-2xl text-gray-500 leading-relaxed">
                Discover organizations ranked for your corporation using AI general fit score and historical context.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshMatches}
              disabled={refreshing || !corporationID}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1a2e4a] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#243b5e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {refreshing ? "Refreshing" : "Refresh Matches"}
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
                  placeholder="Search by organization, email, details, reasoning"
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
          </section>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white" />
              ))}
            </div>
          ) : visibleMatches.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <h3 className="mb-1 text-lg font-bold text-gray-900">No matching organizations</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {visibleMatches.map((match) => (
                <article
                  key={`${match.organizationID}-${match.corporationID}`}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold tracking-wide text-white">
                        {getInitials(match.organization.name, 3)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-gray-900">{match.organization.name}</h2>
                        <p className="truncate text-xs text-gray-500">{match.organization.email}</p>
                      </div>
                    </div>

                    <ScoreBadge score={match.matchScore} size="sm" />
                  </div>

                  <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {match.organization.details || "No organization details available."}
                  </p>

                  <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI Reasoning</p>
                    <p className="mt-1 text-sm text-slate-700">{match.reasoning}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Score: {Math.round(match.matchScore)}/100</p>
                    <Link
                      to="/corp/events"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      Explore Their Events
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
