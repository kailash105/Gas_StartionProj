import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { Layout } from "./components/Layout/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Readings from "./pages/Readings";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Expenses from "./pages/Expenses";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Staff from "./pages/Staff";
import Approvals from "./pages/Approvals";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/readings" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Readings /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Customers /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/customers/:id" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><CustomerDetails /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/expenses" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Expenses /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Attendance /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/leaves" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Leaves /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/approvals" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Approvals /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Layout><Staff /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
