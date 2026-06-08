import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "../../context/SessionContext";
import { getInitials, toAbsoluteImageUrl } from "../../utils/image";

export const TopNavbar = () => {
  const { user, profile } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const profilePath = useMemo(
    () => (user?.role === "corporation" ? "/corp/profile" : "/org/profile"),
    [user?.role]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const displayName = profile?.name || user?.email || "LetsMeet User";
  const displayEmail = profile?.email || user?.email || "";
  const imagePath = profile?.imagePath || null;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-3 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <span className="shrink-0 text-base font-bold tracking-wide text-blue-700">LetsMeet</span>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 transition-colors hover:border-gray-300 hover:bg-gray-50"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <div className="h-9 w-9 overflow-hidden rounded-lg bg-slate-200">
              {imagePath ? (
                <img
                  src={toAbsoluteImageUrl(imagePath) || ""}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">
                  {getInitials(displayName, 2)}
                </div>
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-gray-900">{displayName}</p>
            </div>
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg" role="menu">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5">
                <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-200">
                    {imagePath ? (
                    <img
                      src={toAbsoluteImageUrl(imagePath) || ""}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">
                      {getInitials(displayName, 2)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{displayName}</p>
                  <p className="truncate text-xs text-gray-500">{displayEmail}</p>
                </div>
              </div>

              <Link
                to={profilePath}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
