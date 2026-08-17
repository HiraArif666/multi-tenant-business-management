import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import BusinessUnits from "../pages/BusinessUnits";
import BusinessUnitForm from "../pages/BusinessUnitForm";
import CompanyTypes from "../pages/CompanyTypes";
import Companies from "../pages/Companies";
import Users from "../pages/Users";
import UserForm from "../pages/Users/UserForm";
import Profile from "../pages/Profile";
import Roles from "../pages/Roles";
import RoleForm from "../pages/Roles/RoleForm";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/Layout/AppLayout";

import CompanyList from "../pages/MasterData/CompanyList";
import CompanyForm from "../pages/MasterData/CompanyForm";

import Expenses from "../pages/Expenses";
import ExpenseForm from "../pages/Expenses/ExpenseForm";
import ApprovalSettings from "../pages/Settings/ApprovalSettings";

import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import AuditLog from "../pages/AuditLog";
import SecurityLog from "../pages/SecurityLog";
import ImportPage from "../pages/Import";

import ReportsPage from "../pages/Reports";
import ReportViewer from "../pages/Reports/ReportViewer";

import JobScheduler from "../pages/JobScheduler";
import JobScheduleForm from "../pages/JobScheduler/JobScheduleForm";


const NotFound = () => (
  <div>404 - Page Not Found</div>
);

export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* =========================
          PROTECTED ROUTES
      ========================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =========================
            IMPORT
        ========================== */}

        <Route
          path="/import"
          element={<ImportPage />}
        />


        {/* =========================
            REPORTS
        ========================== */}

        <Route
          path="/reports"
          element={<ReportsPage />}
        />

        <Route
          path="/reports/view/:id"
          element={<ReportViewer />}
        />


        {/* =========================
            JOB SCHEDULER
        ========================== */}

        <Route
          path="/settings/job-scheduler"
          element={<JobScheduler />}
        />

        <Route
          path="/settings/job-scheduler/new"
          element={<JobScheduleForm />}
        />

        <Route
          path="/settings/job-scheduler/edit/:id"
          element={<JobScheduleForm />}
        />


        {/* =========================
            AUDIT / SECURITY
        ========================== */}

        <Route
          path="/audit-log"
          element={<AuditLog />}
        />

        <Route
          path="/security-logs"
          element={<SecurityLog />}
        />


        {/* =========================
            EXPENSES
        ========================== */}

        <Route
          path="/expenses"
          element={<Expenses />}
        />

        <Route
          path="/expenses/new"
          element={<ExpenseForm />}
        />

        <Route
          path="/expenses/edit/:id"
          element={<ExpenseForm />}
        />


        {/* =========================
            SETTINGS
        ========================== */}

        <Route
          path="/settings/approval-settings"
          element={<ApprovalSettings />}
        />


        {/* =========================
            BUSINESS UNITS
        ========================== */}

        <Route
          path="/business-units"
          element={<BusinessUnits />}
        />

        <Route
          path="/business-units/new"
          element={<BusinessUnitForm />}
        />

        <Route
          path="/business-units/edit/:id"
          element={<BusinessUnitForm />}
        />


        {/* =========================
            COMPANY TYPES
        ========================== */}

        <Route
          path="/company-types"
          element={<CompanyTypes />}
        />


        {/* =========================
            COMPANIES
        ========================== */}

        <Route
          path="/companies"
          element={<Companies />}
        />


        {/* =========================
            USERS
        ========================== */}

        <Route
          path="/users"
          element={<Users />}
        />

        <Route
          path="/users/new"
          element={<UserForm />}
        />

        <Route
          path="/users/edit/:id"
          element={<UserForm />}
        />


        {/* =========================
            ROLES
        ========================== */}

        <Route
          path="/roles"
          element={<Roles />}
        />

        <Route
          path="/roles/new"
          element={<RoleForm />}
        />

        <Route
          path="/roles/edit/:id"
          element={<RoleForm />}
        />
        
        <Route
          path="/job-scheduler"
          element={<JobScheduler />}
        />

        <Route
          path="/job-scheduler/new"
          element={<JobScheduleForm />}
        />

        <Route
          path="/job-scheduler/edit/:id"
          element={<JobScheduleForm />}
        />

        {/* =========================
            MASTER DATA
        ========================== */}

        <Route
          path="/master-data/:type"
          element={<CompanyList />}
        />

        <Route
          path="/master-data/:type/new"
          element={<CompanyForm />}
        />

        <Route
          path="/master-data/:type/edit/:id"
          element={<CompanyForm />}
        />


        {/* =========================
            PROFILE
        ========================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>


      {/* =========================
          404
      ========================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}