import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SelectRolePage } from "./pages/SelectRolePage";
import { OrgDashboardPage } from "./pages/OrgDashboardPage";
import { CorporationProfilePage } from "./pages/CorporationProfilePage";
import { OrgAllEventsPage } from "./pages/OrgAllEventsPage";
import { EventForumPage } from "./pages/EventForumPage";
import { EventWorkspacePage } from "./pages/EventWorkspacePage";
import { OrgEventFormPage } from "./pages/OrgEventFormPage";
import { OrgProfilePage } from "./pages/OrgProfilePage";
import { OrgCorporationsPage } from "./pages/OrgCorporationsPage";
import { OrgCorporationHistoryPage } from "./pages/OrgCorporationHistoryPage";
import { CorporationEventPublicPage } from "./pages/CorporationEventPublicPage";
import { OrgInboxPage } from "./pages/OrgInboxPage";
import { CorpDashboardPage } from "./pages/CorpDashboardPage";
import { CorpOrganizationsPage } from "./pages/CorpOrganizationsPage";
import { CorpPartnershipsPage } from "./pages/CorpPartnershipsPage";

const API = "http://localhost:3000";

const HomeRedirect = () => {
  const [targetPath, setTargetPath] = useState<string | null>(null);

  useEffect(() => {
    const resolveTarget = async () => {
      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        const user = meData?.user;

        if (!user?.role) {
          setTargetPath("/login");
          return;
        }

        const isCorp = user.role === "corp" || user.role === "corporation";
        setTargetPath(isCorp ? "/corp/dashboard" : "/org/dashboard");
      } catch {
        setTargetPath("/login");
      }
    };

    resolveTarget();
  }, []);

  if (!targetPath) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  return <Navigate to={targetPath} replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomeRedirect />} />
        <Route path="/org/dashboard" element={<OrgDashboardPage />} />
        <Route path="/org/events" element={<OrgAllEventsPage />} />
        <Route path="/org/events/new" element={<OrgEventFormPage />} />
        <Route path="/org/events/:id/edit" element={<OrgEventFormPage />} />
        <Route path="/org/events/:id" element={<EventWorkspacePage />} />
        <Route path="/org/profile" element={<OrgProfilePage />} />
        <Route path="/org/corporations" element={<OrgCorporationsPage />} />
        <Route path="/org/inbox" element={<OrgInboxPage />} />
        <Route path="/corp/profile" element={<CorporationProfilePage />} />
        <Route path="/corp/dashboard" element={<CorpDashboardPage />} />
        <Route path="/corp/organizations" element={<CorpOrganizationsPage />} />
        <Route path="/corp/events" element={<EventForumPage />} />
        <Route path="/corp/partnerships" element={<CorpPartnershipsPage />} />
        <Route path="/org/corporations/:id" element={<CorporationProfilePage />} />
        <Route path="/org/corporations/:id/history" element={<OrgCorporationHistoryPage />} />
        <Route path="/events" element={<EventForumPage />} />
        <Route path="/partners" element={<CorpPartnershipsPage />} />
        <Route path="/events/:id" element={<CorporationEventPublicPage />} />
      </Routes>
    </BrowserRouter>
  );
};

