import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { EmptyState, SectionCard, StatCard } from "../components/dashboard/DashboardCards";
import { getTasks } from "../api/taskApi";
import { getRecords } from "../api/recordApi";

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

const ManagerDashboard = () => {
  const user = useMemo(() => safeParseUser(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [records, setRecords] = useState([]);

  const load = async () => {
    try {
      const [t, r] = await Promise.all([getTasks(), getRecords()]);
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

  const stats = useMemo(() => {
    const assignedTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t?.status === "pending").length;
    const completedTasks = tasks.filter((t) => t?.status === "completed").length;
    const recordsCreated = records.filter((r) => r?.createdBy?._id === user?.id).length;
    return { assignedTasks, pendingTasks, completedTasks, recordsCreated };
  }, [tasks, records, user?.id]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 6);
  }, [tasks]);

  const recentRecords = useMemo(() => {
    return [...records]
      .filter((r) => r?.createdBy?._id === user?.id)
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 6);
  }, [records, user?.id]);

  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Track assigned tasks and recent records"
      basePath="/manager"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned tasks" value={loading ? "—" : stats.assignedTasks} tone="slate" />
        <StatCard label="Pending" value={loading ? "—" : stats.pendingTasks} tone="sky" />
        <StatCard label="Completed" value={loading ? "—" : stats.completedTasks} tone="emerald" />
        <StatCard label="Records created" value={loading ? "—" : stats.recordsCreated} tone="violet" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionCard title="Recent tasks" subtitle="Latest tasks assigned by you">
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
                          subtitle="Tasks you create will show up here."
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
          <SectionCard title="Recent records" subtitle="Records created by you">
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
                        <td className="px-4 py-4 text-slate-700">{r?.subCategory || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">{formatDate(r?.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-10">
                        <EmptyState
                          title="No records yet"
                          subtitle="Records you create will show up here."
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

export default ManagerDashboard;
