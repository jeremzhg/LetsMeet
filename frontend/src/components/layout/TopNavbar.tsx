import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/org/dashboard" },
  { label: "Your Events", path: "/org/events" },
  { label: "Corporations", path: "/org/corporations" },
  { label: "Event Forum", path: "/org/forum" },
  { label: "Profile", path: "/org/profile" },
];

export const TopNavbar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-3 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5">
          <span className="shrink-0 text-sm font-bold tracking-wide text-blue-700">LetsMeet Portal</span>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/org/events" && location.pathname.startsWith(item.path + "/")) ||
                (item.path === "/org/events" && location.pathname.startsWith("/org/events"));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Notifications"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          <button
            type="button"
            title="Help"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 shadow-sm" />
        </div>
      </div>
    </header>
  );
};
