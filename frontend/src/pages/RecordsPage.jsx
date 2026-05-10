import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { createRecord, deleteRecord, getRecords, updateRecord } from "../api/recordApi";

const FIELDS = [
  { key: "category", label: "Category", placeholder: "e.g. Electronics" },
  { key: "subCategory", label: "Sub-category", placeholder: "e.g. Mobile phones" },
  { key: "shortDescription", label: "Short description", placeholder: "A concise summary…" },
  { key: "fullDescription", label: "Full description", placeholder: "Detailed description…" },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function toInitialForm(visibleKeys) {
  return visibleKeys.reduce((acc, k) => {
    acc[k] = "";
    return acc;
  }, {});
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function RecordsPage() {
  const user = useMemo(() => safeParseUser(), []);
  const permissions = user?.permissions || {};

  const visibleFieldKeys = useMemo(() => {
    // Requirement: permissions come from localStorage user.permissions, hide when false
    // If permissions object is missing, default to showing everything for admins/managers;
    // otherwise show only keys with truthy permissions.
    const keys = FIELDS.map((f) => f.key);
    const hasAnyPermissionFlag = keys.some((k) => typeof permissions?.[k] === "boolean");

    if (!hasAnyPermissionFlag) return keys;

    return keys.filter((k) => permissions?.[k] !== false);
  }, [permissions]);

  const visibleFields = useMemo(
    () => FIELDS.filter((f) => visibleFieldKeys.includes(f.key)),
    [visibleFieldKeys],
  );

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => toInitialForm(visibleFieldKeys));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingIds, setDeletingIds] = useState(() => new Set());

  useEffect(() => {
    // keep form keys aligned if permissions change
    setForm((prev) => ({ ...toInitialForm(visibleFieldKeys), ...prev }));
  }, [visibleFieldKeys]);

  const stats = useMemo(() => {
    const total = records.length;
    const mine = records.filter((r) => r?.createdBy?._id && r.createdBy._id === user?._id).length;
    return { total, mine };
  }, [records, user?._id]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getRecords();
      setRecords(res?.data?.records || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFormField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    // allow empty fields; backend defaults to ""
    const payload = visibleFieldKeys.reduce((acc, k) => {
      acc[k] = (form?.[k] || "").toString();
      return acc;
    }, {});

    setSubmitting(true);
    try {
      const res = await createRecord(payload);
      const created = res?.data?.record;

      setForm(toInitialForm(visibleFieldKeys));

      if (created?._id) {
        setRecords((prev) => [created, ...prev.filter((r) => r?._id !== created._id)]);
      } else {
        await fetchAll();
      }
    } catch (e2) {
      setFormError(e2?.response?.data?.message || e2?.message || "Failed to create record");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (record) => {
    setEditingId(record?._id || null);
    const draft = visibleFieldKeys.reduce((acc, k) => {
      acc[k] = record?.[k] || "";
      return acc;
    }, {});
    setEditDraft(draft);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const payload = visibleFieldKeys.reduce((acc, k) => {
        acc[k] = (editDraft?.[k] || "").toString();
        return acc;
      }, {});

      const res = await updateRecord(editingId, payload);
      const updated = res?.data?.record;

      if (updated?._id) {
        setRecords((prev) => prev.map((r) => (r?._id === updated._id ? updated : r)));
      } else {
        await fetchAll();
      }

      cancelEdit();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to update record");
    } finally {
      setSavingEdit(false);
    }
  };

  const onDelete = async (record) => {
    const id = record?._id;
    if (!id) return;

    const ok = window.confirm("Delete this record?");
    if (!ok) return;

    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r?._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to delete record");
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
      title="Records"
      subtitle="Create, edit, and manage records"
      basePath="/admin"
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="border-b border-slate-200/70 px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">
                Create record
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Fields appear based on your permissions
              </div>
            </div>

            <form onSubmit={onCreate} className="space-y-4 p-5">
              {formError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </div>
              ) : null}

              {visibleFields.length ? (
                visibleFields.map((f) => (
                  <label key={f.key} className="block">
                    <div className="text-xs font-medium text-slate-600">{f.label}</div>
                    {f.key === "fullDescription" ? (
                      <textarea
                        value={form[f.key] || ""}
                        onChange={(e) => setFormField(f.key, e.target.value)}
                        rows={5}
                        className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                        placeholder={f.placeholder}
                      />
                    ) : f.key === "shortDescription" ? (
                      <textarea
                        value={form[f.key] || ""}
                        onChange={(e) => setFormField(f.key, e.target.value)}
                        rows={3}
                        className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <input
                        value={form[f.key] || ""}
                        onChange={(e) => setFormField(f.key, e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                        placeholder={f.placeholder}
                      />
                    )}
                  </label>
                ))
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  You don’t have permission to create any record fields.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !visibleFields.length}
                className={cx(
                  "inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                  submitting || !visibleFields.length
                    ? "opacity-70"
                    : "hover:bg-slate-800",
                )}
              >
                {submitting ? "Creating..." : "Create record"}
              </button>
            </form>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Total records</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.total}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="text-xs font-medium text-slate-500">Created by me</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {stats.mine}
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Records</div>
                <div className="mt-1 text-sm text-slate-500">
                  Edit and delete records with modern table controls
                </div>
              </div>
              <button
                type="button"
                onClick={fetchAll}
                disabled={loading}
                className={cx(
                  "inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50",
                  loading && "opacity-60",
                )}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {error ? (
              <div className="px-5 py-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-3">Category</th>
                    <th className="whitespace-nowrap px-5 py-3">Sub-category</th>
                    <th className="min-w-[260px] px-5 py-3">Descriptions</th>
                    <th className="whitespace-nowrap px-5 py-3">Created</th>
                    <th className="whitespace-nowrap px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/70">
                  {loading ? (
                    [...Array(6)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 w-28 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-28 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-64 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-36 rounded bg-slate-200" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-8 w-36 rounded bg-slate-200" />
                        </td>
                      </tr>
                    ))
                  ) : records.length ? (
                    records.map((r) => {
                      const isEditing = editingId === r?._id;
                      const deleting = deletingIds.has(r?._id);
                      return (
                        <tr key={r?._id} className="align-top hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            {isEditing && visibleFieldKeys.includes("category") ? (
                              <input
                                value={editDraft.category || ""}
                                onChange={(e) =>
                                  setEditDraft((p) => ({ ...p, category: e.target.value }))
                                }
                                className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                              />
                            ) : (
                              <div className="font-medium text-slate-900">
                                {r?.category || "—"}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {isEditing && visibleFieldKeys.includes("subCategory") ? (
                              <input
                                value={editDraft.subCategory || ""}
                                onChange={(e) =>
                                  setEditDraft((p) => ({
                                    ...p,
                                    subCategory: e.target.value,
                                  }))
                                }
                                className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                              />
                            ) : (
                              <div className="text-slate-700">
                                {r?.subCategory || "—"}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {isEditing ? (
                              <div className="space-y-2">
                                {visibleFieldKeys.includes("shortDescription") ? (
                                  <textarea
                                    value={editDraft.shortDescription || ""}
                                    onChange={(e) =>
                                      setEditDraft((p) => ({
                                        ...p,
                                        shortDescription: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className="w-full min-w-[260px] resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                                    placeholder="Short description"
                                  />
                                ) : null}

                                {visibleFieldKeys.includes("fullDescription") ? (
                                  <textarea
                                    value={editDraft.fullDescription || ""}
                                    onChange={(e) =>
                                      setEditDraft((p) => ({
                                        ...p,
                                        fullDescription: e.target.value,
                                      }))
                                    }
                                    rows={3}
                                    className="w-full min-w-[260px] resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500/20 focus:ring-4"
                                    placeholder="Full description"
                                  />
                                ) : null}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-slate-900">
                                  {r?.shortDescription || "—"}
                                </div>
                                <div className="text-slate-500 line-clamp-2">
                                  {r?.fullDescription || ""}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            <div>{formatDate(r?.createdAt)}</div>
                            <div className="mt-1 text-xs text-slate-400">
                              {r?.createdBy?.email || r?.createdBy?.name || ""}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            {isEditing ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  disabled={savingEdit}
                                  className={cx(
                                    "inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800",
                                    savingEdit && "opacity-60",
                                  )}
                                >
                                  {savingEdit ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  disabled={savingEdit}
                                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(r)}
                                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDelete(r)}
                                  disabled={deleting}
                                  className={cx(
                                    "inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100",
                                    deleting && "opacity-60",
                                  )}
                                >
                                  {deleting ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <div className="text-sm font-semibold text-slate-900">
                          No records found
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Create your first record using the form.
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

