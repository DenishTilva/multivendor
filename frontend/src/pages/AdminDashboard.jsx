import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { EmptyState, SectionCard, StatCard } from "../components/dashboard/DashboardCards";
import { getUsers } from "../api/userApi";
import { getTasks } from "../api/taskApi";
import { getRecords } from "../api/recordApi";

const cx = (...classes) => classes.filter(Boolean).join(" ");

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [records, setRecords] = useState([]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalManagers = users.filter((u) => u?.role === "manager").length;
    const totalStaff = users.filter((u) => u?.role === "staff").length;
    const totalTasks = tasks.length;
    const totalRecords = records.length;
    return { totalUsers, totalManagers, totalStaff, totalTasks, totalRecords };
  }, [users, tasks, records]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 6);
  }, [tasks]);

  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 6);
  }, [records]);

  const load = async () => {
    try {
      const [u, t, r] = await Promise.all([getUsers(), getTasks(), getRecords()]);
      setUsers(u?.data?.users || []);
      setTasks(t?.data?.tasks || []);
      setRecords(r?.data?.records || []);
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

  const refresh = async () => {
    setLoading(true);
    setError("");
    await load();
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Analytics overview across users, tasks and records"
      basePath="/admin"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total users" value={loading ? "—" : stats.totalUsers} tone="slate" />
        <StatCard label="Managers" value={loading ? "—" : stats.totalManagers} tone="violet" />
        <StatCard label="Staff" value={loading ? "—" : stats.totalStaff} tone="sky" />
        <StatCard label="Total tasks" value={loading ? "—" : stats.totalTasks} tone="emerald" />
        <StatCard label="Total records" value={loading ? "—" : stats.totalRecords} tone="rose" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionCard
            title="Recent tasks"
            subtitle="Latest activity across the platform"
            right={
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className={cx(
                  "inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50",
                  loading && "opacity-60",
                )}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            }
          >
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
                    <th className="whitespace-nowrap px-4 py-3">Assigned to</th>
                    <th className="whitespace-nowrap px-4 py-3">Due</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4">
                          <div className="h-4 w-44 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-40 rounded bg-slate-200" />
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
                      <tr key={t?._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {t?.heading || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {t?.assignedTo?.email || t?.assignedTo?.name || "—"}
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
                          subtitle="Tasks will appear here once created."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-5">
          <SectionCard title="Recent records" subtitle="Newest records created in the system">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Category</th>
                    <th className="whitespace-nowrap px-4 py-3">Sub-category</th>
                    <th className="whitespace-nowrap px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4">
                          <div className="h-4 w-28 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-28 rounded bg-slate-200" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-32 rounded bg-slate-200" />
                        </td>
                      </tr>
                    ))
                  ) : recentRecords.length ? (
                    recentRecords.map((r) => (
                      <tr key={r?._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {r?.category || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {r?.subCategory || "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">{formatDate(r?.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-10">
                        <EmptyState
                          title="No records yet"
                          subtitle="Records will appear here once created."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
