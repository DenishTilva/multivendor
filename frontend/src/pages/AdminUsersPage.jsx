import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { createUser, deleteUser, getUsers } from "../api/userApi";

const PERMISSION_FIELDS = [
  { key: "category", label: "Category" },
  { key: "subCategory", label: "Sub-category" },
  { key: "shortDescription", label: "Short description" },
  { key: "fullDescription", label: "Full description" },
];

const ROLES = [
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "user", label: "User" },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

const toInitialPermissions = () =>
  PERMISSION_FIELDS.reduce((acc, p) => {
    acc[p.key] = false;
    return acc;
  }, {});

function formatPermissions(permissions) {
  const p = permissions || {};
  const labels = PERMISSION_FIELDS.filter((f) => Boolean(p[f.key])).map(
    (f) => f.label,
  );
  return labels.length ? labels.join(", ") : "—";
}

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AdminUsersPage() {
  const user = useMemo(() => safeParseUser(), []);
  const basePath = useMemo(() => {
    const role = user?.role;
    return role === "manager" ? "/manager" : "/admin";
  }, [user?.role]);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");

  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    password: "",
    role: "user",
    permissions: toInitialPermissions(),
  }));

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [deletingIds, setDeletingIds] = useState(() => new Set());

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u?.isActive !== false).length;
    const admins = users.filter((u) => u?.role === "admin").length;
    return { total, active, admins };
  }, [users]);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res?.data?.users || []);
    } catch (e) {
      setUsersError(
        e?.response?.data?.message || e?.message || "Failed to load users",
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    await loadUsers();
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePermission = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setCreateError("Name, email, and password are required.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        permissions: form.permissions,
      };

      const res = await createUser(payload);
      const created = res?.data?.user;

      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        permissions: toInitialPermissions(),
      });

      if (created?._id) {
        setUsers((prev) => [
          created,
          ...prev.filter((u) => u?._id !== created._id),
        ]);
      } else {
        await fetchUsers();
      }
    } catch (e2) {
      setCreateError(
        e2?.response?.data?.message || e2?.message || "Failed to create user",
      );
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (user) => {
    const id = user?._id;
    if (!id) return;

    const ok = window.confirm(
      `Delete user "${user?.email || user?.name || "this user"}"?`,
    );
    if (!ok) return;

    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u?._id !== id));
    } catch (e) {
      alert(
        e?.response?.data?.message || e?.message || "Failed to delete user",
      );
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <DashboardLayout
      title="Users"
      subtitle="Create, manage roles and permissions"
      basePath={basePath}
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="border-b border-slate-200/70 px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">
                Create user
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Add a new team member with fine-grained permissions
              </div>
            </div>

            <form onSubmit={onCreate} className="space-y-4 p-5">
              {createError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {createError}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <div className="text-xs font-medium text-slate-600">Name</div>
                  <input
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                    placeholder="e.g. Ayesha Khan"
                    autoComplete="name"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-medium text-slate-600">Role</div>
                  <select
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <div className="text-xs font-medium text-slate-600">Email</div>
                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <div className="text-xs font-medium text-slate-600">
                  Password
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </label>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
                <div className="text-xs font-semibold text-slate-800">
                  Permissions
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Select what this user can manage
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PERMISSION_FIELDS.map((p) => (
                    <label
                      key={p.key}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(form.permissions[p.key])}
                        onChange={() => togglePermission(p.key)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {p.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className={cx(
                  "inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                  creating ? "opacity-70" : "hover:bg-slate-800",
                )}
              >
                {creating ? "Creating..." : "Create user"}
              </button>
            </form>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Total</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.total}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Active</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.active}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Admins</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.admins}
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  All users
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Manage accounts and permissions
                </div>
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                disabled={loadingUsers}
                className={cx(
                  "inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50",
                  loadingUsers && "opacity-60",
                )}
              >
                {loadingUsers ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {usersError ? (
              <div className="px-5 py-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {usersError}
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-3">Name</th>
                    <th className="whitespace-nowrap px-5 py-3">Email</th>
                    <th className="whitespace-nowrap px-5 py-3">Role</th>
                    <th className="min-w-[240px] px-5 py-3">Permissions</th>
                    <th className="whitespace-nowrap px-5 py-3">Status</th>
                    <th className="whitespace-nowrap px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/70">
                  {loadingUsers ? (
                    [...Array(6)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 w-28 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-44 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-20 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-56 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-16 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-8 w-24 rounded bg-slate-200" />
                        </td>
                      </tr>
                    ))
                  ) : users.length ? (
                    users.map((u) => {
                      const isActive = u?.isActive !== false;
                      const deleting = deletingIds.has(u?._id);
                      return (
                        <tr key={u?._id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {u?.name || "—"}
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {u?.email || "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {u?.role || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {formatPermissions(u?.permissions)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={cx(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
                              )}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => onDelete(u)}
                              disabled={deleting}
                              className={cx(
                                "inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100",
                                deleting && "opacity-60",
                              )}
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center">
                        <div className="text-sm font-semibold text-slate-900">
                          No users found
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Create your first user using the form.
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
