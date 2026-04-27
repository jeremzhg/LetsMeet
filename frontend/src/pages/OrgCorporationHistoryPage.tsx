import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { StatusPill } from "../components/shared/StatusPill";

interface CorporationSummary {
  id: string;
  name: string;
  email: string;
  category: string;
}

interface PastEvent {
  id: string;
  title: string;
  date: string;
  details: string;
  status: string;
}

const API = "http://localhost:3000";

export const OrgCorporationHistoryPage = () => {
  const { id: corpID } = useParams<{ id: string }>();
  const [corporation, setCorporation] = useState<CorporationSummary | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!corpID) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [corpRes, historyRes] = await Promise.all([
          fetch(`${API}/corp/${corpID}/profile`, { credentials: "include" }),
          fetch(`${API}/corp/${corpID}/history?eventStatus=completed`, { credentials: "include" }),
        ]);

        const corpData = await corpRes.json();
        if (corpRes.ok && corpData?.success) {
          setCorporation(corpData.data);
        }

        const historyData = await historyRes.json();
        if (historyRes.ok) {
          setPastEvents(Array.isArray(historyData) ? historyData : historyData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch corporation history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [corpID]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-partnerships" />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading history…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-partnerships" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />

        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link
                to={`/org/corporations/${corpID}`}
                className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Corporation Profile
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Past Event History</h1>
              <p className="mt-1 text-sm text-gray-500">
                {corporation?.name ? `${corporation.name} completed sponsorship records` : "Completed sponsorship records"}
              </p>
            </div>
          </div>

          {pastEvents.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
              <p className="text-gray-400">No past event history available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="history-card group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                >
                  <div className="h-32 bg-gradient-to-br from-slate-700 via-blue-900 to-slate-800 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <StatusPill status={event.status === "completed" ? "Successful" : event.status} />
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="mb-1 font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                      {event.title}
                    </h4>
                    <div className="mb-2 flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.date)}
                    </div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">{event.details}</p>
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
