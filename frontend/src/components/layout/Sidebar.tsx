import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface BottomItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
}

interface SidebarProps {
  variant: "org-dashboard" | "org-partnerships";
  ctaPosition?: "top" | "bottom";
}


const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const EventsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ForumIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const InboxIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
  </svg>
);
const CorporationsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const MessagesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-8 5-8-5" />
  </svg>
);
const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const SupportIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const orgDashboardNav: NavItem[] = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/org/dashboard" },
  { label: "Events", icon: <EventsIcon />, path: "/org/events" },
  { label: "Corporations", icon: <CorporationsIcon />, path: "/org/corporations" },
  { label: "Forum", icon: <ForumIcon />, path: "/org/forum" },
  { label: "Inbox", icon: <InboxIcon />, path: "/org/inbox" },
];

const orgPartnershipsNav: NavItem[] = [
  { label: "Profile", icon: <ProfileIcon />, path: "/org/profile" },
  { label: "Your Events", icon: <EventsIcon />, path: "/org/events" },
  { label: "Corporations", icon: <CorporationsIcon />, path: "/org/corporations" },
  { label: "Messages", icon: <MessagesIcon />, path: "/org/messages" },
  { label: "Analytics", icon: <AnalyticsIcon />, path: "/org/analytics" },
];

export const Sidebar = ({ variant, ctaPosition = "bottom" }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = variant === "org-dashboard" ? orgDashboardNav : orgPartnershipsNav;

  const isOrgDashboard = variant === "org-dashboard";

  const logo = isOrgDashboard
    ? { title: "LetsMeet", subtitle: "Management Hub" }
    : { title: "Org Dashboard", subtitle: "Partnership Portal" };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const bottomLinks: BottomItem[] = isOrgDashboard
    ? [
        { label: "Settings", icon: <SettingsIcon />, path: "/org/settings" },
        { label: "Support", icon: <SupportIcon />, path: "/org/support" },
        { label: "Logout", icon: <LogoutIcon />, onClick: handleLogout },
      ]
    : [
        { label: "Help Center", icon: <SupportIcon />, path: "/org/help" },
        { label: "Logout", icon: <LogoutIcon />, onClick: handleLogout },
      ];

  const footerPositionClass = ctaPosition === "top" ? "pt-4" : "mt-auto pt-4";


  return (
    <aside
      className={`sidebar-container sticky top-0 flex h-screen shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white py-6 transition-all duration-200 ${
        collapsed ? "w-20 px-3" : "w-56 px-4"
      }`}
    >
      <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "gap-2.5 px-2"}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <h2 className="text-sm font-bold text-blue-700 leading-tight">{logo.title}</h2>
            <p className="text-[10px] text-gray-400 leading-tight">{logo.subtitle}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="mb-4 flex items-center justify-center rounded-lg border border-gray-200 py-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
        </svg>
      </button>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.label}
              to={item.path}
              title={item.label}
              className={`sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-l-[3px] border-transparent"
              }`}
            >
              {item.icon}
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={footerPositionClass}>


        <div className="flex flex-col gap-1">
          {bottomLinks.map((item) => {
            const classes = `flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 ${
              collapsed ? "justify-center" : ""
            }`;

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  title={item.label}
                  onClick={item.onClick}
                  className={classes}
                >
                  {item.icon}
                  {!collapsed && item.label}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.path!}
                title={item.label}
                className={classes}
              >
                {item.icon}
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

