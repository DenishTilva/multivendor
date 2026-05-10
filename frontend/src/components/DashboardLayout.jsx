import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const Icon = {
  Dashboard: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 3H3v10h7V3Zm11 0h-9v6h9V3ZM21 11h-9v10h9V11ZM10 15H3v6h7v-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  Users: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Records: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 8h8M8 12h8M8 16h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Tasks: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 6h12M9 12h12M9 18h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.5 6.5 5 8l3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12.5 5 14l3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 18.5 5 20l3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Settings: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19.4 15a8.7 8.7 0 0 0 .1-2l2-1.5-2-3.5-2.4.6a8.5 8.5 0 0 0-1.7-1l-.4-2.4h-4l-.4 2.4a8.5 8.5 0 0 0-1.7 1L4.5 8 2.5 11.5l2 1.5a8.7 8.7 0 0 0 .1 2l-2 1.5 2 3.5 2.4-.6c.5.4 1.1.8 1.7 1l.4 2.4h4l.4-2.4c.6-.2 1.2-.6 1.7-1l2.4.6 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Menu: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Close: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Sun: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 2v2.5M12 19.5V22M4.2 4.2 6 6M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  Moon: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 13.2A7.5 7.5 0 0 1 10.8 3a6.7 6.7 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Logout: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 12H4m0 0 3-3M4 12l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const DEFAULT_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Icon.Dashboard, path: "" },
  { key: "users", label: "Users", icon: Icon.Users, path: "users" },
  { key: "records", label: "Records", icon: Icon.Records, path: "records" },
  { key: "tasks", label: "Tasks", icon: Icon.Tasks, path: "tasks" },
  { key: "settings", label: "Settings", icon: Icon.Settings, path: "settings" },
];

export default function DashboardLayout({
  title = "Dashboard",
  subtitle,
  basePath = "/admin",
  items = DEFAULT_ITEMS,
  children,
}) {
  const navigate = useNavigate();
  const auth = useAuth?.();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const palette = useMemo(() => {
    if (theme === "dark") {
      return {
        appBg: "bg-zinc-950 text-zinc-100",
        panelBg: "bg-zinc-900/60",
        panelBorder: "border border-white/10",
        muted: "text-zinc-400",
        navBg: "bg-zinc-950/60",
        navBorder: "border-b border-white/10",
        linkIdle: "text-zinc-300 hover:text-white hover:bg-white/5",
        linkActive: "text-white bg-white/8",
        cardBg: "bg-white/5",
        cardBorder: "border border-white/10",
        ring: "focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-0",
        button:
          "bg-white/6 hover:bg-white/10 border border-white/10 text-zinc-100",
        buttonGhost: "hover:bg-white/6 text-zinc-200",
      };
    }

    return {
      appBg: "bg-slate-50 text-slate-900",
      panelBg: "bg-white/80",
      panelBorder: "border border-slate-200/80",
      muted: "text-slate-500",
      navBg: "bg-white/70",
      navBorder: "border-b border-slate-200/70",
      linkIdle: "text-slate-700 hover:text-slate-900 hover:bg-slate-100/70",
      linkActive: "text-slate-900 bg-slate-100/70",
      cardBg: "bg-white",
      cardBorder: "border border-slate-200/70",
      ring: "focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-0",
      button:
        "bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-900",
      buttonGhost: "hover:bg-slate-100/60 text-slate-700",
    };
  }, [theme]);

  const navItems = useMemo(() => {
    const prefix = (basePath || "").replace(/\/$/, "");
    return items.map((i) => {
      const path = i.path ?? "";
      const to = `${prefix}${path ? `/${path}` : ""}` || "/";
      return { ...i, to };
    });
  }, [items, basePath]);

  const onLogout = () => {
    try {
      auth?.logout?.();
    } finally {
      navigate("/", { replace: true });
    }
  };

  const Sidebar = ({ variant }) => (
    <div
      className={cx(
        "h-full w-72",
        palette.panelBg,
        palette.panelBorder,
        "backdrop-blur-xl",
        variant === "desktop" ? "rounded-none" : "rounded-2xl shadow-2xl",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cx(
                "grid h-10 w-10 place-items-center rounded-xl",
                theme === "dark"
                  ? "bg-linear-to-br from-sky-500/20 to-violet-500/20 ring-1 ring-white/10"
                  : "bg-linear-to-br from-sky-600/10 to-violet-600/10 ring-1 ring-slate-200/70",
              )}
            >
              <span className="text-sm font-semibold tracking-tight">MV</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Multivendor Admin</div>
              <div className={cx("text-xs", palette.muted)}>SaaS Console</div>
            </div>
          </div>

          {variant !== "desktop" ? (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className={cx(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                palette.buttonGhost,
                palette.ring,
              )}
              aria-label="Close sidebar"
            >
              <Icon.Close className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className="px-3">
          <div className={cx("rounded-xl", theme === "dark" ? "bg-white/4" : "bg-slate-100/70")}>
            <div className="px-3 py-3">
              <div className="text-xs font-medium uppercase tracking-wide">
                Workspace
              </div>
              <div className={cx("mt-1 text-xs", palette.muted)}>
                Use the menu to navigate
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <li key={item.key}>
                  <NavLink
                    to={item.to}
                    end={item.path === ""}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cx(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        isActive ? palette.linkActive : palette.linkIdle,
                      )
                    }
                  >
                    <span
                      className={cx(
                        "grid h-9 w-9 place-items-center rounded-lg transition",
                        theme === "dark"
                          ? "bg-white/4 group-hover:bg-white/6"
                          : "bg-white/70 group-hover:bg-white",
                        theme === "dark" ? "ring-1 ring-white/8" : "ring-1 ring-slate-200/70",
                      )}
                    >
                      <ItemIcon className="h-5 w-5" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 pb-4">
          <div className={cx("rounded-xl p-3", theme === "dark" ? "bg-white/4" : "bg-slate-100/70")}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">Signed in</div>
                <div className={cx("truncate text-xs", palette.muted)}>
                  {auth?.user?.email || auth?.user?.name || auth?.user?.role || "User"}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className={cx(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
                  palette.button,
                  palette.ring,
                )}
              >
                <Icon.Logout className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cx("min-h-screen", palette.appBg)}>
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen shrink-0 md:block">
          <Sidebar variant="desktop" />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cx(
              "sticky top-0 z-20",
              palette.navBg,
              palette.navBorder,
              "backdrop-blur-xl",
            )}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className={cx(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl md:hidden",
                    palette.button,
                    palette.ring,
                  )}
                  aria-label="Open sidebar"
                >
                  <Icon.Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                  <div className="truncate text-base font-semibold tracking-tight">
                    {title}
                  </div>
                  {subtitle ? (
                    <div className={cx("truncate text-sm", palette.muted)}>
                      {subtitle}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                    palette.button,
                    palette.ring,
                  )}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Icon.Sun className="h-5 w-5" />
                  ) : (
                    <Icon.Moon className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline">
                    {theme === "dark" ? "Light" : "Dark"}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 md:px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className={cx("rounded-2xl p-4", palette.cardBg, palette.cardBorder)}>
                  <div className="text-sm font-semibold">Quick Overview</div>
                  <div className={cx("mt-1 text-sm", palette.muted)}>
                    Card-based, clean SaaS layout
                  </div>
                </div>
                <div className={cx("rounded-2xl p-4", palette.cardBg, palette.cardBorder)}>
                  <div className="text-sm font-semibold">Status</div>
                  <div className={cx("mt-1 text-sm", palette.muted)}>
                    Dark / light professional colors
                  </div>
                </div>
                <div className={cx("rounded-2xl p-4", palette.cardBg, palette.cardBorder)}>
                  <div className="text-sm font-semibold">Actions</div>
                  <div className={cx("mt-1 text-sm", palette.muted)}>
                    Add your widgets inside the content area
                  </div>
                </div>
              </div>

              <div className="mt-6">{children}</div>
            </div>
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div
            className={cx(
              "absolute inset-0",
              theme === "dark" ? "bg-black/60" : "bg-slate-900/40",
            )}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 p-3">
            <Sidebar variant="mobile" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

