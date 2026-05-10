import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { getStaffUsers } from "../api/userApi";
import { createTask, getTasks, updateTask } from "../api/taskApi";

const cx = (...classes) => classes.filter(Boolean).join(" ");

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDateOnly(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formatAssignee(u) {
  if (!u) return "—";
  return u.email ? `${u.name || "User"} (${u.email})` : u.name || "—";
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function TasksPage() {
  const user = useMemo(() => safeParseUser(), []);
  const role = user?.role || "user";

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isStaff = role === "staff";

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState("");

  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState("");

  const [createForm, setCreateForm] = useState({
    heading: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [savingIds, setSavingIds] = useState(() => new Set());

  const fetchTasks = async () => {
    setLoadingTasks(true);
    setTasksError("");
    try {
      const res = await getTasks();
      setTasks(res?.data?.tasks || []);
    } catch (e) {
      setTasksError(e?.response?.data?.message || e?.message || "Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchStaff = async () => {
    setLoadingStaff(true);
    setStaffError("");
    try {
      const res = await getStaffUsers();
      setStaff(res?.data?.users || []);
    } catch (e) {
      setStaffError(
        e?.response?.data?.message || e?.message || "Failed to load staff users",
      );
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (isManager) fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t?.status === "completed").length;
    const pending = tasks.filter((t) => t?.status === "pending").length;
    return { total, completed, pending };
  }, [tasks]);

  const setCreateField = (key, value) => {
    setCreateForm((p) => ({ ...p, [key]: value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!isManager) return;

    setCreateError("");
    if (
      !createForm.heading.trim() ||
      !createForm.description.trim() ||
      !createForm.assignedTo ||
      !createForm.dueDate
    ) {
      setCreateError("All fields are required.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        heading: createForm.heading.trim(),
        description: createForm.description.trim(),
        assignedTo: createForm.assignedTo,
        dueDate: new Date(createForm.dueDate).toISOString(),
      };

      const res = await createTask(payload);
      const created = res?.data?.task;

      setCreateForm({ heading: "", description: "", assignedTo: "", dueDate: "" });

      if (created?._id) {
        setTasks((prev) => [created, ...prev.filter((t) => t?._id !== created._id)]);
      } else {
        await fetchTasks();
      }
    } catch (e2) {
      setCreateError(
        e2?.response?.data?.message || e2?.message || "Failed to create task",
      );
    } finally {
      setCreating(false);
    }
  };

  const updateTaskForStaff = async (task, nextStatus, completionReason) => {
    const id = task?._id;
    if (!id) return;

    setSavingIds((prev) => new Set(prev).add(id));
    try {
      const payload = { status: nextStatus };
      if (completionReason) payload.completionReason = completionReason;

      const res = await updateTask(id, payload);
      const updated = res?.data?.task;

      if (updated?._id) {
        setTasks((prev) => prev.map((t) => (t?._id === updated._id ? updated : t)));
      } else {
        await fetchTasks();
      }
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to update task");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <DashboardLayout
      title="Tasks"
      subtitle={
        isManager
          ? "Create and assign tasks to staff"
          : isStaff
            ? "Update task status and completion reason"
            : "View tasks across the system"
      }
      basePath={isAdmin ? "/admin" : isManager ? "/manager" : isStaff ? "/staff" : "/admin"}
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Total</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.total}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Pending</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.pending}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Completed</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.completed}
              </div>
            </div>
          </div>

          {isManager ? (
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="border-b border-slate-200/70 px-5 py-4">
                <div className="text-sm font-semibold text-slate-900">
                  Create task
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Assign to a staff member with a due date
                </div>
              </div>

              <form onSubmit={onCreate} className="space-y-4 p-5">
                {createError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {createError}
                  </div>
                ) : null}

                {staffError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {staffError}
                  </div>
                ) : null}

                <label className="block">
                  <div className="text-xs font-medium text-slate-600">Heading</div>
                  <input
                    value={createForm.heading}
                    onChange={(e) => setCreateField("heading", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                    placeholder="e.g. Verify supplier invoices"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-medium text-slate-600">Description</div>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateField("description", e.target.value)}
                    rows={4}
                    className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                    placeholder="What should be done, acceptance criteria, notes…"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <div className="text-xs font-medium text-slate-600">
                      Assign staff
                    </div>
                    <select
                      value={createForm.assignedTo}
                      onChange={(e) => setCreateField("assignedTo", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                      disabled={loadingStaff}
                    >
                      <option value="">
                        {loadingStaff ? "Loading staff..." : "Select staff"}
                      </option>
                      {staff.map((s) => (
                        <option key={s._id} value={s._id}>
                          {formatAssignee(s)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <div className="text-xs font-medium text-slate-600">Due date</div>
                    <input
                      type="date"
                      value={createForm.dueDate}
                      onChange={(e) => setCreateField("dueDate", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className={cx(
                    "inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                    creating ? "opacity-70" : "hover:bg-slate-800",
                  )}
                >
                  {creating ? "Creating..." : "Create task"}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Access</div>
              <div className="mt-1 text-sm text-slate-500">
                {isStaff
                  ? "You can update status and add a completion reason on your tasks."
                  : isAdmin
                    ? "You can view all tasks."
                    : "You can view tasks assigned to you."}
              </div>
            </div>
          )}
        </section>

        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Tasks</div>
                <div className="mt-1 text-sm text-slate-500">
                  {isAdmin
                    ? "All tasks"
                    : isManager
                      ? "Tasks assigned by you"
                      : "Tasks assigned to you"}
                </div>
              </div>

              <button
                type="button"
                onClick={fetchTasks}
                disabled={loadingTasks}
                className={cx(
                  "inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50",
                  loadingTasks && "opacity-60",
                )}
              >
                {loadingTasks ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {tasksError ? (
              <div className="px-5 py-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {tasksError}
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-3">Heading</th>
                    <th className="min-w-[260px] px-5 py-3">Description</th>
                    <th className="whitespace-nowrap px-5 py-3">Assigned To</th>
                    <th className="whitespace-nowrap px-5 py-3">Due</th>
                    <th className="whitespace-nowrap px-5 py-3">Status</th>
                    <th className="min-w-[220px] px-5 py-3">Completion reason</th>
                    <th className="whitespace-nowrap px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/70">
                  {loadingTasks ? (
                    [...Array(6)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 w-28 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-64 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-40 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-44 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-8 w-24 rounded bg-slate-200" />
                        </td>
                      </tr>
                    ))
                  ) : tasks.length ? (
                    tasks.map((t) => {
                      const saving = savingIds.has(t?._id);
                      const canUpdate = isStaff;

                      const currentStatus = t?.status || "pending";
                      const currentReason = t?.completionReason || "";

                      return (
                        <TaskRow
                          key={t?._id}
                          task={t}
                          saving={saving}
                          canUpdate={canUpdate}
                          onUpdate={updateTaskForStaff}
                          status={currentStatus}
                          completionReason={currentReason}
                        />
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center">
                        <div className="text-sm font-semibold text-slate-900">
                          No tasks found
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {isManager
                            ? "Create your first task using the form."
                            : "Tasks assigned to you will appear here."}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function TaskRow({ task, saving, canUpdate, onUpdate, status, completionReason }) {
  const [localStatus, setLocalStatus] = useState(status);
  const [localReason, setLocalReason] = useState(completionReason);

  useEffect(() => setLocalStatus(status), [status]);
  useEffect(() => setLocalReason(completionReason), [completionReason]);

  const due = formatDateOnly(task?.dueDate);
  const assignedTo = task?.assignedTo?.email || task?.assignedTo?.name || "—";

  const statusPill =
    localStatus === "completed"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : localStatus === "in_progress"
        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  return (
    <tr className="align-top hover:bg-slate-50/60">
      <td className="px-5 py-4 font-medium text-slate-900">
        {task?.heading || "—"}
      </td>
      <td className="px-5 py-4 text-slate-700">
        <div className="line-clamp-3">{task?.description || "—"}</div>
      </td>
      <td className="px-5 py-4 text-slate-700">{assignedTo}</td>
      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{due}</td>
      <td className="px-5 py-4">
        {canUpdate ? (
          <select
            value={localStatus}
            onChange={(e) => setLocalStatus(e.target.value)}
            disabled={saving}
            className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", statusPill)}>
            {STATUS_OPTIONS.find((s) => s.value === localStatus)?.label || localStatus}
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        {canUpdate ? (
          <textarea
            value={localReason}
            onChange={(e) => setLocalReason(e.target.value)}
            disabled={saving || localStatus !== "completed"}
            rows={2}
            className={cx(
              "w-full min-w-[220px] resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4",
              (saving || localStatus !== "completed") && "opacity-70",
            )}
            placeholder={
              localStatus === "completed"
                ? "Why is this completed?"
                : "Completion reason (available when completed)"
            }
          />
        ) : (
          <div className="text-slate-600">{task?.completionReason || "—"}</div>
        )}
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        {canUpdate ? (
          <button
            type="button"
            onClick={() => onUpdate(task, localStatus, localReason)}
            disabled={saving}
            className={cx(
              "inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800",
              saving && "opacity-60",
            )}
          >
            {saving ? "Saving..." : "Update"}
          </button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
    </tr>
  );
}

