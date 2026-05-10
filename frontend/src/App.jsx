import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import RecordsPage from "./pages/RecordsPage";
import TasksPage from "./pages/TasksPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import UserDashboard from "./pages/UserDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

function AdminRoutes() {
  return <Outlet />;
}

function ManagerRoutes() {
  return <Outlet />;
}

function StaffRoutes() {
  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>

        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={["manager"]}>
              <ManagerRoutes />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>

        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["staff"]}>
              <StaffRoutes />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffDashboard />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute roles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
