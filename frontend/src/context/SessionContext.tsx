import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "../utils/api";

type SessionRole = "organization" | "corporation";

type RawRole = "org" | "organization" | "corp" | "corporation";

interface SessionUser {
  id: string;
  role: SessionRole;
  rawRole: RawRole;
  email?: string;
}

interface ProfileData {
  name?: string;
  email?: string;
  imagePath?: string | null;
}

interface SessionContextValue {
  user: SessionUser | null;
  profile: ProfileData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  clear: () => void;
}

interface MeResponse {
  user?: {
    id?: string;
    role?: RawRole | string;
    email?: string;
  } | null;
}

interface ProfileResponse {
  data?: ProfileData;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const normalizeRole = (role?: string): SessionRole | null => {
  if (role === "org" || role === "organization") return "organization";
  if (role === "corp" || role === "corporation") return "corporation";
  return null;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(() => {
    setUser(null);
    setProfile(null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const meData = await apiFetch<MeResponse>("/auth/me");
      const meUser = meData?.user;
      const role = normalizeRole(meUser?.role);

      if (!meUser?.id || !role) {
        clear();
        return;
      }

      const nextUser: SessionUser = {
        id: meUser.id,
        role,
        rawRole: meUser.role as RawRole,
        email: meUser.email,
      };

      setUser(nextUser);

      try {
        const profileData = await apiFetch<ProfileResponse>(role === "organization" ? "/org/profile" : "/corp/profile");
        setProfile(profileData?.data || null);
      } catch {
        setProfile(null);
      }
    } catch {
      clear();
    } finally {
      setLoading(false);
    }
  }, [clear]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    window.addEventListener("profile-image-updated", refresh);
    return () => window.removeEventListener("profile-image-updated", refresh);
  }, [refresh]);

  const value = useMemo(
    () => ({ user, profile, loading, refresh, clear }),
    [user, profile, loading, refresh, clear]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used within SessionProvider");
  return session;
};
