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

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<Navigate to="/org/dashboard" replace />} />
        <Route path="/org/dashboard" element={<OrgDashboardPage />} />
        <Route path="/org/events" element={<OrgAllEventsPage />} />
        <Route path="/org/events/new" element={<OrgEventFormPage />} />
        <Route path="/org/events/:id/edit" element={<OrgEventFormPage />} />
        <Route path="/org/events/:id" element={<EventWorkspacePage />} />
        <Route path="/org/profile" element={<OrgProfilePage />} />
        <Route path="/org/corporations" element={<OrgCorporationsPage />} />
        <Route path="/corp/profile" element={<CorporationProfilePage />} />
        <Route path="/org/corporations/:id" element={<CorporationProfilePage />} />
        <Route path="/org/corporations/:id/history" element={<OrgCorporationHistoryPage />} />
        <Route path="/org/forum" element={<EventForumPage />} />
        <Route path="/events" element={<EventForumPage />} />
      </Routes>
    </BrowserRouter>
  );
};

