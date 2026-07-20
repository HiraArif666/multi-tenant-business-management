import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import BusinessUnits from "../pages/BusinessUnits";
import CompanyTypes from "../pages/CompanyTypes";
import Companies from "../pages/Companies";
import Users from "../pages/Users";
import Profile from "../pages/Profile";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/Layout/AppLayout";

const NotFound = () => <div>404 - Page Not Found</div>;

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Protected Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/business-units" element={<BusinessUnits />} />
        <Route path="/company-types" element={<CompanyTypes />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}