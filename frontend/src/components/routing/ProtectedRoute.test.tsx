import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { HomeRedirect } from "./HomeRedirect";

const sessionState = vi.hoisted(() => ({
  value: {
    user: null as null | { id: string; role: "organization" | "corporation"; rawRole: "org" | "corp" },
    profile: null,
    loading: false,
    refresh: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock("../../context/SessionContext", () => ({
  useSession: () => sessionState.value,
}));

const renderRoutes = (initialPath = "/org/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute roles={["organization"]} />}>
          <Route path="/org/dashboard" element={<div>Org Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/corp/dashboard" element={<div>Corp Dashboard</div>} />
        <Route path="/" element={<HomeRedirect />} />
      </Routes>
    </MemoryRouter>
  );

describe("routing guards", () => {
  beforeEach(() => {
    sessionState.value.user = null;
    sessionState.value.loading = false;
  });

  it("redirects unauthenticated users to login", async () => {
    renderRoutes();
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("renders allowed organization route", () => {
    sessionState.value.user = { id: "org-1", role: "organization", rawRole: "org" };
    renderRoutes();
    expect(screen.getByText("Org Dashboard")).toBeInTheDocument();
  });

  it("redirects home to corporation dashboard", async () => {
    sessionState.value.user = { id: "corp-1", role: "corporation", rawRole: "corp" };
    renderRoutes("/");
    expect(await screen.findByText("Corp Dashboard")).toBeInTheDocument();
  });
});
