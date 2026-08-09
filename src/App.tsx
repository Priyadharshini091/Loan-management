import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { AppDataProvider } from "./context/AppDataContext";
import AddCustomerPage from "./pages/AddCustomerPage";
import AddLoanPage from "./pages/AddLoanPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import CustomersPage from "./pages/CustomersPage";
import DashboardPage from "./pages/DashboardPage";
import LoanDetailsPage from "./pages/LoanDetailsPage";
import LoansPage from "./pages/LoansPage";
import LoginPage from "./pages/LoginPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import ReportPage from "./pages/reports/ReportPage";
import SettingsPage from "./pages/SettingsPage";
import TodayDuePage from "./pages/TodayDuePage";
import UsersPage from "./pages/UsersPage";

function Protected() {
  const authed = localStorage.getItem("loan_demo_auth") === "true";
  return authed ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AppDataProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Protected />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<AddCustomerPage />} />
            <Route path="/customers/:id" element={<CustomerProfilePage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/new" element={<AddLoanPage />} />
            <Route path="/loans/:id" element={<LoanDetailsPage />} />
            <Route path="/collections/today" element={<TodayDuePage />} />
            <Route path="/payments" element={<PaymentHistoryPage />} />
            <Route path="/reports/daily" element={<ReportPage type="daily" />} />
            <Route path="/reports/weekly" element={<ReportPage type="weekly" />} />
            <Route path="/reports/monthly" element={<ReportPage type="monthly" />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppDataProvider>
    </ToastProvider>
  );
}
