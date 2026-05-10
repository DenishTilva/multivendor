import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { EmptyState, SectionCard, StatCard } from "../components/dashboard/DashboardCards";
import { getTasks } from "../api/taskApi";

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const StaffDashboard = () => {
  const user = useMemo(() => safeParseUser(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    try {
      const t = await getTasks();
      setTasks(t?.data?.tasks || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const assignedTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t?.status === "completed").length;
    const pendingTasks = tasks.filter((t) => t?.status === "pending").length;
    return { assignedTasks, completedTasks, pendingTasks };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 6);
  }, [tasks]);

  return (
    <DashboardLayout
      title="Staff Dashboard"
      subtitle={`Welcome back${user?.name ? `, ${user.name}` : ""}. Here’s your workload snapshot.`}
      basePath="/staff"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Assigned tasks" value={loading ? "—" : stats.assignedTasks} tone="slate" />
        <StatCard label="Completed" value={loading ? "—" : stats.completedTasks} tone="emerald" />
        <StatCard label="Pending" value={loading ? "—" : stats.pendingTasks} tone="sky" />
      </div>

      <div className="mt-6">
        <SectionCard title="Recent tasks" subtitle="Most recent tasks assigned to you">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Heading</th>
                  <th className="min-w-[260px] px-4 py-3">Description</th>
                  <th className="whitespace-nowrap px-4 py-3">Due</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-4 w-44 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-64 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-20 rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                ) : recentTasks.length ? (
                  recentTasks.map((t) => (
                    <tr key={t?._id} className="align-top hover:bg-slate-50/60">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {t?.heading || "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <div className="line-clamp-3">{t?.description || "—"}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {t?.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {t?.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10">
                      <EmptyState
                        title="No tasks yet"
                        subtitle="When your manager assigns tasks, they’ll appear here."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;