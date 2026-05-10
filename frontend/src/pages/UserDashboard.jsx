import DashboardLayout from "../components/DashboardLayout";

const UserDashboard = () => {
  return (
    <DashboardLayout title="User Dashboard" basePath="/user">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Welcome</div>
        <div className="mt-1 text-sm text-slate-500">
          Your account overview
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
