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

const NotFound = () => <div>404 - Page Not Found</div>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

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

        <Route
          path="/company-types"
          element={<CompanyTypes />}
        />

        <Route
          path="/companies"
          element={<Companies />}
        />

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
        
        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}